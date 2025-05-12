"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    // TODO: Implement get all grade records
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/:id", (req, res) => {
    // TODO: Implement get grade record details
    res.status(501).json({ message: "Not implemented yet" });
});
router.post("/", (req, res) => {
    // TODO: Implement create grade record
    res.status(501).json({ message: "Not implemented yet" });
});
router.put("/:id", (req, res) => {
    // TODO: Implement update grade record
    res.status(501).json({ message: "Not implemented yet" });
});
router.delete("/:id", (req, res) => {
    // TODO: Implement delete grade record
    res.status(501).json({ message: "Not implemented yet" });
});
router.get("/student/:id", (req, res) => {
    // TODO: Implement get grade records for specific student
    res.status(501).json({ message: "Not implemented yet" });
});
exports.default = router;
