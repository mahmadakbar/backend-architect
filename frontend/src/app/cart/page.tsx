"use client";

import { useEffect, useState } from "react";
import { ICartItem } from "@interfaces/api";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  getCartTotal,
  clearCart,
  formatCurrency,
} from "@utils";
import { createOrder } from "@services/api/orders";
import { CartItemCard } from "@components/molecules/CartItemCard";
import { Button } from "@components/atoms/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@components/molecules/Navbar";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCart = () => {
    const cart = getCart();
    setCartItems(cart);
    setTotal(getCartTotal());
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    updateCartItemQuantity(productId, quantity);
    loadCart();
  };

  const handleRemove = (productId: number) => {
    removeFromCart(productId);
    loadCart();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);
    const orderData = {
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    const result = await createOrder(orderData);
    setLoading(false);

    if (result.success) {
      clearCart();
      alert("Order placed successfully!");
      router.push("/orders");
    } else {
      alert((result as any).error?.message || "Failed to place order");
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <Button onClick={() => router.push("/")} className="mt-4">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>Total:</span>
                  <span className="text-2xl text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
