import { Router } from "express";
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  recordPayment,
  getPaymentsByFeeId,
  getPaymentById,
  updatePayment,
  createBulkFees,
  createFeesForAllStudents,
} from "../controllers/fee.controller";

const router = Router();

router.get("/", getAllFees);
router.get("/:id", getFeeById);
router.post("/", createFee);
router.put("/:id", updateFee);
router.delete("/:id", deleteFee);
router.post("/:id/payments", recordPayment);

// Payment routes
router.get("/:id/payments", getPaymentsByFeeId);
router.get("/payments/:paymentId", getPaymentById);
router.put("/payments/:paymentId", updatePayment);

router.post("/bulk", createBulkFees);
router.post("/bulk/all-students", createFeesForAllStudents);

export default router;
