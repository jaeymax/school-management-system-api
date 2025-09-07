import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { ICreateFee } from "../interfaces/fee.interface";

export const getAllFees = asyncHandler(async (req: Request, res: Response) => {
  // First update any overdue fees
  await sql`
    UPDATE fees
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE
    AND status IN ('pending', 'partial')
  `;

  // Then get all fees with updated statuses
  const fees = await sql`
    SELECT 
      f.*,
      ft.name as fee_type,
      ft.description as fee_description,
      at.name as academic_term,
      u.username as student_name,
      c.name as class_name,
      f.original_amount + f.arrears_applied as total_payable,
      (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM fee_payments
        WHERE fee_id = f.fee_id
      ) as total_paid,
      (
        SELECT json_agg(
          json_build_object(
            'payment_id', fp.payment_id,
            'amount_paid', fp.amount_paid,
            'payment_date', fp.payment_date,
            'status', fp.status,
            'balance', fp.balance,
            'payment_method', fp.payment_method,
            'transaction_reference', fp.transaction_reference,
            'notes', fp.notes,
            'received_by_name', (
              SELECT username 
              FROM users 
              WHERE user_id = fp.received_by
            )
          )
        )
        FROM fee_payments fp
        WHERE fp.fee_id = f.fee_id
      ) as payments,
      CASE 
        WHEN csf.custom_fee_id IS NOT NULL THEN true 
        ELSE false 
      END as has_custom_fee
    FROM fees f
    JOIN fee_types ft ON f.fee_type_id = ft.fee_type_id
    JOIN fee_class_pricing fcp ON f.fee_class_pricing_id = fcp.pricing_id
    LEFT JOIN academic_terms at ON f.academic_term_id = at.term_id
    JOIN students s ON f.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN classes c ON s.class_id = c.class_id
    LEFT JOIN custom_student_fees csf ON (
      csf.student_id = f.student_id 
      AND csf.fee_type_id = f.fee_type_id
    )
    ORDER BY f.due_date DESC
  `;

  res.status(200).json({
    success: true,
    count: fees.length,
    data: fees,
  });
});

export const getFeeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [fee] = await sql`
    SELECT 
      f.*,
      ft.name as fee_type,
      ft.description as fee_description,
      at.name as academic_term,
      u.username as student_name,
      c.name as class_name,
      f.original_amount + f.arrears_applied as total_payable,
      (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM fee_payments
        WHERE fee_id = f.fee_id
      ) as total_paid
    FROM fees f
    JOIN fee_types ft ON f.fee_type_id = ft.fee_type_id
    JOIN fee_class_pricing fcp ON f.fee_class_pricing_id = fcp.pricing_id
    LEFT JOIN academic_terms at ON f.academic_term_id = at.term_id
    JOIN students s ON f.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN classes c ON s.class_id = c.class_id
    WHERE f.fee_id = ${id}
  `;

  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  // Get payment history
  const payments = await sql`
    SELECT * FROM fee_payments
    WHERE fee_id = ${id}
    ORDER BY payment_date DESC
  `;

  res.status(200).json({
    success: true,
    data: { ...fee, payments },
  });
});

export const createFee = asyncHandler(async (req: Request, res: Response) => {
  const feeData: ICreateFee = req.body;

  // Get student's current arrears if this is a tuition fee
  let arrearsApplied = 0;

  if (feeData.is_tuition) {
    const [student] = await sql`
      SELECT tuition_arrears
      FROM students
      WHERE student_id = ${feeData.student_id}
    `;
    arrearsApplied = student.tuition_arrears;
  }

  // Get the original amount from fee_class_pricing
  const [pricing] = await sql`
    SELECT amount 
    FROM fee_class_pricing 
    WHERE pricing_id = ${feeData.fee_class_pricing_id}
  `;

  const [newFee] = await sql`
    INSERT INTO fees (
      student_id,
      fee_type_id,
      fee_class_pricing_id,
      academic_term_id,
      due_date,
      status,
      is_tuition,
      original_amount,
      arrears_applied
    ) VALUES (
      ${feeData.student_id},
      ${feeData.fee_type_id},
      ${feeData.fee_class_pricing_id},
      ${feeData.academic_term_id || null},
      ${feeData.due_date},
      ${feeData.status || "pending"},
      ${feeData.is_tuition || false},
      ${pricing.amount},
      ${arrearsApplied}
    )
    RETURNING *
  `;

  res.status(201).json({
    success: true,
    message: "Fee record created successfully",
    data: newFee,
  });
});

export const createBulkFees = asyncHandler(
  async (req: Request, res: Response) => {
    const { fee_type_id, academic_term_id, due_date, class_id, student_ids } =
      req.body;

    // Get fee class pricing
    const [pricing] = await sql`
    SELECT * FROM fee_class_pricing 
    WHERE fee_type_id = ${fee_type_id} 
    AND class_id = ${class_id}
  `;

    if (!pricing) {
      res.status(404);
      throw new Error("Fee pricing not found for this class and fee type");
    }

    // Get students either by class_id or specific student_ids
    const students = await sql`
    SELECT student_id 
    FROM students 
    WHERE ${
      student_ids
        ? sql`student_id = ANY(${student_ids})`
        : sql`class_id = ${class_id}`
    }
  `;

    if (students.length === 0) {
      res.status(404);
      throw new Error("No students found");
    }

    // Create fees in transaction
    const [newFees] = await sql.transaction((tx) => {
      const queries = [
        tx`async (tx) => {
          INSERT INTO fees (
            student_id,
            fee_type_id,
            fee_class_pricing_id,
            academic_term_id,
            due_date,
            status
          )
          SELECT 
            s.student_id,
            ${fee_type_id},
            ${pricing.pricing_id},
            ${academic_term_id || null},
            ${due_date},
            'pending'
          FROM unnest(${students.map((s) => s.student_id)}) AS s(student_id)
          RETURNING *
        `,
      ];
      return queries;
    });

    res.status(201).json({
      success: true,
      message: `Created ${newFees.length} fee records successfully`,
      data: newFees,
    });
  }
);

export const createFeesForAllStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      fee_type_id,
      academic_term_id,
      due_date,
      is_tuition = false,
    } = req.body;

    // Get all students with their classes and arrears
    const students = await sql`
      SELECT 
        s.student_id,
        s.class_id,
        s.tuition_arrears
      FROM students s
    `;

    if (students.length === 0) {
      res.status(404);
      throw new Error("No students found in the database");
    }

    // Group students by class for efficient pricing lookup
    const studentsByClass = students.reduce((acc: any, student: any) => {
      if (!acc[student.class_id]) {
        acc[student.class_id] = [];
      }
      acc[student.class_id].push(student);
      return acc;
    }, {});

    // Create fees in transaction
    const [newFees] = await sql.transaction((tx) => {
      const queries: any = [];

      for (const class_id in studentsByClass) {
        const studentsInClass = studentsByClass[class_id];

        queries.push(
          tx`
            WITH pricing AS (
              SELECT pricing_id, amount
              FROM fee_class_pricing 
              WHERE fee_type_id = ${fee_type_id} 
              AND class_id = ${class_id}
            )
            INSERT INTO fees (
              student_id,
              fee_type_id,
              fee_class_pricing_id,
              academic_term_id,
              due_date,
              status,
              is_tuition,
              original_amount,
              arrears_applied
            )
            SELECT 
              s.student_id,
              ${fee_type_id},
              pricing.pricing_id,
              ${academic_term_id || null},
              ${due_date},
              'pending',
              ${is_tuition},
              pricing.amount,
              CASE 
                WHEN ${is_tuition} THEN s.tuition_arrears 
                ELSE 0 
              END
            FROM (
              SELECT 
                student_id,
                tuition_arrears
              FROM unnest(${studentsInClass.map(
                (s: { student_id: any }) => s.student_id
              )}::int[], 
                         ${studentsInClass.map(
                           (s: { tuition_arrears: any }) => s.tuition_arrears
                         )}::decimal[])
              AS s(student_id, tuition_arrears)
            ) s,
            pricing
            WHERE pricing.pricing_id IS NOT NULL
            RETURNING *
          `
        );
      }

      return queries;
    });

    res.status(201).json({
      success: true,
      message: `Created ${newFees.length} fee records successfully`,
      data: newFees,
    });
  }
);

export const updateFee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const [updatedFee] = await sql`
    UPDATE fees
    SET
      due_date = COALESCE(${updateData.due_date}, due_date),
      status = COALESCE(${updateData.status}, status)
    WHERE fee_id = ${id}
    RETURNING *
  `;

  if (!updatedFee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  res.status(200).json({
    success: true,
    message: "Fee record updated successfully",
    data: updatedFee,
  });
});

export const deleteFee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Delete in transaction to ensure all related records are removed
  const [[deletedFee]] = await sql.transaction((tx) => {
    const queries = [
      tx`DELETE FROM fee_payments WHERE fee_id = ${id}`,
      tx`DELETE FROM fees WHERE fee_id = ${id} RETURNING *`,
    ];
    return queries;
  });

  if (!deletedFee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  res.status(200).json({
    success: true,
    message: "Fee record deleted successfully",
    data: deletedFee,
  });
});

export const recordPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const paymentData = req.body;

    // First get fee details and calculate total amount to be paid
    const [feeDetails] = await sql`
    SELECT 
      f.*,
      s.tuition_arrears,
      s.student_id,
      COALESCE(
        (
          SELECT custom_amount 
          FROM custom_student_fees csf 
          WHERE csf.student_id = f.student_id 
          AND csf.fee_type_id = f.fee_type_id
        ),
        (SELECT amount FROM fee_class_pricing WHERE pricing_id = f.fee_class_pricing_id)
      ) + CASE WHEN f.is_tuition THEN COALESCE(f.arrears_applied, 0) ELSE 0 END as total_payable
    FROM fees f
    JOIN students s ON f.student_id = s.student_id
    WHERE f.fee_id = ${id}
  `;

    if (!feeDetails) {
      res.status(404);
      throw new Error("Fee record not found");
    }

    // Get current total paid amount before this payment
    const [currentTotal] = await sql`
    SELECT COALESCE(SUM(amount_paid), 0) as total_paid
    FROM fee_payments
    WHERE fee_id = ${id}
  `;

    const previousBalance = feeDetails.total_payable - currentTotal.total_paid;
    const newBalance = previousBalance - paymentData.amount_paid;

    // Execute transaction with balance tracking
    const [[currentFee, payment, updatedFee, updatedStudent]] =
      await sql.transaction((tx) => [
        // Get current fee state
        tx`SELECT * FROM fees WHERE fee_id = ${id}`,

        // Record payment with running balance
        tx`
      INSERT INTO fee_payments (
        fee_id,
        amount_paid,
        payment_method,
        status,
        transaction_reference,
        received_by,
        notes,
        balance
      ) VALUES (
        ${id},
        ${paymentData.amount_paid},
        ${paymentData.payment_method},
        'completed',
        ${paymentData.transaction_reference || null},
        ${paymentData.received_by || null},
        ${paymentData.notes || null},
        ${newBalance}
      )
      RETURNING *
    `,

        // Update fee status
        tx`
      UPDATE fees 
      SET status = CASE
        WHEN ${newBalance} <= 0 THEN 'paid'
        ELSE 'partial'
      END
      WHERE fee_id = ${id}
      RETURNING *
    `,

        // Update student arrears if this is a tuition fee
        tx`
      UPDATE students s
      SET tuition_arrears = CASE
        WHEN ${feeDetails.is_tuition} THEN 
          GREATEST(0, s.tuition_arrears - ${paymentData.amount_paid})
        ELSE s.tuition_arrears
      END
      WHERE student_id = ${feeDetails.student_id}
      RETURNING *
    `,
      ]);

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        fee: updatedFee,
        payment,
        student: updatedStudent,
        payment_details: {
          amount_paid: paymentData.amount_paid,
          total_payable: feeDetails.total_payable,
          previous_balance: previousBalance,
          new_balance: newBalance,
        },
      },
    });
  }
);

export const getPaymentsByFeeId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payments = await sql`
    SELECT 
      fp.*,
      u.username as received_by_name
    FROM fee_payments fp
    LEFT JOIN users u ON fp.received_by = u.user_id
    WHERE fp.fee_id = ${id}
    ORDER BY fp.payment_date DESC
  `;

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  }
);

export const getPaymentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const [payment] = await sql`
    SELECT 
      fp.*,
      u.username as received_by_name,
      f.student_id,
      COALESCE(
        (
          SELECT custom_amount 
          FROM custom_student_fees csf 
          WHERE csf.student_id = f.student_id 
          AND csf.fee_type_id = f.fee_type_id
        ),
        fcp.amount
      ) as total_fee_amount
    FROM fee_payments fp
    JOIN fees f ON fp.fee_id = f.fee_id
    JOIN fee_class_pricing fcp ON f.fee_class_pricing_id = fcp.pricing_id
    LEFT JOIN users u ON fp.received_by = u.user_id
    WHERE fp.payment_id = ${paymentId}
  `;

    if (!payment) {
      res.status(404);
      throw new Error("Payment not found");
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  }
);

export const updatePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const updateData = req.body;

    const [updatedPayment] = await sql`
    UPDATE fee_payments
    SET
      amount_paid = COALESCE(${updateData.amount_paid}, amount_paid),
      status = COALESCE(${updateData.status}, status),
      transaction_reference = COALESCE(${updateData.transaction_reference}, transaction_reference),
      notes = COALESCE(${updateData.notes}, notes)
    WHERE payment_id = ${paymentId}
    RETURNING *
  `;

    if (!updatedPayment) {
      res.status(404);
      throw new Error("Payment not found");
    }

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  }
);
