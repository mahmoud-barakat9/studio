import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import { getOrdersByUserId } from "@/lib/firebase-actions";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function UserOrdersPage() {
  // Mocking user '2' (Fatima Zahra) for now
  const userOrders = await getOrdersByUserId('2');
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">طلباتي</h1>
        <Link href="/dashboard/orders/new">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 ml-2" />
            إنشاء طلب جديد
          </Button>
        </Link>
      </div>
      <OrdersTable orders={userOrders} />
    </div>
  );
}
