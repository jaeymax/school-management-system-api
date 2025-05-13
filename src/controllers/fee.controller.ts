import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { ICreateFee } from "../interfaces/fee.interface";

export const getAllFees = asyncHandler(async (req: Request, res: Response) => {
  const fees = await sql`
    SELECT 
      f.*,
      ft.name as fee_type,
      ft.description as fee_description,
      at.name as academic_term,
      u.username as student_name,
      c.name as class_name,
      fcp.amount as amount,
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
      ) as payments
    FROM fees f
    JOIN fee_types ft ON f.fee_type_id = ft.fee_type_id
    JOIN fee_class_pricing fcp ON f.fee_class_pricing_id = fcp.pricing_id
    LEFT JOIN academic_terms at ON f.academic_term_id = at.term_id
    JOIN students s ON f.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN classes c ON s.class_id = c.class_id
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
      fcp.amount as fee_amount,
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

  const [newFee] = await sql`
    INSERT INTO fees (
      student_id,
      fee_type_id,
      fee_class_pricing_id,
      academic_term_id,
      due_date,
      status
    ) VALUES (
      ${feeData.student_id},
      ${feeData.fee_type_id},
      ${feeData.fee_class_pricing_id},
      ${feeData.academic_term_id || null},
      ${feeData.due_date},
      ${feeData.status || "pending"}
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
        `
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
    const { fee_type_id, academic_term_id, due_date } = req.body;

    // Get all students with their classes
    const students = await sql`
    SELECT 
      s.student_id,
      s.class_id
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
      acc[student.class_id].push(student.student_id);
      return acc;
    }, {});

    // Create fees in transaction
    const [newFees] = await sql.transaction((tx) => {
      const queries = [];

      for (const class_id in studentsByClass) {
        const studentIds = studentsByClass[class_id];
        
        queries.push(
          tx`
            WITH pricing AS (
              SELECT pricing_id 
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
              status
            )
            SELECT 
              s,
              ${fee_type_id},
              pricing.pricing_id,
              ${academic_term_id || null},
              ${due_date},
              'pending'
            FROM unnest(${studentIds}::int[]) AS s,
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
      amount = COALESCE(${updateData.amount}, amount),
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

    const [[fee, newPayment, updatedFee]] = await sql.transaction((tx) => {
      const queries = [
        tx`
        SELECT f.*, fcp.amount as fee_amount
        FROM fees f
        JOIN fee_class_pricing fcp ON f.fee_class_pricing_id = fcp.pricing_id
        WHERE f.fee_id = ${id}
      `,
        tx`
        INSERT INTO fee_payments (
          fee_id,
          amount_paid,
          payment_method,
          status,
          transaction_reference,
          received_by,
          notes
        ) VALUES (
          ${id},
          ${paymentData.amount_paid},
          ${paymentData.payment_method},
          ${paymentData.status || "completed"},
          ${paymentData.transaction_reference || null},
          ${paymentData.received_by || null},
          ${paymentData.notes || null}
        )
        RETURNING *
      `,
        tx`
        UPDATE fees 
        SET status = CASE
          WHEN (
            SELECT COALESCE(SUM(amount_paid), 0) 
            FROM fee_payments 
            WHERE fee_id = ${id}
          ) >= (
            SELECT amount 
            FROM fee_class_pricing 
            WHERE pricing_id = fees.fee_class_pricing_id
          ) THEN 'paid'
          ELSE status
        END
        WHERE fee_id = ${id}
        RETURNING *
      `,
      ];

      return queries;
    });

    if (!fee) {
      res.status(404);
      throw new Error("Fee record not found");
    }

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: { fee: updatedFee, payment: newPayment },
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
      f.amount as total_fee_amount
    FROM fee_payments fp
    JOIN fees f ON fp.fee_id = f.fee_id
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
