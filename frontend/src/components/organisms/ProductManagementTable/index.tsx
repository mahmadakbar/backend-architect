"use client";

import { useEffect, useState, useCallback } from "react";
import { IApiResProduct } from "@interfaces/api";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from "@services/api/products";
import { Button } from "@components/atoms/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@utils";
import { useDebounce } from "@hooks/useDebounce";
import { ProductFormModal } from "./ProductFormModal";
import {
  DataTable,
  Column,
  TableAction,
} from "@components/molecules/DataTable";
import { SearchBar } from "@components/molecules/SearchBar";

export function ProductManagementTable() {
  const [products, setProducts] = useState<IApiResProduct[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IApiResProduct | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    category: "",
    status: "1",
  });

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    const result = await getProducts({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      sortBy: "date",
      sortOrder: "desc",
    });

    if (result.success && "data" in result && result.data) {
      setProducts(result.data.products);
      setTotalPages(result.data.pagination.totalPages);
    }
    setFetching(false);
    setInitialLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const result = await deleteProduct(id);
    if (result.success) {
      fetchProducts();
    } else {
      alert((result as any).error?.message || "Failed to delete product");
    }
  };

  const handleOpenModal = (product?: IApiResProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock.toString(),
        image: product.image || "",
        category: product.category || "",
        status: product.status.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
        category: "",
        status: "1",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image || undefined,
      category: formData.category || undefined,
      status: parseInt(formData.status),
    };

    const result = editingProduct
      ? await updateProduct(editingProduct.id, payload)
      : await createProduct(payload);

    if (result.success) {
      setShowModal(false);
      fetchProducts();
    } else {
      alert((result as any).error?.message || "Failed to save product");
    }
  };

  const getStatusBadge = (status: number) => {
    const styles = {
      0: "bg-red-100 text-red-800",
      1: "bg-green-100 text-green-800",
      2: "bg-yellow-100 text-yellow-800",
    };
    const labels = { 0: "Deleted", 1: "Active", 2: "Inactive" };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Define table columns
  const columns: Column<IApiResProduct>[] = [
    {
      key: "code",
      label: "Code",
    },
    {
      key: "name",
      label: "Name",
      className: "font-medium",
    },
    {
      key: "category",
      label: "Category",
      render: (product) => product.category || "-",
    },
    {
      key: "price",
      label: "Price",
      render: (product) => formatCurrency(product.price),
    },
    {
      key: "stock",
      label: "Stock",
    },
    {
      key: "status",
      label: "Status",
      render: (product) => getStatusBadge(product.status),
    },
  ];

  // Define table actions
  const actions: TableAction<IApiResProduct>[] = [
    {
      icon: <Pencil className="w-4 h-4" />,
      onClick: (product) => handleOpenModal(product),
      variant: "outline",
    },
    {
      icon: <Trash2 className="w-4 h-4 text-white" />,
      onClick: (product) => handleDelete(product.id),
      variant: "destructive",
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
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        actions={actions}
        loading={fetching}
        keyExtractor={(product) => product.id}
        emptyMessage="No products found"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ProductFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
