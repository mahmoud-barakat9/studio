
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/orders-table";
import type { Order, User } from "@/lib/definitions";

interface DashboardProps {
    currentUser: User | null;
    userOrders: Order[];
}

export function Dashboard({ currentUser, userOrders }: DashboardProps) {

  return (
    <div id="dashboard" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8 bg-muted/40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {`أهلاً بكِ، ${currentUser?.name || 'User'}!`}
          </h1>
          <p className="text-muted-foreground">
            هنا يمكنك عرض وتتبع جميع طلباتك.
          </p>
        </div>
      </div>

       <Card>
          <CardHeader>
              <CardTitle>كل طلباتك</CardTitle>
              <CardDescription>هنا يمكنك عرض وإدارة جميع طلباتك.</CardDescription>
          </CardHeader>
          <CardContent>
              <OrdersTable orders={userOrders} showViewAction={true}/>
          </CardContent>
       </Card>
    </div>
  );
}
