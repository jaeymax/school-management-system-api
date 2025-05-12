import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import {
  ICreateDailyFeeding,
  IBulkDailyFeeding,
  ICreateDailyFeedingPayment,
} from "../interfaces/daily-feeding.interface";

export const getAllDailyFeeding = asyncHandler(
  async (req: Request, res: Response) => {
    const { date } = req.query;

    let baseQuery = sql`
    SELECT 
      df.*,
      u.username as student_name,
      c.name as class_name,
      fcp.amount as fee_amount,
      COALESCE(
        (SELECT SUM(amount_paid) FROM daily_fee_payments WHERE feeding_id = df.feeding_id), 
        0
      ) as total_paid,
      (
        SELECT json_agg(
          json_build_object(
            'payment_id', dfp.payment_id,
            'amount_paid', dfp.amount_paid,
            'payment_date', dfp.payment_date,
            'payment_method', dfp.payment_method,
            'transaction_reference', dfp.transaction_reference,
            'notes', dfp.notes,
            'received_by_name', (
              SELECT username FROM users WHERE user_id = dfp.received_by
            )
          )
        )
        FROM daily_fee_payments dfp
        WHERE dfp.feeding_id = df.feeding_id
      ) as payments
    FROM daily_feeding_fees df
    JOIN students s ON df.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN classes c ON s.class_id = c.class_id
    JOIN fee_class_pricing fcp ON df.fee_class_pricing_id = fcp.pricing_id
  `;

  // Add date filter if provided
  let finalQuery;
  if (date) {
    // Ensure date is in the correct format
    finalQuery = sql`${baseQuery} WHERE df.date = '2025-05-05'`;
    console.log("Date filter applied:", date);
  }
  else {
    // query without the date
    finalQuery = baseQuery
  }

  // Add ordering
 // query = sql`${query} ORDER BY df.date DESC, u.username`;

  try {
    const feeding = await finalQuery;
    
    res.status(200).json({
      success: true,
      count: feeding?.length,
      data: feeding,
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch daily feeding records');
  }
});

export const getDailyFeedingById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [feeding] = await sql`
    SELECT 
      df.*,
      u.username as student_name,
      c.name as class_name,
      fcp.amount as fee_amount,
      (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM daily_fee_payments
        WHERE feeding_id = df.feeding_id
      ) as total_paid
    FROM daily_feeding_fees df
    JOIN students s ON df.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN classes c ON s.class_id = c.class_id
    JOIN fee_class_pricing fcp ON df.fee_class_pricing_id = fcp.pricing_id
    WHERE df.feeding_id = ${id}
  `;

    if (!feeding) {
      res.status(404);
      throw new Error("Daily feeding record not found");
    }

    // Get payment history
    const payments = await sql`
    SELECT 
      dfp.*,
      u.username as received_by_name
    FROM daily_fee_payments dfp
    LEFT JOIN users u ON dfp.received_by = u.user_id
    WHERE dfp.feeding_id = ${id}
    ORDER BY dfp.payment_date DESC
  `;

    res.status(200).json({
      success: true,
      data: { ...feeding, payments },
    });
  }
);

export const createDailyFeeding = asyncHandler(
  async (req: Request, res: Response) => {
    const feedingData: ICreateDailyFeeding = req.body;

    const [newFeeding] = await sql`
    INSERT INTO daily_feeding_fees (
      fee_class_pricing_id,
      academic_term_id,
      student_id,
      date,
      status,
      notes
    ) VALUES (
      ${feedingData.fee_class_pricing_id},
      ${feedingData.academic_term_id},
      ${feedingData.student_id},
      ${feedingData.date},
      ${feedingData.status || "unpaid"},
      ${feedingData.notes || null}
    )
    RETURNING *
  `;

    res.status(201).json({
      success: true,
      message: "Daily feeding record created successfully",
      data: newFeeding,
    });
  }
);

export const createBulkDailyFeeding = asyncHandler(
  async (req: Request, res: Response) => {
    const { fee_type_id, academic_term_id, due_date } = req.body;

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

    const studentsByClass = students.reduce((acc: any, student: any) => {
      if (!acc[student.class_id]) {
        acc[student.class_id] = [];
      }
      acc[student.class_id].push(student.student_id);
      return acc;
    }, {});

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
          INSERT INTO daily_feeding_fees (
            student_id,
            fee_class_pricing_id,
            academic_term_id,
            date,
            status
          )
          SELECT 
            s,
            pricing.pricing_id,
            ${academic_term_id || null},
            ${due_date},
            'unpaid'::varchar
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
      message: `Created ${newFees.length} feeding records successfully`,
      data: newFees,
    });
  }
);

export const createBulkDailyFeedingForAllStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { fee_type_id, academic_term_id, date } = req.body;

    // Get all students with their classes
    const students = await sql`
    SELECT s.student_id, s.class_id
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

    // Handle all inserts in a single transaction
    const [newFeedings] = await sql.transaction((tx) => {
      const queries = [];

      for (const class_id in studentsByClass) {
        queries.push(tx`
          WITH pricing AS (
            SELECT pricing_id 
            FROM fee_class_pricing 
            WHERE fee_type_id = ${fee_type_id} 
            AND class_id = ${class_id}
          )
          INSERT INTO daily_feeding_fees (
            student_id,
            fee_class_pricing_id,
            academic_term_id,
            date,
            status
          )
          SELECT 
            s,
            pricing.pricing_id,
            ${academic_term_id},
            ${date},
            'unpaid'
          FROM unnest(${studentsByClass[class_id]}::int[]) AS s,
          pricing
          WHERE pricing.pricing_id IS NOT NULL
          RETURNING *
        `);
      }

      return queries;
    });

    res.status(201).json({
      success: true,
      message: `Created ${newFeedings.length} feeding records successfully`,
      data: newFeedings,
    });
  }
);

export const updateDailyFeeding = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedFeeding] = await sql`
    UPDATE daily_feeding_fees
    SET
      status = COALESCE(${updateData.status}, status),
      notes = COALESCE(${updateData.notes}, notes)
    WHERE feeding_id = ${id}
    RETURNING *
  `;

    if (!updatedFeeding) {
      res.status(404);
      throw new Error("Feeding record not found");
    }

    res.status(200).json({
      success: true,
      message: "Feeding record updated successfully",
      data: updatedFeeding,
    });
  }
);

export const deleteDailyFeeding = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [deletedFeeding] = await sql`
    DELETE FROM daily_feeding_fees
    WHERE feeding_id = ${id}
    RETURNING *
  `;

    if (!deletedFeeding) {
      res.status(404);
      throw new Error("Feeding record not found");
    }

    res.status(200).json({
      success: true,
      message: "Feeding record deleted successfully",
      data: deletedFeeding,
    });
  }
);

export const recordFeedingPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const paymentData: ICreateDailyFeedingPayment = req.body;

    const [[feeding, newPayment, updatedFeeding]] = await sql.transaction(
      (tx) => {
        const queries = [
          tx`
        SELECT df.*, fcp.amount as fee_amount
        FROM daily_feeding_fees df
        JOIN fee_class_pricing fcp ON df.fee_class_pricing_id = fcp.pricing_id
        WHERE df.feeding_id = ${id}
      `,
          tx`
        INSERT INTO daily_fee_payments (
          feeding_id,
          amount_paid,
          payment_method,
          transaction_reference,
          received_by,
          notes
        ) VALUES (
          ${id},
          ${paymentData.amount_paid},
          ${paymentData.payment_method},
          ${paymentData.transaction_reference || null},
          ${paymentData.received_by || null},
          ${paymentData.notes || null}
        )
        RETURNING *
      `,
          tx`
        UPDATE daily_feeding_fees 
        SET status = CASE
          WHEN ${paymentData.amount_paid} >= (
            SELECT amount 
            FROM fee_class_pricing 
            WHERE pricing_id = daily_feeding_fees.fee_class_pricing_id
          ) THEN 'paid'
          ELSE status
        END
        WHERE feeding_id = ${id}
        RETURNING *
      `,
        ];

        return queries;
      }
    );

    if (!feeding) {
      res.status(404);
      throw new Error("Feeding record not found");
    }

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: { feeding: updatedFeeding, payment: newPayment },
    });
  }
);
