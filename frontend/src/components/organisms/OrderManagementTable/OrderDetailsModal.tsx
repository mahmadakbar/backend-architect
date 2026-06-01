"use client";

import { IApiResOrder } from "@interfaces/api";
import { Button } from "@components/atoms/button";
import { formatCurrency } from "@utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/atoms/dialog";

interface OrderDetailsModalProps {
  order: IApiResOrder | null;
  onClose: () => void;
  getStatusBadge: (status: string) => React.ReactElement;
}

export function OrderDetailsModal({
  order,
  onClose,
  getStatusBadge,
}: OrderDetailsModalProps) {
  return (
    <Dialog open={!!order} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Code</p>
                <p className="font-semibold">{order.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold">{order.user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {item.product?.name || `Product #${item.product_id}`}
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
                        {formatCurrency(parseFloat(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
