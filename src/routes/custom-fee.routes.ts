import { Router } from "express";
import {
  getAllCustomFees,
  getCustomFeesByStudent,
  createCustomFee,
  updateCustomFee,
  deleteCustomFee,
} from "../controllers/custom-fee.controller";

const router = Router();

router.get("/", getAllCustomFees);
router.get("/student/:student_id", getCustomFeesByStudent);
router.post("/", createCustomFee);
router.put("/:custom_fee_id", updateCustomFee);
router.delete("/:custom_fee_id", deleteCustomFee);

export default router;
