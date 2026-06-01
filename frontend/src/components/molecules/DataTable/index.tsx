"use client";

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

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableAction<T> {
  label?: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "outline" | "destructive" | "ghost";
  className?: string;
  show?: (item: T) => boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  loading?: boolean;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  actions,
  loading = false,
  keyExtractor,
  emptyMessage = "No data available",
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  const showPagination =
    currentPage !== undefined &&
    totalPages !== undefined &&
    onPageChange !== undefined &&
    totalPages > 1;

  // Generate page numbers with ellipsis logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages! <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages!; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage! > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage! - 1);
      const end = Math.min(totalPages! - 1, currentPage! + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage! < totalPages! - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      pages.push(totalPages!);
    }

    return pages;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${column.className || ""}`}
                >
                  {column.label}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key] || "-")}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {actions.map((action, index) => {
                          const shouldShow = action.show
                            ? action.show(item)
                            : true;
                          if (!shouldShow) return null;

                          return (
                            <Button
                              key={index}
                              variant={action.variant || "outline"}
                              size="sm"
                              onClick={() => action.onClick(item)}
                              className={action.className}
                            >
                              {action.icon}
                              {action.label && (
                                <span className={action.icon ? "ml-2" : ""}>
                                  {action.label}
                                </span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <Pagination className="mt-4 justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1 && !loading) {
                    onPageChange(currentPage - 1);
                  }
                }}
                aria-disabled={currentPage === 1 || loading}
                className={
                  currentPage === 1 || loading
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!loading) {
                        onPageChange(page);
                      }
                    }}
                    isActive={currentPage === page}
                    className={
                      loading
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  >
                    {page}
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
                  if (currentPage < totalPages && !loading) {
                    onPageChange(currentPage + 1);
                  }
                }}
                aria-disabled={currentPage === totalPages || loading}
                className={
                  currentPage === totalPages || loading
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
