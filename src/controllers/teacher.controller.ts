import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";
import { ITeacher } from "../interfaces/teacher.interface";

export const getAllTeachers = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // First, let's check if we have any records in the Teachers table
      const teacherCount = await sql`
      SELECT COUNT(*) FROM Teachers
    `;

      console.log("Teacher count:", teacherCount[0].count);

      // Then check if we have any users with teacher role
      const teacherUsers = await sql`
      SELECT COUNT(*) FROM Users WHERE role = 'teacher'
    `;

      console.log("Teacher users count:", teacherUsers[0].count);

      // Now get all teachers with user details
      const teachers = await sql`
      SELECT 
        t.teacher_id, 
        t.user_id,
        u.username, 
        u.email, 
        u.phone, 
        u.gender, 
        u.is_active,
        u.profile_image
      FROM Users u
      LEFT JOIN Teachers t ON t.user_id = u.user_id
      WHERE u.role = 'teacher'
      ORDER BY u.username
    `;

      console.log("Teachers found:", teachers.length);

      res.status(200).json({
        success: true,
        count: teachers.length,
        data: teachers,
      });
    } catch (error) {
      console.error("Error in getAllTeachers:", error);
      throw error;
    }
  }
);

export const getTeacherById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [teacher] = await sql`
    SELECT t.teacher_id, t.user_id, 
           u.username, u.email, u.phone, u.gender, u.profile_image
    FROM Teachers t
    JOIN Users u ON t.user_id = u.user_id
    WHERE t.teacher_id = ${id}
  `;

    if (!teacher) {
      res.status(404);
      throw new Error("Teacher not found");
    }

    res.status(200).json(teacher);
  }
);

export const updateTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedTeacher] = await sql.transaction((sql) => {
      const queries = [
        sql`
      UPDATE Users
      SET
        username = COALESCE(${updateData.username}, username),
        email = COALESCE(${updateData.email}, email),
        phone = COALESCE(${updateData.phone}, phone),
        address = COALESCE(${updateData.address}, address),
        profile_image = COALESCE(${updateData.profile_image}, profile_image)
      FROM Teachers
      WHERE Teachers.teacher_id = ${id}
      AND Users.user_id = Teachers.user_id
      RETURNING Users.*, Teachers.teacher_id
    `,
      ];

      return queries;
    });

    res.status(200).json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  }
);

export const deleteTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [[result]] = await sql.transaction((sql) => {
      const queries = [
        sql`SELECT user_id FROM Teachers WHERE teacher_id = ${id}`,
      ];

      queries[0].then(([teacher]) => {
        if (!teacher) {
          throw new Error("Teacher not found");
        }
        queries.push(
          sql`DELETE FROM Teachers WHERE teacher_id = ${id}`,
          sql`DELETE FROM Users WHERE user_id = ${teacher.user_id}`,
          sql`SELECT ${teacher} as teacher`
        );
      });

      return queries;
    });

    res.status(200).json({
      message: "Teacher deleted successfully",
      teacher: result,
    });
  }
);

export const getTeacherClasses = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const classes = await sql`
    SELECT c.class_id, c.name, c.description, c.academic_term_id
    FROM Classes c
    WHERE c.teacher_id = ${id}
    ORDER BY c.name
  `;

    res.status(200).json(classes);
  }
);
