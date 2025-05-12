"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    // TODO: Implement get all classes
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id", (req, res) => {
    // TODO: Implement get class details
    res.status(501).json({ message: "Not implemented yet" });
});
router.post("/", (req, res) => {
    // TODO: Implement create class
    res.status(501).json({ message: "Not implemented yet" });
});
router.put("/:id", (req, res) => {
    // TODO: Implement update class
    res.status(501).json({ message: "Not implemented yet" });
});
router.delete("/:id", (req, res) => {
    // TODO: Implement delete class
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id/students", (req, res) => {
    // TODO: Implement get students in class
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id/subjects", (req, res) => {
    // TODO: Implement get subjects for class
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
