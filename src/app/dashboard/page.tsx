import Link from "next/link";
import { PlusCircle, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/orders-table";
import { getOrdersByUserId } from "@/lib/firebase-actions";

export default async function Dashboard() {
  const userOrders = await getOrdersByUserId("2"); // Mock user Fatima Zahra
  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, Fatima!</h1>
            <p className="text-muted-foreground">Here's a summary of your orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/orders/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Order
            </Button>
          </Link>
        </div>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your most recent abjour orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={userOrders.slice(0,3)} />
             <div className="flex items-center justify-end pt-4">
                <Link href="/dashboard/orders">
                    <Button variant="outline" size="sm">
                        View All Orders <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
