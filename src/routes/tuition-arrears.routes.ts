import { Router } from "express";
import {
  recordArrearsPayment,
  getArrearsHistory,
} from "../controllers/tuition-arrears.controller";

const router = Router();

router.post("/student/:student_id/payment", recordArrearsPayment);
router.get("/student/:student_id/history", getArrearsHistory);

export default router;
