"use client";

import { ICartItem } from "@interfaces/api";
import { Button } from "@components/atoms/button";
import { Image } from "@components/atoms/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@utils";

interface CartItemCardProps {
  item: ICartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const { product, quantity } = item;
  const itemTotal = parseFloat(product.price) * quantity;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      onUpdateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg bg-white">
      <div className="relative w-24 h-24 bg-gray-100 rounded shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover rounded"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        {product.category && (
          <span className="text-xs text-gray-500">{product.category}</span>
        )}
        <p className="text-lg font-bold text-primary mt-1">
          {formatCurrency(product.price)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={quantity >= product.stock}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(product.id)}
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Subtotal</p>
        <p className="text-xl font-bold">{formatCurrency(itemTotal)}</p>
      </div>
    </div>
  );
}
