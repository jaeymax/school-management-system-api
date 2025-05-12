import { Router } from "express";
import {
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherClasses,
} from "../controllers/teacher.controller";

const router = Router();

router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);
router.get("/:id/classes", getTeacherClasses);

export default router;
