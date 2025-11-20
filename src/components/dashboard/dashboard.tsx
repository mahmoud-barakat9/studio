
"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/orders-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderTracker } from "@/components/orders/order-tracker";
import type { Order, User } from "@/lib/definitions";
import { Skeleton } from "../ui/skeleton";

interface DashboardProps {
    currentUser: User | null;
    userOrders: Order[];
    isLoading: boolean;
}

export function Dashboard({ currentUser, userOrders, isLoading }: DashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderToView, setOrderToView] = useState<Order | undefined>();
  
  const viewOrderId = searchParams.get('view_order');
  
  const getDefaultTab = useCallback(() => {
    if (viewOrderId) return 'track-order';
    return 'all-orders';
  }, [viewOrderId]);

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(searchParams.toString());
    if (value !== 'track-order') {
        newParams.delete('view_order');
    }
    
    const newUrl = `${window.location.pathname}?${newParams.toString()}`.replace(/\?$/, '');
    router.replace(newUrl, {scroll: false});
  }, [router, searchParams]);

  useEffect(() => {
    if (viewOrderId && userOrders.length > 0) {
      const foundOrder = userOrders.find((o) => o.id === viewOrderId);
      setOrderToView(foundOrder);
      if (foundOrder) {
        setActiveTab("track-order");
      }
    } else {
        if(activeTab === 'track-order' && !viewOrderId){
            handleTabChange("all-orders");
        }
    }
  }, [viewOrderId, userOrders, activeTab, handleTabChange]);


  const handleAllOrdersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleTabChange('all-orders');
  }


  return (
    <div id="dashboard" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8 bg-muted/40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isLoading ? <Skeleton className="h-9 w-48" /> : `أهلاً بكِ، ${currentUser?.name || 'User'}!`}
          </h1>
          <p className="text-muted-foreground">
            هنا يمكنك عرض وتتبع جميع طلباتك.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-orders">كل طلباتي</TabsTrigger>
          <TabsTrigger value="track-order" disabled={!viewOrderId && activeTab !== 'track-order'}>تتبع الطلب</TabsTrigger>
        </TabsList>
        <TabsContent value="all-orders" id="all-orders-tab">
             <Card>
                <CardHeader>
                    <CardTitle>كل طلباتك</CardTitle>
                    <CardDescription>هنا يمكنك عرض وإدارة جميع طلباتك.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : (
                        <OrdersTable orders={userOrders} showViewAction={true}/>
                    )}
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
                        <OrderTracker order={orderToView} />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>لم يتم العثور على الطلب</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p>الرجاء تحديد طلب لعرض تفاصيله.</p>
                       <a href="#all-orders-tab" onClick={handleAllOrdersClick}>
                           <Button variant="link" className="p-0 mt-2">
                                العودة إلى كل الطلبات
                           </Button>
                       </a>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
