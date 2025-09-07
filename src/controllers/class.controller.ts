import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { IClass, ICreateClass } from "../interfaces/class.interface";

export const getAllClasses = asyncHandler(
  async (req: Request, res: Response) => {
    const classes = await sql`
    SELECT 
      c.*,
      t.teacher_id,
      u.username as teacher_name,
      (
        SELECT COUNT(*)
        FROM Students s
        WHERE s.class_id = c.class_id
      ) as capacity
    FROM Classes c
    LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
    LEFT JOIN Users u ON t.user_id = u.user_id
    ORDER BY c.name
  `;

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  }
);

export const getClassById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [classData] = await sql`
    SELECT 
      c.*,
      t.teacher_id,
      u.username as teacher_name,
      at.name as academic_term_name
    FROM Classes c
    LEFT JOIN Teachers t ON c.teacher_id = t.teacher_id
    LEFT JOIN Users u ON t.user_id = u.user_id
    LEFT JOIN academic_terms at ON c.academic_term_id = at.term_id
    WHERE c.class_id = ${id}
  `;

    if (!classData) {
      res.status(404);
      throw new Error("Class not found");
    }

    res.status(200).json(classData);
  }
);

export const createClass = asyncHandler(async (req: Request, res: Response) => {
  const classData: ICreateClass = req.body;

  const [newClass] = await sql`
    INSERT INTO Classes (
      name,
      description,
      teacher_id
    ) VALUES (
      ${classData.name},
      ${classData.description || null},
     
      ${classData.teacher_id || null}
    )
    RETURNING *
  `;

  res.status(201).json({
    message: "Class created successfully",
    data: newClass,
  });
});

export const updateClass = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: Partial<ICreateClass> = req.body;

  const [updatedClass] = await sql`
    UPDATE Classes
    SET
      name = COALESCE(${updateData.name}, name),
      description = COALESCE(${updateData.description}, description),
      academic_term_id = COALESCE(${updateData.academic_term_id}, academic_term_id),
      teacher_id = COALESCE(${updateData.teacher_id}, teacher_id)
    WHERE class_id = ${id}
    RETURNING *
  `;

  if (!updatedClass) {
    res.status(404);
    throw new Error("Class not found");
  }

  res.status(200).json({
    message: "Class updated successfully",
    data: updatedClass,
  });
});

export const deleteClass = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [deletedClass] = await sql`
    DELETE FROM Classes
    WHERE class_id = ${id}
    RETURNING *
  `;

  if (!deletedClass) {
    res.status(404);
    throw new Error("Class not found");
  }

  res.status(200).json({
    message: "Class deleted successfully",
    data: deletedClass,
  });
});

export const getClassStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const students = await sql`
    SELECT 
      s.student_id,
      u.user_id,
      u.username,
      u.email,
      u.phone,
      u.gender,
      u.profile_image
    FROM Students s
    JOIN Users u ON s.user_id = u.user_id
    WHERE s.class_id = ${id}
    ORDER BY u.username
  `;

    res.status(200).json({
      count: students.length,
      data: students,
    });
  }
);

export const getClassSubjects = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const subjects = await sql`
    SELECT 
      s.subject_id,
      s.subject_name,
      s.subject_code,
      s.description,
      s.is_core,
      cs.class_subject_id
    FROM subjects s
    JOIN class_subjects cs ON s.subject_id = cs.subject_id
    WHERE cs.class_id = ${id}
    ORDER BY s.subject_name
  `;

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  }
);
