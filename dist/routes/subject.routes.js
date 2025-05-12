"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    // TODO: Implement get all subjects
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id", (req, res) => {
    // TODO: Implement get subject details
    res.status(501).json({ message: "Not implemented yet" });
});
router.post("/", (req, res) => {
    // TODO: Implement create subject
    res.status(501).json({ message: "Not implemented yet" });
});
router.put("/:id", (req, res) => {
    // TODO: Implement update subject
    res.status(501).json({ message: "Not implemented yet" });
});
router.delete("/:id", (req, res) => {
    // TODO: Implement delete subject
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
