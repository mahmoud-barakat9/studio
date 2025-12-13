
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
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { cn } from "@/lib/utils";

const DUMMY_USER_ID = "5"; 

interface KpiCardProps {
  title: string;
  value: string;
  Icon: React.ElementType;
  className?: string;
}

function KpiCard({ title, value, Icon, className }: KpiCardProps) {
    return (
        <Card className={cn(className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}

function KpiCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
            </CardContent>
        </Card>
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
                    <div>
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-5 w-2/3 mt-2" />
                    </div>
                     <div className="grid gap-4 md:grid-cols-3">
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                    </div>
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
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {`أهلاً بك، ${currentUser?.name || 'User'}!`}
                    </h1>
                    <p className="text-muted-foreground">
                        نظرة عامة سريعة على نشاطك. انشئ طلبًا جديدًا أو تتبع طلباتك الحالية من هنا.
                    </p>
                </div>
                 <Link href="/orders/new">
                    <Button size="lg" className="w-full sm:w-auto">
                        <PlusCircle className="ml-2 h-5 w-5" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <KpiCard title="طلبات هذا الشهر" value={`${kpiData.monthlyOrdersCount || 0}`} Icon={ClipboardList} />
                <KpiCard title="إجمالي الأمتار المنفذة" value={`${kpiData.totalApprovedMeters?.toFixed(2) || '0.00'} م²`} Icon={Ruler} />
                <KpiCard title="الطلبات النشطة" value={`${kpiData.activeOrdersCount || 0}`} Icon={Package} />
            </div>

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
