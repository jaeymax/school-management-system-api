import { Router } from "express";
import {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentFees,
  getStudentGrades,
  getStudentAttendance,
} from "../controllers/student.controller";

const router = Router();

router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/:id/fees", getStudentFees);
router.get("/:id/grades", getStudentGrades);
router.get("/:id/attendance", getStudentAttendance);

export default router;
