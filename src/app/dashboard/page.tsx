
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Ruler, ClipboardList, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Order, User } from "@/lib/definitions";
import { OrdersTable } from "@/components/orders/orders-table";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DUMMY_USER_ID = "5"; 

interface KpiCardProps {
  title: string;
  value: string;
  comparisonText: string;
  isPositive: boolean | null;
  Icon: React.ElementType;
}

function KpiCard({ title, value, comparisonText, isPositive, Icon }: KpiCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {comparisonText && isPositive !== null && (
                     <p className={cn(
                        "text-xs text-muted-foreground flex items-center gap-1",
                        isPositive ? "text-green-600" : "text-red-600"
                     )}>
                        {isPositive ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                        {comparisonText}
                    </p>
                )}
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
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const { orders, users, loading } = useOrdersAndUsers(DUMMY_USER_ID);
  const currentUser = users.find(u => u.id === DUMMY_USER_ID);
  const userOrders = orders; // Data from hook is already filtered

  const { recentOrders, kpiData } = useMemo(() => {
    if (loading) {
        return { recentOrders: [], kpiData: {} };
    }
    
    const recentOrders = userOrders.slice(0, 5);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const thisMonthOrders = userOrders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const lastMonthOrders = userOrders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });
    
    const getComparison = (current: number, previous: number) => {
        if (previous === 0) return { text: current > 0 ? "زيادة" : "لا تغيير", isPositive: current > 0 ? true : null };
        const percentageChange = ((current - previous) / previous) * 100;
        return {
            text: `${Math.abs(percentageChange).toFixed(0)}% عن الشهر الماضي`,
            isPositive: percentageChange >= 0
        };
    };

    const monthlyOrdersCount = thisMonthOrders.length;
    const lastMonthOrdersCount = lastMonthOrders.length;
    const monthlyOrdersComparison = getComparison(monthlyOrdersCount, lastMonthOrdersCount);
    
    const totalApprovedMeters = userOrders
      .filter(order => order.status !== 'Pending' && order.status !== 'Rejected')
      .reduce((sum, order) => sum + order.totalArea, 0);

    const activeOrdersCount = userOrders.filter(order => order.status !== 'Delivered' && order.status !== 'Rejected' && !order.isArchived).length;


    const kpiData = {
        monthlyOrdersCount,
        monthlyOrdersComparison,
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      <main className="flex-1 bg-muted/40 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid gap-8">
            
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    {`أهلاً بك، ${currentUser?.name || 'User'}!`}
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    نظرة عامة سريعة على نشاطك. انشئ طلبًا جديدًا أو تتبع طلباتك الحالية من هنا.
                </p>
                 <Link href="/orders/new">
                    <Button size="lg" className="w-full sm:w-auto sm:max-w-xs">
                        <PlusCircle className="ml-2 h-5 w-5" />
                        إنشاء طلب جديد
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
               <KpiCard title="الطلبات هذا الشهر" value={`${kpiData.monthlyOrdersCount || 0}`} comparisonText={kpiData.monthlyOrdersComparison?.text} isPositive={kpiData.monthlyOrdersComparison?.isPositive} Icon={ClipboardList} />
               <KpiCard title="إجمالي الأمتار المعتمدة" value={`${kpiData.totalApprovedMeters?.toFixed(2) || '0.00'} م²`} comparisonText="" isPositive={null} Icon={Ruler} />
               <KpiCard title="الطلبات النشطة" value={`${kpiData.activeOrdersCount || 0}`} comparisonText="الطلبات قيد التنفيذ حاليًا" isPositive={null} Icon={CheckCircle2} />
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
    </div>
  );
}
