
"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from "react";
import { getCookie } from 'cookies-next';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/orders-table";
import { getOrdersByUserId, getUserById } from "@/lib/firebase-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderTracker } from "@/components/orders/order-tracker";
import type { Order, User } from "@/lib/definitions";
import { Skeleton } from "../ui/skeleton";

export function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [orderToView, setOrderToView] = useState<Order | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  
  const viewOrderId = searchParams.get('view_order');

  const getDefaultTab = useCallback(() => {
    if (viewOrderId) return 'track-order';
    return 'overview';
  }, [viewOrderId]);

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true);
      const userId = getCookie('session-id');
      if (userId) {
        try {
            const user = await getUserById(userId as string);
            if (user) {
              setCurrentUser(user);
              const orders = await getOrdersByUserId(userId as string);
              setUserOrders(orders);
            } else {
              // If user not found, maybe session is invalid
              router.push('/login');
            }
        } catch(e) {
            console.error("Failed to fetch user data", e);
            router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    }
    fetchUserData();
  }, [router]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(searchParams.toString());
    if (value !== 'track-order') {
        newParams.delete('view_order');
    }
    
    // Add a hash to navigate to the dashboard section
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
            handleTabChange("overview");
        }
    }
  }, [viewOrderId, userOrders, activeTab, handleTabChange]);


  const handleAllOrdersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleTabChange('all-orders');
  }

  if (isLoading) {
    return (
      <div id="dashboard" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8 bg-muted/40">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div id="dashboard" className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8 bg-muted/40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentUser ? `أهلاً بكِ، ${currentUser.name}!` : "أهلاً بك!"}
          </h1>
          <p className="text-muted-foreground">
            هذا هو مركز التحكم الخاص بطلباتك.
          </p>
        </div>
         <Link href="/orders/new">
            <Button>
                إنشاء طلب جديد
            </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="all-orders">كل طلباتي</TabsTrigger>
          <TabsTrigger value="track-order" disabled={!viewOrderId && activeTab !== 'track-order'}>تتبع الطلب</TabsTrigger>
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
                 <a href="#all-orders-tab" onClick={handleAllOrdersClick}>
                    <Button variant="outline" size="sm">
                        عرض كل الطلبات <ArrowUpRight className="h-4 w-4 mr-2" />
                    </Button>
                </a>
              </div>
            </CardContent>
          </Card>
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
