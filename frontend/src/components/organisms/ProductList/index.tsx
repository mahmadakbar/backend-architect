"use client";

import { useEffect, useState, useCallback } from "react";
import { IApiResProduct, ICartItem } from "@interfaces/api";
import { getProducts } from "@services/api/products";
import { ProductCard } from "@components/molecules/ProductCard";
import { addToCart } from "@utils";
import { Button } from "@components/atoms/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@components/atoms/pagination";
import { SearchBar } from "@components/molecules/SearchBar";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@hooks/useDebounce";

interface ProductListProps {
  onCartUpdate?: (cart: ICartItem[]) => void;
}

export function ProductList({ onCartUpdate }: ProductListProps) {
  const router = useRouter();
  const [products, setProducts] = useState<IApiResProduct[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    const result = await getProducts({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      category: category || undefined,
      status: 1, // Only active products
      sortBy: "name",
      sortOrder: "asc",
    });

    if (result.success && "data" in result && result.data) {
      setProducts(result.data.products);
      setTotalPages(result.data.pagination.totalPages);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(
          result.data.products
            .map((p: IApiResProduct) => p.category)
            .filter(Boolean),
        ),
      ) as string[];
      setCategories(uniqueCategories);
    }
    setFetching(false);
    setInitialLoading(false);
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product: IApiResProduct) => {
    const updatedCart = addToCart(product, 1);
    onCartUpdate?.(updatedCart);
  };

  const handleBuyNow = (product: IApiResProduct) => {
    const updatedCart = addToCart(product, 1);
    onCartUpdate?.(updatedCart);
    router.push("/cart");
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (page !== 1) setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  // Generate page numbers with ellipsis logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis-start");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto relative">
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search products..."
        />
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {fetching && !initialLoading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full shadow-lg p-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1 && !fetching) {
                        setPage(page - 1);
                      }
                    }}
                    aria-disabled={page === 1 || fetching}
                    className={
                      page === 1 || fetching
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) =>
                  typeof pageNum === "number" ? (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!fetching) {
                            setPage(pageNum);
                          }
                        }}
                        isActive={page === pageNum}
                        className={
                          fetching
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages && !fetching) {
                        setPage(page + 1);
                      }
                    }}
                    aria-disabled={page === totalPages || fetching}
                    className={
                      page === totalPages || fetching
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
