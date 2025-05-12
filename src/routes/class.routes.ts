import { Router } from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getClassSubjects,
} from "../controllers/class.controller";

const router = Router();

router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);
router.get("/:id/students", getClassStudents);
router.get("/:id/subjects", getClassSubjects);

export default router;
