import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";

export const getAllCustomFees = asyncHandler(
  async (req: Request, res: Response) => {
    const customFees = await sql`
    SELECT 
      cf.*,
      ft.name as fee_type_name,
      u.username as student_name
    FROM custom_student_fees cf
    JOIN fee_types ft ON cf.fee_type_id = ft.fee_type_id
    JOIN students s ON cf.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    ORDER BY cf.due_date DESC
  `;
    res.status(200).json({ success: true, data: customFees });
  }
);

export const getCustomFeesByStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { student_id } = req.params;
    const customFees = await sql`
    SELECT cf.*, ft.name as fee_type_name
    FROM custom_student_fees cf
    JOIN fee_types ft ON cf.fee_type_id = ft.fee_type_id
    WHERE cf.student_id = ${student_id}
  `;
    res.status(200).json({ success: true, data: customFees });
  }
);

export const createCustomFee = asyncHandler(
  async (req: Request, res: Response) => {
    const { student_id, fee_type_id, custom_amount, due_date, notes } =
      req.body;

    const [newCustomFee] = await sql`
    INSERT INTO custom_student_fees (
      student_id, fee_type_id, custom_amount, due_date, notes
    ) VALUES (
      ${student_id}, ${fee_type_id}, ${custom_amount}, ${due_date}, ${notes}
    )
    RETURNING *
  `;

    res.status(201).json({ success: true, data: newCustomFee });
  }
);

export const updateCustomFee = asyncHandler(
  async (req: Request, res: Response) => {
    const { custom_fee_id } = req.params;
    const { custom_amount, due_date, notes } = req.body;

    const [updatedFee] = await sql`
    UPDATE custom_student_fees
    SET 
      custom_amount = COALESCE(${custom_amount}, custom_amount),
      due_date = COALESCE(${due_date}, due_date),
      notes = COALESCE(${notes}, notes)
    WHERE custom_fee_id = ${custom_fee_id}
    RETURNING *
  `;

    if (!updatedFee) {
      res.status(404);
      throw new Error("Custom fee not found");
    }

    res.status(200).json({ success: true, data: updatedFee });
  }
);

export const deleteCustomFee = asyncHandler(
  async (req: Request, res: Response) => {
    const { custom_fee_id } = req.params;

    const [deletedFee] = await sql`
    DELETE FROM custom_student_fees
    WHERE custom_fee_id = ${custom_fee_id}
    RETURNING *
  `;

    if (!deletedFee) {
      res.status(404);
      throw new Error("Custom fee not found");
    }

    res.status(200).json({ success: true, data: deletedFee });
  }
);
