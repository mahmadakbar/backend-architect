"use client";

import { IApiResProduct } from "@interfaces/api";
import { Button } from "@components/atoms/button";
import { Image } from "@components/atoms/image";
import { ShoppingCart, Zap } from "lucide-react";
import { formatCurrency } from "@utils";

interface ProductCardProps {
  product: IApiResProduct;
  onAddToCart: (product: IApiResProduct) => void;
  onBuyNow: (product: IApiResProduct) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        {product.category && (
          <span className="text-xs text-gray-500 uppercase">
            {product.category}
          </span>
        )}
        <h3 className="font-semibold text-lg mt-1 line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
          <Button
            onClick={() => onBuyNow(product)}
            disabled={isOutOfStock}
            className="flex-1"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-1" />
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
