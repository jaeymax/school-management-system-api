"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    // TODO: Implement get all students
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id", (req, res) => {
    // TODO: Implement get student by id
    res.status(501).json({ message: "Not implemented yet" });
});
router.post("/", (req, res) => {
    // TODO: Implement create student
    res.status(501).json({ message: "Not implemented yet" });
});
router.put("/:id", (req, res) => {
    // TODO: Implement update student
    res.status(501).json({ message: "Not implemented yet" });
});
router.delete("/:id", (req, res) => {
    // TODO: Implement delete student
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id/fees", (req, res) => {
    // TODO: Implement get student fees
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id/grades", (req, res) => {
    // TODO: Implement get student grades
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id/attendance", (req, res) => {
    // TODO: Implement get student attendance
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
