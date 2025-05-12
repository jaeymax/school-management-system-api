import { Router } from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignToClass,
  removeFromClass,
} from "../controllers/subject.controller";

const router = Router();

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);
router.post("/:id/classes", assignToClass);
router.delete("/:id/classes/:classId", removeFromClass);

export default router;
