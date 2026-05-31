"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = void 0;
const _configs_1 = require("@configs");
// Helper function to set authentication cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: _configs_1.env.BRANCH === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/", // Make cookie available for all paths
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: _configs_1.env.BRANCH === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/", // Make cookie available for all paths
    });
};
exports.setAuthCookies = setAuthCookies;
// Helper function to clear authentication cookies
const clearAuthCookies = (res) => {
    res.cookie("accessToken", "", {
        httpOnly: true,
        secure: _configs_1.env.BRANCH === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
    });
    res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: _configs_1.env.BRANCH === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
    });
};
exports.clearAuthCookies = clearAuthCookies;
//# sourceMappingURL=cookies.helper.js.map