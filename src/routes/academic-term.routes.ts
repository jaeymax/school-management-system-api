import { Router } from "express";
import {
  createAcademicTerm,
  getAllAcademicTerms,
  getCurrentAcademicTerm,
  updateAcademicTerm,
  deleteAcademicTerm,
} from "../controllers/academic-term.controller";

const router = Router();

router.post("/", createAcademicTerm);
router.get("/", getAllAcademicTerms);
router.get("/current", getCurrentAcademicTerm);
router.put("/:id", updateAcademicTerm);
router.delete("/:id", deleteAcademicTerm);

export default router;
