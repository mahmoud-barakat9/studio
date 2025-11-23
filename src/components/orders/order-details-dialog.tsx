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
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

interface OrderDetailsDialogProps {
  order: Order;
}

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
    const finalTotalCost = order.totalCost + (order.deliveryCost || 0);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
            <span className="sr-only">عرض تفاصيل الطلب</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>تفاصيل الطلب: {order.orderName}</DialogTitle>
          <DialogDescription>
            رقم الطلب: {order.id}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto p-1 pr-4 space-y-6">
            <Card>
                <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground">الحالة</p>
                        <p className="font-semibold">{order.status}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground">التاريخ</p>
                        <p className="font-semibold">{order.date}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground">النوع</p>
                        <p className="font-semibold">{order.mainAbjourType} ({order.mainColor})</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground">الإجمالي</p>
                        <p className="font-semibold">${finalTotalCost.toFixed(2)}</p>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h3 className="text-lg font-semibold mb-2">مراحل تتبع الطلب</h3>
                <div className="py-4 pr-6">
                    <OrderTracker order={order} />
                </div>
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-2">تفاصيل الفتحات</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>طول الشفرة (سم)</TableHead>
                            <TableHead>عدد الشفرات</TableHead>
                            <TableHead>إضافات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.openings.map((opening, index) => (
                            <TableRow key={opening.serial}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{opening.codeLength.toFixed(2)}</TableCell>
                                <TableCell>{opening.numberOfCodes}</TableCell>
                                <TableCell>
                                     <div className="flex flex-col gap-1">
                                        {opening.hasEndCap && <Badge variant="secondary">نهاية</Badge>}
                                        {opening.hasAccessories && <Badge variant="secondary">مجاري</Badge>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
