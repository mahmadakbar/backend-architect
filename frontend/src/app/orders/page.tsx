"use client";

import { useEffect, useState, useCallback } from "react";
import { IApiResOrder } from "@interfaces/api";
import { getOrderHistory, cancelOrder } from "@services/api/orders";
import { Button } from "@components/atoms/button";
import { Navbar } from "@components/molecules/Navbar";
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
import { Package, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@utils";
import { useDebounce } from "@hooks/useDebounce";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<IApiResOrder[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IApiResOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    setFetching(true);
    const result = await getOrderHistory({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      sortBy: "date",
      sortOrder: "desc",
    });

    if (result.success && "data" in result && result.data) {
      setOrders(result.data.orders);
      setTotalPages(result.data.pagination.totalPages);
    }
    setFetching(false);
    setInitialLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    const result = await cancelOrder(id);
    if (result.success) {
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
    } else {
      alert((result as any).error?.message || "Failed to cancel order");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}
      >
        {status}
      </span>
    );
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
      <div className="min-h-screen bg-muted/40">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8 relative">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm relative">
          {fetching && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <h1 className="text-2xl font-bold mb-6">Order History</h1>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search orders..."
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-lg">{order.code}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-bold text-lg">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      {order.orderItems.length} item(s)
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-6 justify-end">
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
      </main>

      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Order Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Code</p>
                    <p className="font-semibold">{selectedOrder.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-semibold text-lg text-primary">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {item.product?.name ||
                              `Product #${item.product_id}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Subtotal:{" "}
                            {formatCurrency(
                              parseFloat(item.price) * item.quantity,
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedOrder.status === "PENDING" && (
                    <Button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      Cancel Order
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedOrder(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
