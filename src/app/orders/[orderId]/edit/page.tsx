
'use client';

import { getOrderById } from "@/lib/firebase-actions";
import { EditOrderForm } from "@/components/orders/edit-order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { useAuth } from "@/providers/auth-provider";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";


export default function EditOrderPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { user: currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
        if (!params.orderId) return;
        setLoading(true);
        const orderData = await getOrderById(params.orderId);
        setOrder(orderData);
        setLoading(false);
    }
    fetchOrder();
  }, [params.orderId]);

  if (loading) {
      return (
           <div className="flex flex-col min-h-screen">
            <MainHeader />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-96 w-full mt-8" />
            </main>
            <MainFooter />
            <BottomNavbar />
           </div>
      )
  }

  const isOwner = order?.userId === currentUser?.id;
  const isEditable = order?.status === "Pending";

  if (!order || !isOwner) {
    return (
        <div className="flex flex-col min-h-screen">
            <MainHeader />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                             طلب غير موجود أو لا تملك صلاحية الوصول
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>لم نتمكن من العثور على الطلب الذي تبحث عنه، أو لا تملك صلاحية تعديله.</p>
                        <Link href="/orders">
                            <Button variant="link" className="p-0 mt-4">
                                <ArrowRight className="ml-2 h-4 w-4" />
                                العودة إلى كل الطلبات
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
            <MainFooter />
            <BottomNavbar />
        </div>
    );
  }

  if (!isEditable) {
      return (
         <div className="flex flex-col min-h-screen">
            <MainHeader />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                             لا يمكن تعديل الطلب
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>لا يمكنك تعديل هذا الطلب لأنه قيد التنفيذ. يرجى التواصل مع الإدارة إذا كنت بحاجة إلى إجراء تغييرات.</p>
                        <Link href="/orders">
                            <Button variant="link" className="p-0 mt-4">
                                <ArrowRight className="ml-2 h-4 w-4" />
                                العودة إلى كل الطلبات
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
            <MainFooter />
            <BottomNavbar />
        </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40 p-4 md:p-8 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold">تعديل الطلب: {order.orderName}</h1>
                <p className="text-muted-foreground">قم بتحديث تفاصيل الطلب أدناه.</p>
            </div>
            <Link href={`/orders/${order.id}`}>
                <Button variant="outline">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى تفاصيل الطلب
                </Button>
            </Link>
        </div>
        <EditOrderForm order={order} />
      </main>
      <MainFooter />
      <BottomNavbar />
    </div>
  );
}
