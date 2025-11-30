
"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DollarSign, Users, ClipboardList, TrendingUp, TrendingDown, AlertTriangle, Package, Ruler, CalendarDays } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/definitions";

const chartConfig = {
  orders: {
    label: "الطلبات",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


const delayThresholds: Partial<Record<Order['status'], number>> = {
    Pending: 2,
    Approved: 1,
    FactoryOrdered: 2,
    Processing: 7,
    FactoryShipped: 3,
    ReadyForDelivery: 2,
};

const isOrderDelayed = (order: Order): boolean => {
    const threshold = delayThresholds[order.status];
    if (threshold === undefined || order.isArchived || order.status === 'Delivered' || order.status === 'Rejected') {
        return false;
    }
    const orderDate = new Date(order.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > threshold;
};


interface KpiCardProps {
  title: string;
  value: string;
  comparisonText: string;
  isPositive: boolean | null;
  Icon: React.ElementType;
  className?: string;
}

function KpiCard({ title, value, comparisonText, isPositive, Icon, className }: KpiCardProps) {
    return (
        <Card className={cn(className)}>
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

export default function AdminDashboardPage() {
    const { orders, loading } = useOrdersAndUsers();
    
    if (loading) {
        return (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                 <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    <KpiCardSkeleton />
                    <KpiCardSkeleton />
                    <KpiCardSkeleton />
                 </div>
                 <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    <KpiCardSkeleton />
                    <KpiCardSkeleton />
                    <KpiCardSkeleton />
                 </div>
                 <div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48"/>
                             <Skeleton className="h-4 w-64"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-72 w-full"/>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // KPIs for today
    const todaysOrdersCount = orders.filter(o => o.date === today).length;

    // KPIs for current month
    const thisMonthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    const monthlyOrdersCount = thisMonthOrders.length;
    const monthlyTotalArea = thisMonthOrders.reduce((sum, o) => sum + o.totalArea, 0);
    const monthlySales = thisMonthOrders.reduce((sum, o) => sum + o.totalCost + (o.deliveryCost || 0), 0);

    // KPIs for last month
    const lastMonthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });
    const lastMonthOrdersCount = lastMonthOrders.length;
    const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.totalCost + (o.deliveryCost || 0), 0);

    // Operational KPIs
    const inProductionCount = orders.filter(o => o.status === 'Processing').length;
    const lateOrdersCount = orders.filter(isOrderDelayed).length;


    // Comparison logic
    const getComparison = (current: number, previous: number) => {
        if (previous === 0) return { text: current > 0 ? "زيادة" : "لا تغيير", isPositive: current > 0 ? true : null };
        const percentageChange = ((current - previous) / previous) * 100;
        return {
            text: `${Math.abs(percentageChange).toFixed(1)}% عن الشهر الماضي`,
            isPositive: percentageChange >= 0
        };
    };
    
    const monthlyOrdersComparison = getComparison(monthlyOrdersCount, lastMonthOrdersCount);
    const monthlySalesComparison = getComparison(monthlySales, lastMonthSales);
    

    const monthlyChartData = Array.from({length: 6}, (_, i) => {
        const d = new Date(currentYear, currentMonth - 5 + i, 1);
        const month = d.toLocaleString('ar-EG', { month: 'short' });
        const year = d.getFullYear();
        return {
            name: month,
            orders: orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === year;
            }).length,
        };
    });


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <KpiCard title="الطلبات الجديدة اليوم" value={`${todaysOrdersCount}`} comparisonText="" isPositive={null} Icon={CalendarDays} />
        <KpiCard title="الطلبات الشهرية" value={`${monthlyOrdersCount}`} comparisonText={monthlyOrdersComparison.text} isPositive={monthlyOrdersComparison.isPositive} Icon={ClipboardList} />
        <KpiCard title="إجمالي المتر المربع (شهري)" value={`${monthlyTotalArea.toFixed(2)} م²`} comparisonText="" isPositive={null} Icon={Ruler} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <KpiCard title="قيمة المبيعات الشهرية" value={`$${monthlySales.toFixed(2)}`} comparisonText={monthlySalesComparison.text} isPositive={monthlySalesComparison.isPositive} Icon={DollarSign} />
        <KpiCard title="طلبات قيد التنفيذ" value={`${inProductionCount}`} comparisonText="" isPositive={null} Icon={Package} />
        <KpiCard title="الطلبات المتأخرة" value={`${lateOrdersCount}`} comparisonText="تحتاج إلى انتباه فوري" isPositive={false} Icon={AlertTriangle} className={lateOrdersCount > 0 ? "border-destructive text-destructive" : ""} />
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>نظرة عامة على الطلبات</CardTitle>
            <CardDescription>
              نظرة عامة على الطلبات في آخر 6 أشهر.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart
                accessibilityLayer
                data={monthlyChartData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                 <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  allowDecimals={false}
                  />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


    