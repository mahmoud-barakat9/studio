
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/definitions";
import { BellRing, CheckCircle, Edit, Star } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

function ReviewsTable({ orders, users }: { orders: Order[], users: any[] }) {
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || "غير معروف";

    if (orders.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500"/>
                <h3 className="text-lg font-semibold text-foreground">لا توجد مراجعات جديدة</h3>
                <p className="text-sm">لا توجد حاليًا أي مراجعات جديدة من العملاء.</p>
            </div>
        )
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>المراجعة</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                            {order.orderName}
                        </Link>
                        </TableCell>
                        <TableCell>{getUserName(order.userId)}</TableCell>
                        <TableCell>
                        <div className="flex items-center" dir="ltr">
                            {Array(5).fill(0).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                "h-5 w-5",
                                order.rating && i < order.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted-foreground"
                                )}
                            />
                            ))}
                        </div>
                        </TableCell>
                        <TableCell className="max-w-sm">
                        <p className="truncate">{order.review}</p>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


export default function AdminNotificationsPage() {
  const { orders, users, loading } = useOrdersAndUsers();

  const { editRequestOrders, pendingOrders, newReviews } = useMemo(() => {
    const editRequestOrders = orders.filter(order => order.isEditRequested && !order.isArchived);
    const pendingOrders = orders.filter(order => order.status === 'Pending' && !order.isArchived);
    const newReviews = orders.filter(order => order.rating && order.review && !order.isArchived);
    return { editRequestOrders, pendingOrders, newReviews };
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
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-orders">
                <CheckCircle className="ml-2 h-4 w-4" />
                طلبات جديدة
                {pendingOrders.length > 0 && <Badge className="mr-2">{pendingOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="edit-requests">
                <Edit className="ml-2 h-4 w-4" />
                طلبات تعديل
                {editRequestOrders.length > 0 && <Badge className="mr-2">{editRequestOrders.length}</Badge>}
            </TabsTrigger>
             <TabsTrigger value="new-reviews">
                <Star className="ml-2 h-4 w-4" />
                مراجعات جديدة
                {newReviews.length > 0 && <Badge className="mr-2">{newReviews.length}</Badge>}
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

         <TabsContent value="new-reviews">
            <Card>
                <CardHeader>
                <CardTitle>المراجعات الجديدة من العملاء</CardTitle>
                <CardDescription>
                    عرض جميع تقييمات العملاء على الطلبات المكتملة.
                </CardDescription>
                </CardHeader>
                <CardContent>
                   <ReviewsTable orders={newReviews} users={users} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
