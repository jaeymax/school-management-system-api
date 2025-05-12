"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    // TODO: Implement get all notifications for a user
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id", (req, res) => {
    // TODO: Implement get notification details
    res.status(501).json({ message: "Not implemented yet" });
});
router.post("/", (req, res) => {
    // TODO: Implement send notification
    res.status(501).json({ message: "Not implemented yet" });
});
router.delete("/:id", (req, res) => {
    // TODO: Implement delete notification
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
