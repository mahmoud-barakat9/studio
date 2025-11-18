import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import { orders } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function UserOrdersPage() {
  const userOrders = orders.filter(o => o.userId === '1' || o.userId === '2' || o.userId === '3');
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link href="/dashboard/orders/new">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Order
          </Button>
        </Link>
      </div>
      <OrdersTable orders={userOrders} />
    </div>
  );
}
