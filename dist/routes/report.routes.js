"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/fees", (req, res) => {
    // TODO: Implement generate fee report
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/attendance", (req, res) => {
    // TODO: Implement generate attendance report
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/grades", (req, res) => {
    // TODO: Implement generate grade report
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
