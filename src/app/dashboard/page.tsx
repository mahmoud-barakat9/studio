import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
import { notFound } from "next/navigation";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const userOrders = await getOrdersByUserId("2"); // Mock user Fatima Zahra
  const viewOrderId = searchParams?.view_order;
  let orderToView;

  if (viewOrderId && typeof viewOrderId === "string") {
    orderToView = userOrders.find((o) => o.id === viewOrderId);
  }
  
  const defaultTab = viewOrderId ? "track-order" : "overview";


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

      <Tabs defaultValue={defaultTab} className="w-full">
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
                {/* This is not a trigger, just a regular button that looks like a trigger */}
                 <Button asChild variant="outline" size="sm">
                    <Link href="#all-orders-tab" onClick={() => document.querySelector<HTMLButtonElement>('button[data-radix-collection-item][value="all-orders"]')?.click()}>
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
                            <Link href="#all-orders-tab" onClick={() => document.querySelector<HTMLButtonElement>('button[data-radix-collection-item][value="all-orders"]')?.click()}>
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
