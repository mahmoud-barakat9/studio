
'use client';

import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { OrdersTable } from "@/components/orders/orders-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/definitions";
import { BellRing, Check } from "lucide-react";
import { useMemo } from "react";

export default function AdminNotificationsPage() {
  const { orders, users, loading } = useOrdersAndUsers();

  const editRequestOrders = useMemo(() => {
    return orders.filter(order => order.isEditRequested);
  }, [orders]);


  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <BellRing className="h-8 w-8 text-primary" />
        <div>
            <h1 className="font-semibold text-3xl">الإشعارات</h1>
            <p className="text-muted-foreground">عرض التنبيهات والطلبات التي تحتاج إلى انتباهك.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>طلبات التعديل المعلقة</CardTitle>
          <CardDescription>
            هذه الطلبات تم الإبلاغ عنها من قبل العملاء وتتطلب مراجعة وتعديلاً.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {editRequestOrders.length > 0 ? (
                <OrdersTable orders={editRequestOrders} users={users} isAdmin={true} />
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <Check className="h-12 w-12 mb-4 text-green-500"/>
                    <h3 className="text-lg font-semibold text-foreground">لا توجد إشعارات جديدة</h3>
                    <p className="text-sm">كل شيء على ما يرام حاليًا. لا توجد طلبات تعديل معلقة.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
