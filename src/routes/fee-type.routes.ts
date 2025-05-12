import { Router } from "express";
import {
  getAllFeeTypes,
  getFeeTypeById,
  createFeeType,
  updateFeeType,
  deleteFeeType,
} from "../controllers/fee-type.controller";

const router = Router();



router.get("/", getAllFeeTypes);
router.get("/:id", getFeeTypeById);
router.post("/", createFeeType);
router.put("/:id", updateFeeType);
router.delete("/:id", deleteFeeType);

export default router;
