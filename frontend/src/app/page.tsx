"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@components/molecules/Navbar";
import { ProductList } from "@components/organisms/ProductList";
import { ProductManagementTable } from "@components/organisms/ProductManagementTable";
import { OrderManagementTable } from "@components/organisms/OrderManagementTable";
import { CartSidebar } from "@components/organisms/CartSidebar";
import { getSession } from "@services/session";
import { ShoppingCart } from "lucide-react";
import { Button } from "@components/atoms/button";
import { getCartItemCount } from "@utils";

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setUserRole(session?.role || null);
      setLoading(false);
    };
    fetchSession();
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    setCartCount(getCartItemCount());
    // Dispatch custom event for navbar update
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleCartUpdate = () => {
    updateCartCount();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isUser = userRole === "user";

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <main className="flex flex-col items-center p-4 md:p-8">
        {isAdmin && (
          <div className="w-full max-w-7xl">
            <div className="mb-6 flex gap-4 border-b">
              <button
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "products"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("products")}
              >
                Product Management
              </button>
              <button
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "orders"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                Order Management
              </button>
            </div>

            {activeTab === "products" ? (
              <ProductManagementTable />
            ) : (
              <OrderManagementTable />
            )}
          </div>
        )}

        {isUser && (
          <>
            <div className="w-full max-w-7xl mb-6">
              <h1 className="text-3xl font-bold mb-2">Shop Our Products</h1>
              <p className="text-gray-600">Browse and add items to your cart</p>
            </div>
            <ProductList onCartUpdate={handleCartUpdate} />

            {/* Floating cart button */}
            <Button
              onClick={() => setCartSidebarOpen(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
              size="lg"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Button>

            <CartSidebar
              isOpen={cartSidebarOpen}
              onClose={() => setCartSidebarOpen(false)}
              onCartUpdate={handleCartUpdate}
            />
          </>
        )}

        {!isAdmin && !isUser && (
          <div className="text-center py-12">
            <p className="text-gray-500">Unauthorized role</p>
          </div>
        )}
      </main>
    </div>
  );
}
