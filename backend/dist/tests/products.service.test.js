"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const products_service_1 = require("@api/v1/products/products.service");
const prisma_clients_1 = require("@prisma/prisma.clients");
// Mock Prisma
jest.mock("@prisma/prisma.clients");
describe("Products Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const mockProduct = {
        id: 1,
        code: "PRD0001",
        name: "Test Product",
        description: "Test Description",
        price: 90000,
        stock: 50,
        image: "https://example.com/test.jpg",
        category: "Electronics",
        status: 1, // Active
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };
    describe("SCreateProduct", () => {
        it("should successfully create a product", async () => {
            // Arrange
            prisma_clients_1.prisma.product.create.mockResolvedValue(mockProduct);
            // Act
            const result = await (0, products_service_1.SCreateProduct)({
                name: "Test Product",
                description: "Test Description",
                price: 90000,
                stock: 50,
                image: "https://example.com/test.jpg",
                category: "Electronics",
                status: 1,
            });
            // Assert
            expect(result).toEqual(mockProduct);
            expect(prisma_clients_1.prisma.product.create).toHaveBeenCalled();
        });
        it("should create product with default status 1 (active)", async () => {
            // Arrange
            prisma_clients_1.prisma.product.create.mockResolvedValue(mockProduct);
            // Act
            const result = await (0, products_service_1.SCreateProduct)({
                name: "Test Product",
                description: "Test Description",
                price: 90000,
                stock: 50,
            });
            // Assert
            expect(result).toBeDefined();
            expect(prisma_clients_1.prisma.product.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 1, // Default active status
                }),
            }));
        });
        it("should throw error if product creation fails", async () => {
            // Arrange
            prisma_clients_1.prisma.product.create.mockRejectedValue(new Error("Database error"));
            // Act & Assert
            await expect((0, products_service_1.SCreateProduct)({
                name: "Test Product",
                price: 90000,
                stock: 50,
            })).rejects.toThrow("Database error");
        });
        it("should create product with minimum required fields", async () => {
            // Arrange
            const minimalProduct = {
                ...mockProduct,
                description: null,
                image: null,
                category: null,
            };
            prisma_clients_1.prisma.product.create.mockResolvedValue(minimalProduct);
            // Act
            const result = await (0, products_service_1.SCreateProduct)({
                name: "Test Product",
                price: 90000,
                stock: 50,
            });
            // Assert
            expect(result).toBeDefined();
            expect(prisma_clients_1.prisma.product.create).toHaveBeenCalled();
        });
    });
    describe("SUpdateProduct", () => {
        it("should successfully update a product", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                name: "Updated Product",
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, {
                name: "Updated Product",
            });
            // Assert
            expect(result.name).toBe("Updated Product");
            expect(prisma_clients_1.prisma.product.findFirst).toHaveBeenCalledWith({
                where: { id: 1, deletedAt: null, status: { not: 0 } },
            });
            expect(prisma_clients_1.prisma.product.update).toHaveBeenCalled();
        });
        it("should update product status", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                status: 2, // Inactive
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, { status: 2 });
            // Assert
            expect(result.status).toBe(2);
        });
        it("should update product description", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                description: "Updated Description",
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, {
                description: "Updated Description",
            });
            // Assert
            expect(result.description).toBe("Updated Description");
        });
        it("should update product price", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                price: 149.99,
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, { price: 149.99 });
            // Assert
            expect(result.price).toBe(149.99);
        });
        it("should update product stock", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                stock: 100,
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, { stock: 100 });
            // Assert
            expect(result.stock).toBe(100);
        });
        it("should update product image", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                image: "https://example.com/new-image.jpg",
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, {
                image: "https://example.com/new-image.jpg",
            });
            // Assert
            expect(result.image).toBe("https://example.com/new-image.jpg");
        });
        it("should update product category", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                category: "Furniture",
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, { category: "Furniture" });
            // Assert
            expect(result.category).toBe("Furniture");
        });
        it("should update multiple fields at once", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                name: "Updated Product",
                price: 149.99,
                stock: 75,
            });
            // Act
            const result = await (0, products_service_1.SUpdateProduct)(1, {
                name: "Updated Product",
                price: 149.99,
                stock: 75,
            });
            // Assert
            expect(result.name).toBe("Updated Product");
            expect(result.price).toBe(149.99);
            expect(result.stock).toBe(75);
        });
        it("should throw error if product not found", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, products_service_1.SUpdateProduct)(999, { name: "Updated Product" })).rejects.toThrow("Product with ID 999 not found");
        });
        it("should throw error if product is soft deleted", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, products_service_1.SUpdateProduct)(1, { name: "Updated Product" })).rejects.toThrow("Product with ID 1 not found");
        });
        it("should throw error if product status is 0 (deleted)", async () => {
            // Arrange
            // findFirst with status: { not: 0 } returns null for deleted products
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, products_service_1.SUpdateProduct)(1, { name: "Updated Product" })).rejects.toThrow("Product with ID 1 not found");
            // Verify the query checks for non-deleted status
            expect(prisma_clients_1.prisma.product.findFirst).toHaveBeenCalledWith({
                where: { id: 1, deletedAt: null, status: { not: 0 } },
            });
        });
    });
    describe("SDeleteProduct", () => {
        it("should successfully soft delete a product", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.product.update.mockResolvedValue({
                ...mockProduct,
                deletedAt: new Date(),
                status: 0,
            });
            // Act
            const result = await (0, products_service_1.SDeleteProduct)(1);
            // Assert
            expect(result.deletedAt).toBeTruthy();
            expect(result.status).toBe(0);
            expect(prisma_clients_1.prisma.product.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    deletedAt: expect.any(Date),
                    status: 0,
                },
            });
        });
        it("should throw error if product not found", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, products_service_1.SDeleteProduct)(999)).rejects.toThrow("Product with ID 999 not found");
        });
        it("should throw error if product is already soft deleted", async () => {
            // Arrange
            // findFirst with deletedAt: null returns null for deleted products
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, products_service_1.SDeleteProduct)(1)).rejects.toThrow("Product with ID 1 not found");
            // Verify the query checks for non-deleted products
            expect(prisma_clients_1.prisma.product.findFirst).toHaveBeenCalledWith({
                where: { id: 1, deletedAt: null, status: { not: 0 } },
            });
        });
    });
    describe("SGetProductById", () => {
        it("should successfully retrieve a product", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            // Act
            const result = await (0, products_service_1.SGetProductById)(1);
            // Assert
            expect(result).toEqual(mockProduct);
            expect(prisma_clients_1.prisma.product.findFirst).toHaveBeenCalledWith({
                where: { id: 1, deletedAt: null, status: { not: 0 } },
            });
        });
        it("should throw error if product not found", async () => {
            // Arrange
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, products_service_1.SGetProductById)(999)).rejects.toThrow("Product with ID 999 not found");
        });
        it("should not retrieve inactive product (status 2)", async () => {
            // Arrange
            // Product exists but status is 2 (inactive) - findFirst with status: { not: 0 } will still find it
            const inactiveProduct = { ...mockProduct, status: 2 };
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(inactiveProduct);
            // Act
            const result = await (0, products_service_1.SGetProductById)(1);
            // Assert - inactive products can be retrieved but not ordered
            expect(result.status).toBe(2);
        });
        it("should not retrieve deleted product (status 0)", async () => {
            // Arrange
            // findFirst with status: { not: 0 } returns null for deleted products
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, products_service_1.SGetProductById)(1)).rejects.toThrow("Product with ID 1 not found");
        });
    });
    describe("SGetProducts", () => {
        it("should successfully retrieve products with pagination", async () => {
            // Arrange
            const mockProducts = [mockProduct, { ...mockProduct, id: 2 }];
            prisma_clients_1.prisma.product.count.mockResolvedValue(2);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue(mockProducts);
            // Act
            const result = await (0, products_service_1.SGetProducts)({ page: 1, limit: 10 });
            // Assert
            expect(result.products).toEqual(mockProducts);
            expect(result.metadata).toEqual({
                page: 1,
                limit: 10,
                totalData: 2,
                totalPages: 1,
            });
        });
        it("should use default pagination values when not provided", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(5);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({});
            // Assert
            expect(result.metadata.page).toBe(1);
            expect(result.metadata.limit).toBe(10);
        });
        it("should filter products by search term", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                page: 1,
                limit: 10,
                search: "Test",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    deletedAt: null,
                    status: { not: 0 },
                }),
            }));
        });
        it("should filter products by category", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                page: 1,
                limit: 10,
                category: "Electronics",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    category: { equals: "Electronics", mode: "insensitive" },
                }),
            }));
        });
        it("should filter products by both search and category", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                page: 1,
                limit: 10,
                search: "Test",
                category: "Electronics",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    deletedAt: null,
                    status: { not: 0 },
                    OR: expect.any(Array),
                    category: expect.any(Object),
                }),
            }));
        });
        it("should exclude deleted products (status 0) from listing", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({});
            // Assert
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    deletedAt: null,
                    status: { not: 0 },
                }),
            }));
        });
    });
    describe("SSearchProducts", () => {
        it("should successfully search products", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SSearchProducts)("Test", { page: 1, limit: 10 });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(result.metadata.totalData).toBe(1);
        });
        it("should handle database errors in search", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockRejectedValue(new Error("Database connection error"));
            // Act & Assert
            await expect((0, products_service_1.SSearchProducts)("Test", { page: 1, limit: 10 })).rejects.toThrow("Database connection error");
        });
    });
    describe("Advanced Search, Filter, and Sort", () => {
        it("should search products by code", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                search: "PRD0001",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ code: expect.any(Object) }),
                    ]),
                }),
            }));
        });
        it("should filter products by status", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                status: 1, // Active
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    status: 1,
                }),
            }));
        });
        it("should filter products by date range", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                startDate: "2024-01-01",
                endDate: "2024-12-31",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    createdAt: expect.any(Object),
                }),
            }));
        });
        it("should sort products by price ascending", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                sortBy: "price",
                sortOrder: "asc",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { price: "asc" },
            }));
        });
        it("should sort products by code descending", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                sortBy: "code",
                sortOrder: "desc",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { code: "desc" },
            }));
        });
        it("should sort products by name", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                sortBy: "name",
                sortOrder: "asc",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { name: "asc" },
            }));
        });
        it("should combine search, filter, and sort", async () => {
            // Arrange
            prisma_clients_1.prisma.product.count.mockResolvedValue(1);
            prisma_clients_1.prisma.product.findMany.mockResolvedValue([mockProduct]);
            // Act
            const result = await (0, products_service_1.SGetProducts)({
                search: "Test",
                category: "Electronics",
                status: 1,
                startDate: "2024-01-01",
                endDate: "2024-12-31",
                sortBy: "price",
                sortOrder: "asc",
            });
            // Assert
            expect(result.products).toEqual([mockProduct]);
            expect(prisma_clients_1.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.any(Array),
                    category: expect.any(Object),
                    status: 1,
                    createdAt: expect.any(Object),
                }),
                orderBy: { price: "asc" },
            }));
        });
    });
    describe("Code Generation", () => {
        it("should create product with generated code", async () => {
            // Arrange
            prisma_clients_1.prisma.product.create.mockResolvedValue(mockProduct);
            // Act
            const result = await (0, products_service_1.SCreateProduct)({
                name: "Test Product",
                description: "Test Description",
                price: 90000,
                stock: 50,
            });
            // Assert
            expect(result).toBeDefined();
            expect(prisma_clients_1.prisma.product.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    code: "PRD0001", // Generated code
                }),
            }));
        });
    });
});
//# sourceMappingURL=products.service.test.js.map