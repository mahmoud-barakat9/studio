"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderForm } from "@/components/orders/order-form";
import { OrderTracker } from "@/components/orders/order-tracker";
import type { Order } from "@/lib/definitions";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [orderToView, setOrderToView] = useState<Order | undefined>();
  const [activeTab, setActiveTab] = useState("overview");

  const viewOrderId = searchParams.get('view_order');

  useEffect(() => {
    getOrdersByUserId("2").then(setUserOrders);
  }, []);

  useEffect(() => {
    if (viewOrderId && userOrders.length > 0) {
      const foundOrder = userOrders.find((o) => o.id === viewOrderId);
      setOrderToView(foundOrder);
      if (foundOrder) {
        setActiveTab("track-order");
      }
    } else {
        // If viewOrderId is removed from URL, switch back to overview
        if(activeTab === 'track-order'){
            setActiveTab("overview");
        }
    }
  }, [viewOrderId, userOrders, activeTab]);

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            أهلاً بكِ، فاطمة!
          </h1>
          <p className="text-muted-foreground">
            هذا هو مركز التحكم الخاص بطلباتك.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="create-order">إنشاء طلب جديد</TabsTrigger>
          <TabsTrigger value="all-orders">كل طلباتي</TabsTrigger>
          <TabsTrigger value="track-order" disabled={!viewOrderId}>تتبع الطلب</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>الطلبات الأخيرة</CardTitle>
              <CardDescription>
                أحدث طلبات الأباجور الخاصة بك.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable orders={userOrders.slice(0, 3)} showViewAction={true} />
              <div className="flex items-center justify-start pt-4">
                 <Button asChild variant="outline" size="sm">
                    <Link href="#all-orders-tab" onClick={() => setActiveTab('all-orders')}>
                        عرض كل الطلبات <ArrowUpRight className="h-4 w-4 mr-2" />
                    </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create-order">
           <OrderForm />
        </TabsContent>
        <TabsContent value="all-orders" id="all-orders-tab">
             <Card>
                <CardHeader>
                    <CardTitle>كل طلباتك</CardTitle>
                    <CardDescription>هنا يمكنك عرض وإدارة جميع طلباتك.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OrdersTable orders={userOrders} showViewAction={true}/>
                </CardContent>
             </Card>
        </TabsContent>
         <TabsContent value="track-order">
            {orderToView ? (
                 <Card>
                    <CardHeader>
                        <CardTitle>تتبع الطلب: {orderToView.orderName}</CardTitle>
                        <CardDescription>رقم الطلب: {orderToView.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderTracker currentStatus={orderToView.status} />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>لم يتم العثور على الطلب</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p>الرجاء تحديد طلب لعرض تفاصيله.</p>
                       <Button asChild variant="link" className="p-0 mt-2">
                            <Link href="#all-orders-tab" onClick={() => setActiveTab('all-orders')}>
                                العودة إلى كل الطلبات
                            </Link>
                       </Button>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
