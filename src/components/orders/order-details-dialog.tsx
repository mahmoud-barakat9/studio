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
import React from "react";

interface OrderDetailsDialogProps {
  order: Order;
}

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">عرض حالة التتبع</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تتبع الطلب: {order.orderName}</DialogTitle>
          <DialogDescription>
            آخر تحديث لحالة طلبك. رقم الطلب: {order.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 pr-6">
           <OrderTracker order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
