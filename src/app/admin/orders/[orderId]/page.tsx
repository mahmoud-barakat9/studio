
'use client';

import { getOrderById, getUsers } from "@/lib/firebase-actions";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Share2, Truck, XCircle } from "lucide-react";
import type { OrderStatus, Order, User } from "@/lib/definitions";
import { StageCard, type StageIconName } from "@/components/orders/stage-card";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const STAGES: { name: OrderStatus; label: string; icon: StageIconName, action?: { label: string, nextStatus: OrderStatus } }[] = [
    { name: "Pending", label: "تم الاستلام", icon: 'FileQuestion', action: { label: "موافقة وبدء الطلب", nextStatus: "FactoryOrdered" } },
    { name: "FactoryOrdered", label: "تم الطلب من المعمل", icon: 'Factory', action: { label: "نقل إلى التجهيز", nextStatus: "Processing" } },
    { name: "Processing", label: "قيد التجهيز", icon: 'Cog', action: { label: "شحن من المعمل", nextStatus: "FactoryShipped" } },
    { name: "FactoryShipped", label: "تم الشحن من المعمل", icon: 'Truck', action: { label: "تأكيد الاستلام وجاهزية التوصيل", nextStatus: "ReadyForDelivery" } },
    { name: "ReadyForDelivery", label: "جاهز للتسليم", icon: 'PackageCheck', action: { label: "تأكيد التوصيل", nextStatus: "Delivered" } },
    { name: "Delivered", label: "تم التوصيل", icon: 'CheckCircle2' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    // Optimistic UI update
    setOrder(prevOrder => prevOrder ? { ...prevOrder, status: newStatus } : null);

    // Call server action - Note: This will revalidate the path but we also update locally.
    // await updateOrderStatus(order.id, newStatus);
    
    // For a fully optimistic UI, we can re-fetch just in case, but it might cause a flicker.
    // Let's rely on the optimistic update for now and let revalidation handle background consistency.
    // const updatedOrder = await getOrderById(orderId);
    // setOrder(updatedOrder);
  };

  useEffect(() => {
    async function fetchData() {
        if (!orderId) return;
        const orderData = await getOrderById(orderId);
        const usersData = await getUsers();
        setOrder(orderData);
        setUsers(usersData);
    }
    fetchData();
  }, [orderId]);


  if (order === undefined) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }


  if (!order) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>لم يتم العثور على الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم نتمكن من العثور على الطلب الذي تبحث عنه.</p>
             <Link href="/admin/orders">
                <Button variant="link" className="p-0 mt-4">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى كل الطلبات
                </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const customer = users.find((u) => u.id === order.userId);
  const finalTotalCost = order.totalCost + (order.deliveryCost || 0);

  const currentStatusIndex = STAGES.findIndex(s => s.name === order.status);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                 <Link href={`/admin/orders/${order.id}/view`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                        <FileText className="ml-2 h-4 w-4" />
                        عرض وتنزيل الفواتير
                    </Button>
                </Link>
                <Link href="/admin/orders" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        كل الطلبات
                    </Button>
                </Link>
            </div>
      </div>


      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow flex flex-col gap-8">
           <Card>
                <CardHeader>
                    <CardTitle>مراحل تتبع الطلب</CardTitle>
                    <CardDescription>تتبع حالة الطلب وقم بتحديثها.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {order.status === 'Rejected' ? (
                         <Card className="border-destructive">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <XCircle className="h-8 w-8 text-destructive" />
                                <div>
                                    <CardTitle>الطلب مرفوض</CardTitle>
                                    <CardDescription>تم رفض هذا الطلب.</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    ) : (
                        STAGES.map((stage, index) => {
                            const isCompleted = index < currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;
                            const isFuture = index > currentStatusIndex;

                            // Special handling for non-delivery orders
                            if (!order.hasDelivery) {
                                // Skip "FactoryShipped" stage for non-delivery
                                if (stage.name === 'FactoryShipped') return null;

                                // Modify "Processing" stage action
                                if (stage.name === 'Processing') {
                                    const modifiedStage = {
                                        ...stage,
                                        action: { label: "جاهز للاستلام", nextStatus: "ReadyForDelivery" as OrderStatus }
                                    };
                                    return (
                                        <StageCard 
                                            key={modifiedStage.name} 
                                            stage={modifiedStage} 
                                            isCompleted={isCompleted}
                                            isCurrent={isCurrent}
                                            isFuture={isFuture}
                                            orderId={order.id}
                                            onStatusUpdate={handleStatusUpdate}
                                        />
                                    );
                                }
                                
                                // Modify "ReadyForDelivery" stage label and action
                                if (stage.name === 'ReadyForDelivery') {
                                     const modifiedStage = {
                                        ...stage,
                                        label: "جاهز للاستلام",
                                        icon: 'PackageCheck' as StageIconName,
                                        action: { label: "تأكيد الاستلام", nextStatus: "Delivered" as OrderStatus }
                                    };
                                    return (
                                        <StageCard 
                                            key={modifiedStage.name} 
                                            stage={modifiedStage} 
                                            isCompleted={isCompleted}
                                            isCurrent={isCurrent}
                                            isFuture={isFuture}
                                            orderId={order.id}
                                            onStatusUpdate={handleStatusUpdate}
                                        />
                                    );
                                }
                            }

                            // Default rendering for delivery orders or other stages
                            return (
                                <StageCard 
                                    key={stage.name} 
                                    stage={stage} 
                                    isCompleted={isCompleted}
                                    isCurrent={isCurrent}
                                    isFuture={isFuture}
                                    orderId={order.id}
                                    showRejectButton={stage.name === 'Pending'}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            );
                        })
                    )}
                </CardContent>
           </Card>
           <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفتحات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>نوع التركيب</TableHead>
                        <TableHead>طول الكود</TableHead>
                        <TableHead>عدد الأكواد</TableHead>
                        <TableHead>إضافات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.openings.map((opening, index) => (
                        <TableRow key={opening.serial}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{opening.abjourType}</TableCell>
                          <TableCell>{opening.codeLength}م</TableCell>
                          <TableCell>{opening.numberOfCodes}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {opening.hasEndCap && <Badge variant="secondary">غطاء طرفي</Badge>}
                              {opening.hasAccessories && <Badge variant="secondary">إكسسوارات</Badge>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>{order.orderName}</CardTitle>
                    <CardDescription>رقم الطلب: {order.id}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الحالة</span>
                        <span>
                            <Badge variant={
                                order.status === 'Delivered' ? 'default' :
                                order.status === 'Rejected' ? 'destructive' :
                                'secondary'
                            }>{order.status}</Badge>
                        </span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">نوع الأباجور</span>
                        <span>{order.mainAbjourType}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">اللون</span>
                        <span>{order.mainColor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">التاريخ</span>
                        <span>{order.date}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تكلفة المنتجات</span>
                        <span className="font-semibold">${order.totalCost.toFixed(2)}</span>
                    </div>
                    {order.hasDelivery && (
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">تكلفة التوصيل</span>
                            <span className="font-semibold">${(order.deliveryCost || 0).toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex items-center justify-between font-bold text-lg border-t pt-2">
                        <span className="text-muted-foreground">التكلفة الإجمالية</span>
                        <span className="font-extrabold">${finalTotalCost.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
             {order.hasDelivery && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Truck className="h-5 w-5" />
                           تفاصيل التوصيل
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="grid gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-sm">عنوان التوصيل</span>
                            <p className="text-sm font-medium">{order.deliveryAddress}</p>
                        </div>
                    </CardContent>
                </Card>
             )}
            <Card>
                <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الاسم</span>
                        <span className="text-right break-all">{customer?.name ?? order.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">البريد الإلكتروني</span>
                        <span className="text-right break-all">{customer?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">رقم الهاتف</span>
                        <span className="text-right break-all">{customer?.phone || order.customerPhone}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}

    