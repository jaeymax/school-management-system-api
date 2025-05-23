"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const student_routes_1 = __importDefault(require("./student.routes"));
const teacher_routes_1 = __importDefault(require("./teacher.routes"));
const class_routes_1 = __importDefault(require("./class.routes"));
const subject_routes_1 = __importDefault(require("./subject.routes"));
const fee_routes_1 = __importDefault(require("./fee.routes"));
const attendance_routes_1 = __importDefault(require("./attendance.routes"));
const grade_routes_1 = __importDefault(require("./grade.routes"));
const parent_routes_1 = __importDefault(require("./parent.routes"));
const report_routes_1 = __importDefault(require("./report.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const search_routes_1 = __importDefault(require("./search.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/students", student_routes_1.default);
router.use("/teachers", teacher_routes_1.default);
router.use("/classes", class_routes_1.default);
router.use("/subjects", subject_routes_1.default);
router.use("/fees", fee_routes_1.default);
router.use("/attendance", attendance_routes_1.default);
router.use("/grades", grade_routes_1.default);
router.use("/parents", parent_routes_1.default);
router.use("/reports", report_routes_1.default);
router.use("/notifications", notification_routes_1.default);
router.use("/search", search_routes_1.default);
exports.default = router;
