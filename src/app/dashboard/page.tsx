
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Package, Ruler, ClipboardList } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { Order } from "@/lib/definitions";
import { OrdersTable } from "@/components/orders/orders-table";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

const DUMMY_USER_ID = "5"; 

function Stat({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 text-center flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
  const { orders, users, loading } = useOrdersAndUsers(DUMMY_USER_ID);
  const currentUser = users.find(u => u.id === DUMMY_USER_ID);
  const userOrders = orders;

  const { recentOrders, kpiData } = useMemo(() => {
    if (loading) {
        return { recentOrders: [], kpiData: {} };
    }
    
    const recentOrders = userOrders.slice(0, 5);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthOrders = userOrders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const totalApprovedMeters = userOrders
      .filter(order => order.status !== 'Pending' && order.status !== 'Rejected')
      .reduce((sum, order) => sum + order.totalArea, 0);

    const activeOrdersCount = userOrders.filter(order => order.status !== 'Delivered' && order.status !== 'Rejected' && !order.isArchived).length;

    const kpiData = {
        monthlyOrdersCount: thisMonthOrders.length,
        totalApprovedMeters,
        activeOrdersCount,
    }

    return { recentOrders, kpiData };
    
  }, [userOrders, loading]);

  if (loading && !currentUser) {
      return (
           <div className="flex flex-col min-h-screen">
            <MainHeader />
             <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <div className="max-w-7xl mx-auto grid gap-8">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-1/2 mx-auto" />
                        <Skeleton className="h-5 w-2/3 mx-auto" />
                        <Skeleton className="h-12 w-48 mx-auto" />
                    </div>
                     <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-around">
                                <div className="flex flex-col items-center gap-2"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-12" /></div>
                                <div className="flex flex-col items-center gap-2"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-12" /></div>
                                <div className="flex flex-col items-center gap-2"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-12" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
            <MainFooter />
           </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1 bg-muted/40 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto grid gap-8">
            
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    {`أهلاً بك، ${currentUser?.name || 'User'}!`}
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    نظرة عامة سريعة على نشاطك. انشئ طلبًا جديدًا أو تتبع طلباتك الحالية من هنا.
                </p>
                 <Link href="/orders/new" className="hidden md:inline-block">
                    <Button size="lg" className="w-full sm:w-auto sm:max-w-xs">
                        <PlusCircle className="ml-2 h-5 w-5" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>

            <Card className="shadow-lg">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-around">
                        <Stat icon={ClipboardList} label="طلبات الشهر" value={kpiData.monthlyOrdersCount || 0} />
                        <Separator orientation="vertical" className="h-16" />
                        <Stat icon={Ruler} label="إجمالي الأمتار" value={`${kpiData.totalApprovedMeters?.toFixed(2) || '0.00'} م²`} />
                        <Separator orientation="vertical" className="h-16" />
                        <Stat icon={Package} label="الطلبات النشطة" value={kpiData.activeOrdersCount || 0} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>آخر الطلبات</CardTitle>
                        <CardDescription>هنا يمكنك عرض آخر 5 طلبات قمت بها.</CardDescription>
                    </div>
                    <Link href="/orders">
                        <Button variant="outline">
                             <ArrowLeft className="ml-2 h-4 w-4" />
                            عرض كل الطلبات
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <OrdersTable orders={recentOrders} users={currentUser ? [currentUser] : []} />
                </CardContent>
            </Card>
        </div>
      </main>
      <MainFooter />
      <BottomNavbar />
    </div>
  );
}
