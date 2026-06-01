"use client";

import { UserNav } from "@components/molecules/UserNav";
import { useGetSession } from "@services/query/session";
import { CheckSquare, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCartItemCount, RBACWrapper } from "@utils";
import { Button } from "@components/atoms/button";

export function Navbar() {
  const { data: session } = useGetSession();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    updateCartCount();

    // Update cart count when storage changes
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  if (!session) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          <span className="font-bold text-xl">E-Commerce</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <RBACWrapper allowedRoles={["user"]}>
            <Link href="/orders">
              <Button variant="ghost" size="sm">
                <Package className="h-5 w-5 mr-2" />
                Orders
              </Button>
            </Link>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </RBACWrapper>
          <UserNav />
        </div>
      </div>
    </div>
  );
}
