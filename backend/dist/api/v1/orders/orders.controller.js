"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCancelOrder = exports.CGetOrderHistory = exports.CGetOrderById = exports.CCreateOrder = void 0;
const orders_service_1 = require("./orders.service");
const axios_1 = require("axios");
const error_utils_1 = require("@utils/error.utils");
const CCreateOrder = async (req, res, next) => {
    try {
        const { body, user } = req;
        if (!user?.id) {
            throw new Error("User not authenticated");
        }
        const result = await (0, orders_service_1.SCreateOrder)(Number(user.id), body);
        res.status(axios_1.HttpStatusCode.Created).json({
            success: true,
            message: "Order created successfully",
            data: result || {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.BadRequest);
    }
};
exports.CCreateOrder = CCreateOrder;
const CGetOrderById = async (req, res, next) => {
    try {
        const { params, user } = req;
        const orderId = Number(params.orderId);
        if (!user?.id || !user?.role) {
            throw new Error("User not authenticated");
        }
        const order = await (0, orders_service_1.SGetOrderById)(orderId, Number(user.id), user.role);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Order retrieved successfully",
            data: order,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CGetOrderById = CGetOrderById;
const CGetOrderHistory = async (req, res, next) => {
    try {
        const { user, query } = req;
        const { page, limit, status, search, startDate, endDate, sortBy, sortOrder, } = query;
        if (!user?.id || !user?.role) {
            throw new Error("User not authenticated");
        }
        const result = await (0, orders_service_1.SGetOrderHistory)(Number(user.id), user.role, {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            status: status,
            search: search,
            startDate: startDate,
            endDate: endDate,
            sortBy: sortBy,
            sortOrder: sortOrder,
        });
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Order history retrieved successfully",
            data: result.orders,
            metadata: result.metadata,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.InternalServerError);
    }
};
exports.CGetOrderHistory = CGetOrderHistory;
const CCancelOrder = async (req, res, next) => {
    try {
        const { params, user } = req;
        const orderId = Number(params.orderId);
        if (!user?.id || !user?.role) {
            throw new Error("User not authenticated");
        }
        const result = await (0, orders_service_1.SCancelOrder)(orderId, Number(user.id), user.role);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Order cancelled successfully",
            data: result || {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.BadRequest);
    }
};
exports.CCancelOrder = CCancelOrder;
//# sourceMappingURL=orders.controller.js.map