"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/students", (req, res) => {
    // TODO: Implement search students by name, class, etc.
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/teachers", (req, res) => {
    // TODO: Implement search teachers by name or subject
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/parents", (req, res) => {
    // TODO: Implement search parents by name or student
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
