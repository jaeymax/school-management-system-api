import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { IStudent } from "../interfaces/student.interface";

export const getAllStudents = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const students = await sql`
      SELECT 
        s.student_id,
        s.user_id,
        s.class_id,
        u.username,
        u.email,
        u.phone,
        u.gender,
        u.is_active,
        u.profile_image,
        c.name as class_name,
        c.description as class_description
      FROM Students s
      JOIN Users u ON s.user_id = u.user_id
      JOIN Classes c ON s.class_id = c.class_id
      ORDER BY u.username
    `;

      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      console.error("Error in getAllStudents:", error);
      throw error;
    }
  }
);

export const getStudentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [student] = await sql`
    SELECT 
      s.student_id,
      s.user_id,
      s.class_id,
      u.username,
      u.email,
      u.phone,
      u.gender,
      u.profile_image,
      c.name as class_name,
      c.description as class_description
    FROM Students s
    JOIN Users u ON s.user_id = u.user_id
    JOIN Classes c ON s.class_id = c.class_id
    WHERE s.student_id = ${id}
  `;

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  }
);

export const getStudentFees = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const fees = await sql`
    SELECT 
      f.*,
      ft.name as fee_type,
      ft.description as fee_description,
      at.name as academic_term
    FROM fees f
    JOIN fee_types ft ON f.fee_type_id = ft.fee_type_id
    LEFT JOIN academic_terms at ON f.academic_term_id = at.term_id
    WHERE f.student_id = ${id}
    ORDER BY f.due_date DESC
  `;

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees,
    });
  }
);

export const getStudentGrades = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Implement after creating grades table
    res.status(501).json({ message: "Not implemented yet" });
  }
);

export const getStudentAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Implement after creating attendance table
    res.status(501).json({ message: "Not implemented yet" });
  }
);

export const updateStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { class_id, ...updateData } = req.body;

    try {
      const [[updatedStudent, updatedClass]] = await sql.transaction((tx) => {
        const queries = [
          tx`
          UPDATE Users u
          SET
            username = COALESCE(${updateData.username}, u.username),
            email = COALESCE(${updateData.email}, u.email),
            phone = COALESCE(${updateData.phone}, u.phone),
            gender = COALESCE(${updateData.gender}, u.gender),
            profile_image = COALESCE(${updateData.profile_image}, u.profile_image)
          FROM Students s
          WHERE s.student_id = ${id}
          AND u.user_id = s.user_id
          RETURNING u.*
        `,
        ];

        if (class_id) {
          queries.push(tx`
          UPDATE Students
          SET class_id = ${class_id}
          WHERE student_id = ${id}
          RETURNING *
        `);
        }

        return queries;
      });

      if (!updatedStudent) {
        res.status(404);
        throw new Error("Student not found");
      }

      res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: {
          user: updatedStudent,
          class: updatedClass,
        },
      });
    } catch (error) {
      console.error("Error in updateStudent:", error);
      throw error;
    }
  }
);

export const deleteStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [[result]] = await sql.transaction((tx) => {
      const queries = [
        tx`SELECT s.*, u.* FROM Students s JOIN Users u ON s.user_id = u.user_id WHERE s.student_id = ${id}`,
      ];

      queries[0].then(([student]) => {
        if (!student) {
          throw new Error("Student not found");
        }
        queries.push(
          tx`DELETE FROM Students WHERE student_id = ${id}`,
          tx`DELETE FROM Users WHERE user_id = ${student.user_id}`,
          tx`SELECT ${student} as deleted_student`
        );
      });

      return queries;
    });

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: result,
    });
  }
);
