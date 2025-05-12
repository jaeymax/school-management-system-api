import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { IUser, IUserCreate } from "../interfaces/user.interface";
import sql from "../config/db";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userData: IUserCreate = req.body;
    const classId = req.body.class_id;

    // Basic validation
    if (!userData.username || !userData.role || !userData.gender) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // Additional validation for admin and teacher roles
    if (
      (userData.role === "admin" || userData.role === "teacher") &&
      (!userData.email || !userData.password)
    ) {
      res.status(400);
      throw new Error(
        "Email and password are required for admin and teacher accounts"
      );
    }

    // Validate class_id for students
    if (userData.role === "student" && !classId) {
      res.status(400);
      throw new Error("Class ID is required for student registration");
    }

    try {
      // Check if email exists (only if email is provided)
      if (userData.email) {
        const existingUser = await sql`
      SELECT email FROM Users WHERE email = ${userData.email}
    `;

        if (existingUser.length > 0) {
          res.status(400);
          throw new Error("User already exists with this email");
        }
      }

      // Using transaction with array of queries
      const [[user, relatedRecord]] = await sql.transaction((tx) => {
        const queries = [
          tx`
          INSERT INTO Users (
            username,
            password,
            email,
            role,
            phone,
            address,
            date_of_birth,
            gender,
            profile_image
          ) VALUES (
            ${userData.username},
            ${userData.password || null},
            ${userData.email || null},
            ${userData.role},
            ${userData.phone || null},
            ${userData.address || null},
            ${userData.date_of_birth || null},
            ${userData.gender},
            ${userData.profile_image || null}
          )
          RETURNING *
        `,
        ];

        // Add related record query based on role
        if (userData.role === "student") {
          queries.push(tx`
          INSERT INTO Students (user_id, class_id)
          VALUES ((SELECT user_id FROM Users WHERE username = ${userData.username} ORDER BY created_at DESC LIMIT 1), ${classId})
          RETURNING *
        `);
        } else if (userData.role === "teacher") {
          queries.push(tx`
          INSERT INTO teachers (user_id)
          VALUES ((SELECT user_id FROM Users WHERE username = ${userData.username} ORDER BY created_at DESC LIMIT 1))
          RETURNING *
        `);
        }

        return queries;
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword,
        relatedRecord,
      });
    } catch (error) {
      console.error("Error in registerUser:", error);
      if (error instanceof Error) {
        res.status(400);
        throw new Error(error.message);
      }
      throw error;
    }
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // TODO: Implement user login logic
  res.status(200).json({ message: "Login successful" });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement user logout logic
  res.status(200).json({ message: "Logout successful" });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    // TODO: Implement forgot password logic
    res.status(200).json({ message: "Password reset link sent" });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    // TODO: Implement reset password logic
    res.status(200).json({ message: "Password reset successful" });
  }
);

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement get user profile logic
    res.status(200).json({ message: "User profile retrieved" });
  }
);

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userData: Partial<IUserCreate> = req.body;
    // TODO: Implement update user profile logic
    res.status(200).json({ message: "Profile updated successfully" });
  }
);

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const users = await sql`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.role,
        u.phone,
        u.address,
        u.date_of_birth,
        u.gender,
        u.profile_image,
        u.is_active,
        u.created_at,
        u.updated_at,
        CASE 
          WHEN u.role = 'student' THEN s.student_id
          WHEN u.role = 'teacher' THEN t.teacher_id
          ELSE null
        END as role_id,
        CASE 
          WHEN u.role = 'student' THEN c.name
          ELSE null
        END as class_name
      FROM Users u
      LEFT JOIN Students s ON u.user_id = s.user_id
      LEFT JOIN Teachers t ON u.user_id = t.user_id
      LEFT JOIN Classes c ON s.class_id = c.class_id
      ORDER BY u.created_at DESC
    `;

    // Remove password from each user
    const safeUsers = users.map(({ password, ...user }) => user);

    res.status(200).json({
      success: true,
      count: users.length,
      data: safeUsers,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw error;
  }
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [user] = await sql`
    SELECT 
      u.user_id,
      u.username,
      u.email,
      u.role,
      u.phone,
      u.address,
      u.date_of_birth,
      u.gender,
      u.profile_image,
      u.is_active,
      u.created_at,
      u.updated_at,
      CASE 
        WHEN u.role = 'student' THEN s.student_id
        WHEN u.role = 'teacher' THEN t.teacher_id
        ELSE null
      END as role_id,
      CASE 
        WHEN u.role = 'student' THEN c.name
        ELSE null
      END as class_name
    FROM Users u
    LEFT JOIN Students s ON u.user_id = s.user_id
    LEFT JOIN Teachers t ON u.user_id = t.user_id
    LEFT JOIN Classes c ON s.class_id = c.class_id
    WHERE u.user_id = ${id}
  `;

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    data: userWithoutPassword,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: Partial<IUserCreate> = req.body;
  const classId = req.body.class_id;

  try {
    // Check if user exists
    const [existingUser] = await sql`
      SELECT role FROM Users WHERE user_id = ${id}
    `;

    if (!existingUser) {
      res.status(404);
      throw new Error("User not found");
    }

    // Using transaction with array of queries
    const [[updatedUser, relatedRecord]] = await sql.transaction((tx) => {
      const queries = [
        tx`
          UPDATE Users
          SET
            username = COALESCE(${updateData.username}, username),
            email = COALESCE(${updateData.email}, email),
            phone = COALESCE(${updateData.phone}, phone),
            address = COALESCE(${updateData.address}, address),
            date_of_birth = COALESCE(${updateData.date_of_birth}, date_of_birth),
            gender = COALESCE(${updateData.gender}, gender),
            profile_image = COALESCE(${updateData.profile_image}, profile_image)
          WHERE user_id = ${id}
          RETURNING *
        `,
      ];

      // Add related record query based on role
      if (existingUser.role === "student" && classId) {
        queries.push(tx`
          UPDATE Students
          SET class_id = ${classId}
          WHERE user_id = ${id}
          RETURNING *
        `);
      } else if (existingUser.role === "teacher") {
        // Check if teacher record exists, if not create it
        queries.push(tx`
          INSERT INTO Teachers (user_id)
          VALUES (${id})
          ON CONFLICT (user_id) DO UPDATE
          SET user_id = EXCLUDED.user_id
          RETURNING *
        `);
      }

      return queries;
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: userWithoutPassword,
        relatedRecord,
      },
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // First check if user exists and get their role
    const [existingUser] = await sql`
      SELECT role FROM Users WHERE user_id = ${id}
    `;

    if (!existingUser) {
      res.status(404);
      throw new Error("User not found");
    }

    // Delete user and related records in transaction
    const [[deletedUser]] = await sql.transaction((tx) => {
      const queries = [
        // Store user data before deletion
        tx`SELECT * FROM Users WHERE user_id = ${id}`,
      ];

      // Add role-specific deletion queries
      if (existingUser.role === "student") {
        queries.push(
          tx`DELETE FROM Students WHERE user_id = ${id}`,
          tx`DELETE FROM Users WHERE user_id = ${id}`
        );
      } else if (existingUser.role === "teacher") {
        queries.push(
          // Update classes to remove teacher reference
          tx`UPDATE Classes SET teacher_id = null WHERE teacher_id IN (
            SELECT teacher_id FROM Teachers WHERE user_id = ${id}
          )`,
          tx`DELETE FROM Teachers WHERE user_id = ${id}`,
          tx`DELETE FROM Users WHERE user_id = ${id}`
        );
      } else {
        // For admin or other roles
        queries.push(tx`DELETE FROM Users WHERE user_id = ${id}`);
      }

      return queries;
    });

    if (!deletedUser) {
      res.status(404);
      throw new Error("User deletion failed");
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = deletedUser;

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
});
