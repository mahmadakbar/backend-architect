"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSearchProducts = exports.SGetProducts = exports.SGetProductById = exports.SDeleteProduct = exports.SUpdateProduct = exports.SCreateProduct = void 0;
const prisma_clients_1 = require("@prisma/prisma.clients");
const prisma_1 = require("@prisma/generated/prisma");
const codeGenerator_util_1 = require("@utils/codeGenerator.util");
const SCreateProduct = async (productData) => {
    try {
        // Generate unique product code
        const code = await (0, codeGenerator_util_1.generateProductCode)();
        const product = await prisma_clients_1.prisma.product.create({
            data: {
                code,
                name: productData.name,
                description: productData.description,
                price: new prisma_1.Prisma.Decimal(productData.price),
                stock: productData.stock,
                image: productData.image,
                category: productData.category,
                status: productData.status !== undefined ? productData.status : 1, // Default to active
            },
        });
        return product;
    }
    catch (error) {
        console.error("Product creation error:", error);
        throw error;
    }
};
exports.SCreateProduct = SCreateProduct;
const SUpdateProduct = async (productId, productData) => {
    try {
        // Check if product exists and is not soft deleted
        const existingProduct = await prisma_clients_1.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
                status: { not: 0 }, // Exclude deleted products
            },
        });
        if (!existingProduct) {
            throw new Error(`Product with ID ${productId} not found`);
        }
        const updateData = {};
        if (productData.name !== undefined)
            updateData.name = productData.name;
        if (productData.description !== undefined)
            updateData.description = productData.description;
        if (productData.price !== undefined)
            updateData.price = new prisma_1.Prisma.Decimal(productData.price);
        if (productData.stock !== undefined)
            updateData.stock = productData.stock;
        if (productData.image !== undefined)
            updateData.image = productData.image;
        if (productData.category !== undefined)
            updateData.category = productData.category;
        if (productData.status !== undefined)
            updateData.status = productData.status;
        const product = await prisma_clients_1.prisma.product.update({
            where: { id: productId },
            data: updateData,
        });
        return product;
    }
    catch (error) {
        console.error("Product update error:", error);
        throw error;
    }
};
exports.SUpdateProduct = SUpdateProduct;
const SDeleteProduct = async (productId) => {
    try {
        // Check if product exists and is not already soft deleted
        const existingProduct = await prisma_clients_1.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
                status: { not: 0 },
            },
        });
        if (!existingProduct) {
            throw new Error(`Product with ID ${productId} not found`);
        }
        // Soft delete: set deletedAt and status to 0
        const product = await prisma_clients_1.prisma.product.update({
            where: { id: productId },
            data: {
                deletedAt: new Date(),
                status: 0,
            },
        });
        return product;
    }
    catch (error) {
        console.error("Product delete error:", error);
        throw error;
    }
};
exports.SDeleteProduct = SDeleteProduct;
const SGetProductById = async (productId) => {
    try {
        const product = await prisma_clients_1.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
                status: { not: 0 },
            },
        });
        if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
        }
        return product;
    }
    catch (error) {
        console.error("Product retrieval error:", error);
        throw error;
    }
};
exports.SGetProductById = SGetProductById;
const SGetProducts = async (params) => {
    try {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        // Build where clause
        const whereClause = {
            deletedAt: null,
            status: { not: 0 }, // Exclude deleted products
        };
        // Advanced search by name, description, category, AND code
        if (params.search) {
            whereClause.OR = [
                { name: { contains: params.search, mode: "insensitive" } },
                { description: { contains: params.search, mode: "insensitive" } },
                { category: { contains: params.search, mode: "insensitive" } },
                { code: { contains: params.search, mode: "insensitive" } },
            ];
        }
        // Filter by category
        if (params.category) {
            whereClause.category = {
                equals: params.category,
                mode: "insensitive",
            };
        }
        // Filter by status
        if (params.status !== undefined) {
            whereClause.status = params.status;
        }
        // Filter by date range
        if (params.startDate || params.endDate) {
            whereClause.createdAt = {};
            if (params.startDate) {
                whereClause.createdAt.gte = new Date(params.startDate);
            }
            if (params.endDate) {
                whereClause.createdAt.lte = new Date(params.endDate);
            }
        }
        // Build orderBy clause for sorting
        let orderBy = { createdAt: "desc" }; // Default sort
        if (params.sortBy) {
            const sortOrder = params.sortOrder || "asc";
            switch (params.sortBy) {
                case "date":
                    orderBy = { createdAt: sortOrder };
                    break;
                case "status":
                    orderBy = { status: sortOrder };
                    break;
                case "category":
                    orderBy = { category: sortOrder };
                    break;
                case "name":
                    orderBy = { name: sortOrder };
                    break;
                case "price":
                    orderBy = { price: sortOrder };
                    break;
                case "code":
                    orderBy = { code: sortOrder };
                    break;
                default:
                    orderBy = { createdAt: "desc" };
            }
        }
        // Get total count
        const totalData = await prisma_clients_1.prisma.product.count({
            where: whereClause,
        });
        // Get products with pagination and sorting
        const products = await prisma_clients_1.prisma.product.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy,
        });
        const totalPages = Math.ceil(totalData / limit);
        return {
            products,
            metadata: {
                page,
                limit,
                totalData,
                totalPages,
            },
        };
    }
    catch (error) {
        console.error("Products listing error:", error);
        throw error;
    }
};
exports.SGetProducts = SGetProducts;
const SSearchProducts = async (searchTerm, params) => {
    try {
        return await (0, exports.SGetProducts)({
            ...params,
            search: searchTerm,
        });
    }
    catch (error) {
        console.error("Product search error:", error);
        throw error;
    }
};
exports.SSearchProducts = SSearchProducts;
//# sourceMappingURL=products.service.js.map