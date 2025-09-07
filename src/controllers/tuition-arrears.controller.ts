import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";

export const recordArrearsPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { student_id } = req.params;
    const { amount_paid, term_id, notes } = req.body;
    const recorded_by = null; // Assuming you have user info in request

    const [[student, arrearsRecord, updatedStudent]] = await sql.transaction(
      (tx) => {
        return [
          tx`
        SELECT tuition_arrears
        FROM students
        WHERE student_id = ${student_id}
      `,
          tx`
        INSERT INTO tuition_arrears_history (
          student_id,
          term_id,
          previous_arrears,
          amount_paid,
          new_arrears,
          recorded_by,
          notes
        )
        VALUES (
          ${student_id},
          ${term_id},
          (SELECT tuition_arrears FROM students WHERE student_id = ${student_id}),
          ${amount_paid},
          (SELECT tuition_arrears FROM students WHERE student_id = ${student_id}) - ${amount_paid},
          ${recorded_by},
          ${notes}
        )
        RETURNING *
      `,
          tx`
        UPDATE students
        SET tuition_arrears = tuition_arrears - ${amount_paid}
        WHERE student_id = ${student_id}
        RETURNING *
      `,
        ];
      }
    );

    res.status(200).json({
      success: true,
      message: "Arrears payment recorded successfully",
      data: { arrearsRecord, currentArrears: updatedStudent.tuition_arrears },
    });
  }
);

export const getArrearsHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { student_id } = req.params;

    const history = await sql`
    SELECT 
      ah.*,
      at.name as term_name,
      u.username as recorded_by_name
    FROM tuition_arrears_history ah
    JOIN academic_terms at ON ah.term_id = at.term_id
    LEFT JOIN users u ON ah.recorded_by = u.user_id
    WHERE ah.student_id = ${student_id}
    ORDER BY ah.recorded_at DESC
  `;

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  }
);
