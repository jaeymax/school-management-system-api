import { Router } from "express";
import {
  getAllDailyFeeding,
  createDailyFeeding,
  createBulkDailyFeeding,
  createBulkDailyFeedingForAllStudents,
  updateDailyFeeding,
  deleteDailyFeeding,
  recordFeedingPayment,
  getDailyFeedingById,
} from "../controllers/daily-feeding.controller";

const router = Router();

router.get("/", getAllDailyFeeding);
router.post("/", createDailyFeeding);
router.post("/bulk", createBulkDailyFeeding);
router.post("/bulk/all-students", createBulkDailyFeedingForAllStudents);
router.put("/:id", updateDailyFeeding);
router.delete("/:id", deleteDailyFeeding);
router.post("/:id/payments", recordFeedingPayment);
router.get("/:id", getDailyFeedingById);

export default router;
