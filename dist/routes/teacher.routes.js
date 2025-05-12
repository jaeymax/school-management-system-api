"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    // TODO: Implement get all teachers
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id", (req, res) => {
    // TODO: Implement get teacher by id
    res.status(501).json({ message: "Not implemented yet" });
});
router.post("/", (req, res) => {
    // TODO: Implement create teacher
    res.status(501).json({ message: "Not implemented yet" });
});
router.put("/:id", (req, res) => {
    // TODO: Implement update teacher
    res.status(501).json({ message: "Not implemented yet" });
});
router.delete("/:id", (req, res) => {
    // TODO: Implement delete teacher
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id/classes", (req, res) => {
    // TODO: Implement get classes taught by teacher
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
