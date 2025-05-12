import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { ICreateFeeClassPricing } from "../interfaces/fee-class-pricing.interface";

export const getAllFeeClassPricing = asyncHandler(
  async (req: Request, res: Response) => {
    const pricing = await sql`
    SELECT 
      fcp.*,
      ft.name as fee_type_name,
      c.name as class_name
    FROM fee_class_pricing fcp
    JOIN fee_types ft ON fcp.fee_type_id = ft.fee_type_id
    JOIN classes c ON fcp.class_id = c.class_id
    ORDER BY ft.name, c.name
  `;

    res.status(200).json({
      success: true,
      count: pricing.length,
      data: pricing,
    });
  }
);

export const getFeeClassPricingById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [pricing] = await sql`
    SELECT 
      fcp.*,
      ft.name as fee_type_name,
      c.name as class_name
    FROM fee_class_pricing fcp
    JOIN fee_types ft ON fcp.fee_type_id = ft.fee_type_id
    JOIN classes c ON fcp.class_id = c.class_id
    WHERE fcp.pricing_id = ${id}
  `;

    if (!pricing) {
      res.status(404);
      throw new Error("Pricing not found");
    }

    res.status(200).json({
      success: true,
      data: pricing,
    });
  }
);

export const createFeeClassPricing = asyncHandler(
  async (req: Request, res: Response) => {
    const pricingData: ICreateFeeClassPricing = req.body;

    try {
      const [newPricing] = await sql`
      INSERT INTO fee_class_pricing (
        fee_type_id,
        class_id,
        amount
      ) VALUES (
        ${pricingData.fee_type_id},
        ${pricingData.class_id},
        ${pricingData.amount}
      )
      RETURNING *
    `;

      res.status(201).json({
        success: true,
        message: "Fee class pricing created successfully",
        data: newPricing,
      });
    } catch (error: any) {
      if (error.constraint === "fee_class_pricing_fee_type_id_class_id_key") {
        res.status(400);
        throw new Error(
          "Pricing already exists for this fee type and class combination"
        );
      }
      throw error;
    }
  }
);

export const updateFeeClassPricing = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount } = req.body;

    const [updatedPricing] = await sql`
    UPDATE fee_class_pricing
    SET amount = ${amount}
    WHERE pricing_id = ${id}
    RETURNING *
  `;

    if (!updatedPricing) {
      res.status(404);
      throw new Error("Pricing not found");
    }

    res.status(200).json({
      success: true,
      message: "Fee class pricing updated successfully",
      data: updatedPricing,
    });
  }
);

export const deleteFeeClassPricing = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [deletedPricing] = await sql`
    DELETE FROM fee_class_pricing
    WHERE pricing_id = ${id}
    RETURNING *
  `;

    if (!deletedPricing) {
      res.status(404);
      throw new Error("Pricing not found");
    }

    res.status(200).json({
      success: true,
      message: "Fee class pricing deleted successfully",
      data: deletedPricing,
    });
  }
);
