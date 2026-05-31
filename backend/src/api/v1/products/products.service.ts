import { prisma } from "@prisma/prisma.clients";
import { Prisma } from "@prisma/generated/prisma";
import { generateProductCode } from "@utils/codeGenerator.util";
import logger from "@configs/logger.configs";

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  status?: number; // 0: deleted, 1: active, 2: inactive
}

export interface IProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image?: string;
  category?: string;
  status?: number; // 0: deleted, 1: active, 2: inactive
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  search?: string; // Search by name, description, category, code
  category?: string;
  status?: number; // Filter by status (0, 1, 2)
  startDate?: string; // Filter by creation date range
  endDate?: string;
  sortBy?: "date" | "status" | "category" | "name" | "price" | "code"; // Sort options
  sortOrder?: "asc" | "desc"; // Sort order
}

export const SCreateProduct = async (
  productData: IProductCreate,
): Promise<any> => {
  try {
    // Generate unique product code
    const code = await generateProductCode();

    const product = await prisma.product.create({
      data: {
        code,
        name: productData.name,
        description: productData.description,
        price: new Prisma.Decimal(productData.price),
        stock: productData.stock,
        image: productData.image,
        category: productData.category,
        status: productData.status !== undefined ? productData.status : 1, // Default to active
      },
    });

    return product;
  } catch (error: any) {
    logger.error(error, "Product creation error");
    throw error;
  }
};

export const SUpdateProduct = async (
  productId: number,
  productData: IProductUpdate,
): Promise<any> => {
  try {
    // Check if product exists and is not soft deleted
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        status: { not: 0 }, // Exclude deleted products
      },
    });

    if (!existingProduct) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const updateData: any = {};
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined)
      updateData.description = productData.description;
    if (productData.price !== undefined)
      updateData.price = new Prisma.Decimal(productData.price);
    if (productData.stock !== undefined) updateData.stock = productData.stock;
    if (productData.image !== undefined) updateData.image = productData.image;
    if (productData.category !== undefined)
      updateData.category = productData.category;
    if (productData.status !== undefined)
      updateData.status = productData.status;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return product;
  } catch (error: any) {
    logger.error(error, "Product update error");
    throw error;
  }
};

export const SDeleteProduct = async (productId: number): Promise<any> => {
  try {
    // Check if product exists and is not already soft deleted
    const existingProduct = await prisma.product.findFirst({
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
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
        status: 0,
      },
    });

    return product;
  } catch (error: any) {
    logger.error(error, "Product delete error");
    throw error;
  }
};

export const SGetProductById = async (productId: number): Promise<any> => {
  try {
    const product = await prisma.product.findFirst({
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
  } catch (error: any) {
    logger.error(error, "Product retrieval error");
    throw error;
  }
};

export const SGetProducts = async (
  params: IPaginationParams,
): Promise<{
  products: any[];
  metadata: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}> => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
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
    let orderBy: any = { createdAt: "desc" }; // Default sort

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
    const totalData = await prisma.product.count({
      where: whereClause,
    });

    // Get products with pagination and sorting
    const products = await prisma.product.findMany({
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
  } catch (error: any) {
    logger.error(error, "Products listing error");
    throw error;
  }
};

export const SSearchProducts = async (
  searchTerm: string,
  params: IPaginationParams,
): Promise<{
  products: any[];
  metadata: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}> => {
  try {
    return await SGetProducts({
      ...params,
      search: searchTerm,
    });
  } catch (error: any) {
    logger.error(error, "Product search error");
    throw error;
  }
};
