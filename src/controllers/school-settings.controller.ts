import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sql from "../config/db";

export const getSchoolSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const [settings] = await sql`
    SELECT * FROM school_settings 
    ORDER BY created_at DESC 
    LIMIT 1
  `;

    if (!settings) {
      res.status(404);
      throw new Error("School settings not found");
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  }
);

export const updateSchoolSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const updateData = req.body;

    const [settings] = await sql`
    SELECT id FROM school_settings 
    ORDER BY created_at DESC 
    LIMIT 1
  `;

    let updatedSettings;

    if (!settings) {
      // Create new settings if none exist
      [updatedSettings] = await sql`
      INSERT INTO school_settings (
        school_name,
        academic_year,
        address,
        phone,
        email,
        timezone,
        date_format,
        system_theme
      ) VALUES (
        ${updateData.school_name},
        ${updateData.academic_year},
        ${updateData.address},
        ${updateData.phone},
        ${updateData.email},
        ${updateData.timezone},
        ${updateData.date_format},
        ${updateData.system_theme}
      )
      RETURNING *
    `;
    } else {
      // Update existing settings
      [updatedSettings] = await sql`
      UPDATE school_settings
      SET
        school_name = COALESCE(${updateData.school_name}, school_name),
        academic_year = COALESCE(${updateData.academic_year}, academic_year),
        address = COALESCE(${updateData.address}, address),
        phone = COALESCE(${updateData.phone}, phone),
        email = COALESCE(${updateData.email}, email),
        timezone = COALESCE(${updateData.timezone}, timezone),
        date_format = COALESCE(${updateData.date_format}, date_format),
        system_theme = COALESCE(${updateData.system_theme}, system_theme),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${settings.id}
      RETURNING *
    `;
    }

    res.status(200).json({
      success: true,
      message: settings
        ? "Settings updated successfully"
        : "Settings created successfully",
      data: updatedSettings,
    });
  }
);
