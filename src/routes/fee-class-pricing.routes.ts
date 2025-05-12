import { Router } from "express";
import {
  getAllFeeClassPricing,
  getFeeClassPricingById,
  createFeeClassPricing,
  updateFeeClassPricing,
  deleteFeeClassPricing,
} from "../controllers/fee-class-pricing.controller";

const router = Router();

router.get("/", getAllFeeClassPricing);
router.get("/:id", getFeeClassPricingById);
router.post("/", createFeeClassPricing);
router.put("/:id", updateFeeClassPricing);
router.delete("/:id", deleteFeeClassPricing);

export default router;
