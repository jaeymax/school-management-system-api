import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { ICreateFeeType } from "../interfaces/fee-type.interface";

export const getAllFeeTypes = asyncHandler(
  async (req: Request, res: Response) => {
    const feeTypes = await sql`
    SELECT * FROM fee_types 
    ORDER BY name ASC
  `;

    res.status(200).json({
      success: true,
      count: feeTypes.length,
      data: feeTypes,
    });
  }
);

export const getFeeTypeById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [feeType] = await sql`
    SELECT * FROM fee_types WHERE fee_type_id = ${id}
  `;

    if (!feeType) {
      res.status(404);
      throw new Error("Fee type not found");
    }

    res.status(200).json({
      success: true,
      data: feeType,
    });
  }
);

export const createFeeType = asyncHandler(
  async (req: Request, res: Response) => {
    const feeTypeData: ICreateFeeType = req.body;

    const [newFeeType] = await sql`
    INSERT INTO fee_types (
      name,
      description,
      is_recurring
    ) VALUES (
      ${feeTypeData.name},
      ${feeTypeData.description || null},
      ${feeTypeData.is_recurring || false}
    )
    RETURNING *
  `;

    res.status(201).json({
      success: true,
      message: "Fee type created successfully",
      data: newFeeType,
    });
  }
);

export const updateFeeType = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedFeeType] = await sql`
    UPDATE fee_types
    SET
      name = COALESCE(${updateData.name}, name),
      description = COALESCE(${updateData.description}, description),
      is_recurring = COALESCE(${updateData.is_recurring}, is_recurring)
    WHERE fee_type_id = ${id}
    RETURNING *
  `;

    if (!updatedFeeType) {
      res.status(404);
      throw new Error("Fee type not found");
    }

    res.status(200).json({
      success: true,
      message: "Fee type updated successfully",
      data: updatedFeeType,
    });
  }
);

export const deleteFeeType = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [deletedFeeType] = await sql`
    DELETE FROM fee_types
    WHERE fee_type_id = ${id}
    RETURNING *
  `;

    if (!deletedFeeType) {
      res.status(404);
      throw new Error("Fee type not found");
    }

    res.status(200).json({
      success: true,
      message: "Fee type deleted successfully",
      data: deletedFeeType,
    });
  }
);
