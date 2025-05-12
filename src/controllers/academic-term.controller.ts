import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ICreateAcademicTerm } from "../interfaces/academic-term.interface";
import sql from "../config/db";

export const createAcademicTerm = asyncHandler(
  async (req: Request, res: Response) => {
    const termData: ICreateAcademicTerm = req.body;

    try {
      // If this term is set as current, update all other terms to not current
      if (termData.is_current) {
        await sql`
        UPDATE academic_terms 
        SET is_current = false 
        WHERE is_current = true
      `;
      }

      const newTerm = await sql`
      INSERT INTO academic_terms (
        name,
        start_date,
        end_date,
        is_current
      ) VALUES (
        ${termData.name},
        ${termData.start_date},
        ${termData.end_date},
        ${termData.is_current || false}
      )
      RETURNING *
    `;

      res.status(201).json({
        message: "Academic term created successfully",
        term: newTerm[0],
      });
    } catch (error) {
      res.status(400);
      throw error;
    }
  }
);

export const getAllAcademicTerms = asyncHandler(
  async (req: Request, res: Response) => {
    const terms = await sql`
    SELECT * FROM academic_terms
    ORDER BY start_date DESC
  `;

    res.status(200).json(terms);
  }
);

export const getCurrentAcademicTerm = asyncHandler(
  async (req: Request, res: Response) => {
    const currentTerm = await sql`
    SELECT * FROM academic_terms
    WHERE is_current = true
    LIMIT 1
  `;

    if (currentTerm.length === 0) {
      res.status(404);
      throw new Error("No current academic term set");
    }

    res.status(200).json(currentTerm[0]);
  }
);

export const updateAcademicTerm = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: Partial<ICreateAcademicTerm> = req.body;

    try {
      // If updating to make this term current
      if (updateData.is_current) {
        await sql`
        UPDATE academic_terms 
        SET is_current = false 
        WHERE is_current = true
      `;
      }

      const updatedTerm = await sql`
      UPDATE academic_terms 
      SET
        name = COALESCE(${updateData.name}, name),
        start_date = COALESCE(${updateData.start_date}, start_date),
        end_date = COALESCE(${updateData.end_date}, end_date),
        is_current = COALESCE(${updateData.is_current}, is_current)
      WHERE term_id = ${id}
      RETURNING *
    `;

      if (updatedTerm.length === 0) {
        res.status(404);
        throw new Error("Academic term not found");
      }

      res.status(200).json({
        message: "Academic term updated successfully",
        term: updatedTerm[0],
      });
    } catch (error) {
      res.status(400);
      throw error;
    }
  }
);

export const deleteAcademicTerm = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const deletedTerm = await sql`
    DELETE FROM academic_terms
    WHERE term_id = ${id}
    RETURNING *
  `;

    if (deletedTerm.length === 0) {
      res.status(404);
      throw new Error("Academic term not found");
    }

    res.status(200).json({
      message: "Academic term deleted successfully",
      term: deletedTerm[0],
    });
  }
);
