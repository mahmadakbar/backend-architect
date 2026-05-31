"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSearchProducts = exports.CGetProducts = exports.CGetProductById = exports.CDeleteProduct = exports.CUpdateProduct = exports.CCreateProduct = void 0;
const products_service_1 = require("./products.service");
const axios_1 = require("axios");
const error_utils_1 = require("@utils/error.utils");
const CCreateProduct = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await (0, products_service_1.SCreateProduct)(body);
        res.status(axios_1.HttpStatusCode.Created).json({
            success: true,
            message: "Product created successfully",
            data: result || {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.BadRequest);
    }
};
exports.CCreateProduct = CCreateProduct;
const CUpdateProduct = async (req, res, next) => {
    try {
        const { body, params } = req;
        const productId = Number(params.productId);
        const result = await (0, products_service_1.SUpdateProduct)(productId, body);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Product updated successfully",
            data: result || {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CUpdateProduct = CUpdateProduct;
const CDeleteProduct = async (req, res, next) => {
    try {
        const { params } = req;
        const productId = Number(params.productId);
        await (0, products_service_1.SDeleteProduct)(productId);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Product deleted successfully",
            data: {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CDeleteProduct = CDeleteProduct;
const CGetProductById = async (req, res, next) => {
    try {
        const { params } = req;
        const productId = Number(params.productId);
        const product = await (0, products_service_1.SGetProductById)(productId);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Product retrieved successfully",
            data: product,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CGetProductById = CGetProductById;
const CGetProducts = async (req, res, next) => {
    try {
        const { page, limit, search, category, status, startDate, endDate, sortBy, sortOrder, } = req.query;
        const result = await (0, products_service_1.SGetProducts)({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            search: search,
            category: category,
            status: status ? Number(status) : undefined,
            startDate: startDate,
            endDate: endDate,
            sortBy: sortBy,
            sortOrder: sortOrder,
        });
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Products retrieved successfully",
            data: result.products,
            metadata: result.metadata,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.InternalServerError);
    }
};
exports.CGetProducts = CGetProducts;
const CSearchProducts = async (req, res, next) => {
    try {
        const { search } = req.query;
        const { page, limit, category } = req.query;
        if (!search) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                success: false,
                message: "Search term is required",
                data: {},
            });
        }
        const result = await (0, products_service_1.SSearchProducts)(search, {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            category: category,
        });
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Products search completed",
            data: result.products,
            metadata: result.metadata,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.InternalServerError);
    }
};
exports.CSearchProducts = CSearchProducts;
//# sourceMappingURL=products.controller.js.map