"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTokenFromHeader = exports.decodeToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const _configs_1 = require("@configs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generate an access token for a user
 * @param payload User information to encode in the token
 * @returns Signed JWT token
 */
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, _configs_1.env.JWT.SECRET, {
        expiresIn: _configs_1.env.JWT.EXPIRES.ACCESS,
        algorithm: "HS256",
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate a refresh token for a user
 * @param payload User information for the refresh token
 * @returns Signed refresh token
 */
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, _configs_1.env.JWT.REFRESH, {
        expiresIn: _configs_1.env.JWT.EXPIRES.REFRESH,
        algorithm: "HS256",
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify an access token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
    try {
        console.log("Decoded JWT RES:", jsonwebtoken_1.default.verify(token, _configs_1.env.JWT.SECRET || ""), _configs_1.env.JWT.SECRET);
        const decoded = jsonwebtoken_1.default.verify(token, _configs_1.env.JWT.SECRET || "");
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify a refresh token
 * @param token Refresh token to verify
 * @returns Decoded refresh token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, _configs_1.env.JWT.REFRESH || "");
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Decode a token without verification
 * @param token JWT token to decode
 * @returns Decoded token payload or null if invalid format
 */
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (error) {
        return null;
    }
};
exports.decodeToken = decodeToken;
/**
 * Extract the token from the authorization header
 * @param authHeader Authorization header value
 * @returns Token without 'Bearer ' prefix or null if invalid format
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
};
exports.extractTokenFromHeader = extractTokenFromHeader;
//# sourceMappingURL=jwt.util.js.map