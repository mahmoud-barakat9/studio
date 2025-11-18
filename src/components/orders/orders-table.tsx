import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Order, User } from "@/lib/definitions";
import { Card, CardContent } from "../ui/card";

type StatusVariant = "default" | "secondary" | "destructive" | "outline";

const statusStyles: Record<string, { variant: StatusVariant; text: string }> = {
  "Order Placed": { variant: "secondary", text: "تم تقديم الطلب" },
  "In Production": { variant: "outline", text: "قيد الإنتاج" },
  Shipped: { variant: "default", text: "تم الشحن" },
  Completed: { variant: "default", text: "مكتمل" },
};

export function OrdersTable({
  orders,
  users = [],
  isAdmin = false,
  showViewAction = false,
}: {
  orders: Order[];
  users?: User[];
  isAdmin?: boolean;
  showViewAction?: boolean;
}) {
  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "غير معروف";
  };
  
  const getViewLink = (orderId: string) => {
    if (isAdmin) {
      return `/admin/orders/${orderId}`;
    }
    if (showViewAction) {
      return `/?view_order=${orderId}`;
    }
    return `/dashboard/orders/${orderId}`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>اسم الطلب</TableHead>
              {isAdmin && <TableHead>العميل</TableHead>}
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">التكلفة الإجمالية</TableHead>
              {(isAdmin || showViewAction) && <TableHead className="text-left">الإجراءات</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const statusStyle =
                statusStyles[order.status] || statusStyles["Order Placed"];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.orderName}</TableCell>
                  {isAdmin && <TableCell>{getUserName(order.userId)}</TableCell>}
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyle.variant}>
                      {statusStyle.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    ${order.totalCost.toFixed(2)}
                  </TableCell>
                  {(isAdmin || showViewAction) && (
                    <TableCell className="text-left">
                      <Link href={getViewLink(order.id)}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">عرض الطلب</span>
                        </Button>
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
