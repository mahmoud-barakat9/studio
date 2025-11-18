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
  "Order Placed": { variant: "secondary", text: "Order Placed" },
  "In Production": { variant: "outline", text: "In Production" },
  Shipped: { variant: "default", text: "Shipped" },
  Completed: { variant: "default", text: "Completed" },
};

export function OrdersTable({
  orders,
  users = [],
  isAdmin = false,
}: {
  orders: Order[];
  users?: User[];
  isAdmin?: boolean;
}) {
  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unknown";
  };
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Name</TableHead>
              {isAdmin && <TableHead>Customer</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    ${order.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Order</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
