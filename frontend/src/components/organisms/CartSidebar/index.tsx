"use client";

import { useEffect, useState } from "react";
import { ICartItem } from "@interfaces/api";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  getCartTotal,
  clearCart,
} from "@utils";
import { CartItemCard } from "@components/molecules/CartItemCard";
import { Button } from "@components/atoms/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@utils";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate?: () => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  onCartUpdate,
}: CartSidebarProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [total, setTotal] = useState(0);

  const loadCart = () => {
    const cart = getCart();
    setCartItems(cart);
    setTotal(getCartTotal());
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    updateCartItemQuantity(productId, quantity);
    loadCart();
    onCartUpdate?.();
  };

  const handleRemove = (productId: number) => {
    removeFromCart(productId);
    loadCart();
    onCartUpdate?.();
  };

  const handleCheckout = () => {
    onClose();
    router.push("/cart");
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear the cart?")) {
      clearCart();
      loadCart();
      onCartUpdate?.();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItemCard
                key={item.product.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-2xl text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            <Button onClick={handleCheckout} className="w-full" size="lg">
              Proceed to Checkout
            </Button>
            <Button
              onClick={handleClearCart}
              variant="outline"
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
