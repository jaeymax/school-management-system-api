import { Router } from "express";
import {
  getSchoolSettings,
  updateSchoolSettings,
} from "../controllers/school-settings.controller";

const router = Router();

router.get("/", getSchoolSettings);
router.put("/", updateSchoolSettings);

export default router;
