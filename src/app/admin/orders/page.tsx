import { orders } from "@/lib/data";
import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">All Orders</h1>
        <div className="ml-auto flex items-center gap-2">
            <Link href="/dashboard/orders/new">
                <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Order
                </Button>
            </Link>
        </div>
      </div>
      <OrdersTable orders={orders} isAdmin={true} />
    </main>
  );
}
