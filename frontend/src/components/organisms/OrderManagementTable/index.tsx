"use client";

import { useEffect, useState, useCallback } from "react";
import { IApiResOrder } from "@interfaces/api";
import { getOrderHistory, cancelOrder } from "@services/api/orders";
import { Button } from "@components/atoms/button";
import { Eye, XCircle } from "lucide-react";
import { formatCurrency } from "@utils";
import { useDebounce } from "@hooks/useDebounce";
import { OrderDetailsModal } from "./OrderDetailsModal";
import {
  DataTable,
  Column,
  TableAction,
} from "@components/molecules/DataTable";
import { SearchBar } from "@components/molecules/SearchBar";

export function OrderManagementTable() {
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
        className={`px-2 py-1 rounded text-xs font-semibold ${styles[status as keyof typeof styles]}`}
      >
        {status}
      </span>
    );
  };

  // Define table columns
  const columns: Column<IApiResOrder>[] = [
    {
      key: "code",
      label: "Order Code",
      className: "font-medium",
    },
    {
      key: "user",
      label: "Customer",
      render: (order) =>
        order.user ? (
          <div>
            <div className="font-medium">{order.user.name}</div>
            <div className="text-gray-500 text-xs">{order.user.username}</div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      key: "totalAmount",
      label: "Total",
      className: "font-semibold",
      render: (order) => formatCurrency(order.totalAmount),
    },
    {
      key: "status",
      label: "Status",
      render: (order) => getStatusBadge(order.status),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (order) => new Date(order.createdAt).toLocaleDateString(),
    },
  ];

  // Define table actions
  const actions: TableAction<IApiResOrder>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (order) => setSelectedOrder(order),
      variant: "outline",
    },
    {
      icon: <XCircle className="w-4 h-4" />,
      onClick: (order) => handleCancelOrder(order.id),
      variant: "destructive",
      show: (order) => order.status === "PENDING",
    },
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
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

      <DataTable
        columns={columns}
        data={orders}
        actions={actions}
        loading={fetching}
        keyExtractor={(order) => order.id}
        emptyMessage="No orders found"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
