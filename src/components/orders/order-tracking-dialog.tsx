
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderTracker } from "@/components/orders/order-tracker";
import type { Order } from "@/lib/definitions";
import { Eye } from "lucide-react";

interface OrderTrackingDialogProps {
  order: Order;
}

export function OrderTrackingDialog({ order }: OrderTrackingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
            <span className="sr-only">عرض الطلب</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تتبع الطلب: {order.orderName}</DialogTitle>
          <DialogDescription>
            رقم الطلب: {order.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <OrderTracker order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
