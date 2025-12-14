
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/definitions";
import { BellRing, CheckCircle, Edit } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function AdminNotificationsPage() {
  const { orders, users, loading } = useOrdersAndUsers();

  const { editRequestOrders, pendingOrders } = useMemo(() => {
    const editRequestOrders = orders.filter(order => order.isEditRequested && !order.isArchived);
    const pendingOrders = orders.filter(order => order.status === 'Pending' && !order.isArchived);
    return { editRequestOrders, pendingOrders };
  }, [orders]);


  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-12 w-full" />
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
            <p className="text-muted-foreground">عرض التنبيهات والطلبات التي تحتاج إلى انتباهك الفوري.</p>
        </div>
      </div>
      <Tabs defaultValue="new-orders">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-orders">
                <CheckCircle className="ml-2 h-4 w-4" />
                طلبات جديدة للموافقة
                {pendingOrders.length > 0 && <Badge className="mr-2">{pendingOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="edit-requests">
                <Edit className="ml-2 h-4 w-4" />
                طلبات تعديل
                {editRequestOrders.length > 0 && <Badge className="mr-2">{editRequestOrders.length}</Badge>}
            </TabsTrigger>
        </TabsList>

        <TabsContent value="new-orders">
            <Card>
                <CardHeader>
                <CardTitle>طلبات جديدة بانتظار الموافقة</CardTitle>
                <CardDescription>
                    هذه الطلبات تم إنشاؤها حديثًا وتتطلب موافقتك أو رفضك.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingOrders.length > 0 ? (
                        <OrdersTable orders={pendingOrders} users={users} isAdmin={true} />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                            <CheckCircle className="h-12 w-12 mb-4 text-green-500"/>
                            <h3 className="text-lg font-semibold text-foreground">لا توجد طلبات جديدة</h3>
                            <p className="text-sm">لا توجد حاليًا طلبات بانتظار الموافقة.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="edit-requests">
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
                            <CheckCircle className="h-12 w-12 mb-4 text-green-500"/>
                            <h3 className="text-lg font-semibold text-foreground">لا توجد طلبات تعديل</h3>
                            <p className="text-sm">لا توجد حاليًا طلبات تعديل معلقة من العملاء.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
