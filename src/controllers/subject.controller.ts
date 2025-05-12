import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { ICreateSubject } from "../interfaces/subject.interface";

export const getAllSubjects = asyncHandler(
  async (req: Request, res: Response) => {
    const subjects = await sql`
    SELECT * FROM subjects
    ORDER BY subject_name ASC
  `;

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  }
);

export const getSubjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [subject] = await sql`
    SELECT s.*, 
      (
        SELECT json_agg(json_build_object(
          'class_id', c.class_id,
          'class_name', c.name
        ))
        FROM class_subjects cs
        JOIN classes c ON cs.class_id = c.class_id
        WHERE cs.subject_id = s.subject_id
      ) as assigned_classes
    FROM subjects s
    WHERE subject_id = ${id}
  `;

    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  }
);

export const createSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const subjectData: ICreateSubject = req.body;

    try {
      const [newSubject] = await sql`
      INSERT INTO subjects (
        subject_name,
        subject_code,
        description,
        is_core
      ) VALUES (
        ${subjectData.subject_name},
        ${subjectData.subject_code},
        ${subjectData.description || null},
        ${subjectData.is_core || false}
      )
      RETURNING *
    `;

      res.status(201).json({
        success: true,
        message: "Subject created successfully",
        data: newSubject,
      });
    } catch (error: any) {
      if (error.constraint === "subjects_subject_code_key") {
        res.status(400);
        throw new Error("Subject code must be unique");
      }
      throw error;
    }
  }
);

export const updateSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedSubject] = await sql`
    UPDATE subjects
    SET
      subject_name = COALESCE(${updateData.subject_name}, subject_name),
      subject_code = COALESCE(${updateData.subject_code}, subject_code),
      description = COALESCE(${updateData.description}, description),
      is_core = COALESCE(${updateData.is_core}, is_core)
    WHERE subject_id = ${id}
    RETURNING *
  `;

    if (!updatedSubject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: updatedSubject,
    });
  }
);

export const deleteSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Delete in transaction to ensure all related records are removed
    const [[deletedSubject]] = await sql.transaction((tx) => {
      const queries = [
        tx`DELETE FROM class_subjects WHERE subject_id = ${id}`,
        tx`DELETE FROM subjects WHERE subject_id = ${id} RETURNING *`,
      ];
      return queries;
    });

    if (!deletedSubject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
      data: deletedSubject,
    });
  }
);

export const assignToClass = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { class_id } = req.body;

    try {
      const [assignment] = await sql`
      INSERT INTO class_subjects (
        class_id,
        subject_id
      ) VALUES (
        ${class_id},
        ${id}
      )
      RETURNING *
    `;

      res.status(201).json({
        success: true,
        message: "Subject assigned to class successfully",
        data: assignment,
      });
    } catch (error: any) {
      if (error.constraint === "class_subjects_class_id_subject_id_key") {
        res.status(400);
        throw new Error("Subject is already assigned to this class");
      }
      throw error;
    }
  }
);

export const removeFromClass = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, classId } = req.params;

    const [removed] = await sql`
    DELETE FROM class_subjects
    WHERE subject_id = ${id} AND class_id = ${classId}
    RETURNING *
  `;

    if (!removed) {
      res.status(404);
      throw new Error("Subject assignment not found");
    }

    res.status(200).json({
      success: true,
      message: "Subject removed from class successfully",
      data: removed,
    });
  }
);
