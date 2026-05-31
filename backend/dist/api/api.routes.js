"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const v1_routes_1 = __importDefault(require("./v1/v1.routes"));
const router = (0, express_1.Router)();
router.use("/v1", v1_routes_1.default);
exports.default = router;
//# sourceMappingURL=api.routes.js.map