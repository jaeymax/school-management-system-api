"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const generateReferralCode = () => {
    return crypto_1.default.randomBytes(4).toString("hex").toUpperCase();
};
exports.default = generateReferralCode;
