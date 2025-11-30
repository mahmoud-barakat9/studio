
"use client";
import { LineChart, Line, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { DollarSign, ClipboardList, TrendingUp, TrendingDown, AlertTriangle, Package, Ruler, CalendarDays, Users, ListChecks } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Order, User } from "@/lib/definitions";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";


const trendsChartConfig = {
  orders: {
    label: "الطلبات",
    color: "hsl(var(--chart-1))",
  },
  totalArea: {
    label: "م²",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const topMaterialsChartConfig = {
  totalArea: {
    label: "إجمالي م²",
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
    const { orders, users, loading } = useOrdersAndUsers();
    
    const { kpiData, monthlyTrendsData, topMaterialsData, criticalOrders, topCustomers } = useMemo(() => {
        if (loading || orders.length === 0) {
            return { kpiData: {}, monthlyTrendsData: [], topMaterialsData: [], criticalOrders: [], topCustomers: [] };
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
        
        const kpiData = {
            todaysOrdersCount,
            monthlyOrdersCount,
            monthlyTotalArea,
            monthlySales,
            inProductionCount,
            lateOrdersCount,
            monthlyOrdersComparison,
            monthlySalesComparison,
        };

        // Monthly trends for the last 12 months
        const monthlyTrendsData = Array.from({length: 12}, (_, i) => {
            const d = new Date(currentYear, currentMonth - 11 + i, 1);
            const month = d.toLocaleString('ar-EG', { month: 'short' });
            const monthOrders = orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear();
            });
            return {
                name: month,
                orders: monthOrders.length,
                totalArea: parseFloat(monthOrders.reduce((sum, o) => sum + o.totalArea, 0).toFixed(2)),
            };
        });
        
        // Top materials by totalArea
        const materialsData = orders.reduce((acc, order) => {
            const type = order.mainAbjourType;
            if (!acc[type]) {
                acc[type] = { name: type, totalArea: 0 };
            }
            acc[type].totalArea += order.totalArea;
            return acc;
        }, {} as Record<string, {name: string, totalArea: number}>);

        const topMaterialsData = Object.values(materialsData)
            .sort((a,b) => b.totalArea - a.totalArea)
            .map(m => ({ ...m, totalArea: parseFloat(m.totalArea.toFixed(2))}));

        
        // Critical Orders
        const criticalOrders = orders.filter(isOrderDelayed);

        // Top Customers
        const customersData = users.map(user => {
            const userOrders = orders.filter(o => o.userId === user.id);
            if (userOrders.length === 0) return null;
            
            const totalOrders = userOrders.length;
            const totalArea = userOrders.reduce((sum, o) => sum + o.totalArea, 0);
            const totalSpent = userOrders.reduce((sum, o) => sum + o.totalCost + (o.deliveryCost || 0), 0);

            return {
                id: user.id,
                name: user.name,
                totalOrders,
                totalArea,
                totalSpent,
            };
        }).filter(Boolean) as { id: string; name: string; totalOrders: number; totalArea: number; totalSpent: number; }[];

        const topCustomers = customersData.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);


        return { kpiData, monthlyTrendsData, topMaterialsData, criticalOrders, topCustomers };

    }, [orders, users, loading]);

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || "غير معروف";


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
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-full lg:col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-48"/>
                             <Skeleton className="h-4 w-64"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-72 w-full"/>
                        </CardContent>
                    </Card>
                    <Card className="col-span-full lg:col-span-3">
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

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <KpiCard title="الطلبات الجديدة اليوم" value={`${kpiData.todaysOrdersCount}`} comparisonText="" isPositive={null} Icon={CalendarDays} />
        <KpiCard title="الطلبات الشهرية" value={`${kpiData.monthlyOrdersCount}`} comparisonText={kpiData.monthlyOrdersComparison.text} isPositive={kpiData.monthlyOrdersComparison.isPositive} Icon={ClipboardList} />
        <KpiCard title="إجمالي المتر المربع (شهري)" value={`${kpiData.monthlyTotalArea?.toFixed(2)} م²`} comparisonText="" isPositive={null} Icon={Ruler} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <KpiCard title="قيمة المبيعات الشهرية" value={`$${kpiData.monthlySales?.toFixed(2)}`} comparisonText={kpiData.monthlySalesComparison.text} isPositive={kpiData.monthlySalesComparison.isPositive} Icon={DollarSign} />
        <KpiCard title="طلبات قيد التنفيذ" value={`${kpiData.inProductionCount}`} comparisonText="" isPositive={null} Icon={Package} />
        <KpiCard title="الطلبات المتأخرة" value={`${kpiData.lateOrdersCount}`} comparisonText="تحتاج إلى انتباه فوري" isPositive={false} Icon={AlertTriangle} className={kpiData.lateOrdersCount > 0 ? "border-destructive text-destructive" : ""} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 md:gap-8">
         <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>اتجاهات الطلبات الشهرية</CardTitle>
            <CardDescription>
              نظرة عامة على عدد الطلبات وإجمالي المتر المربع لآخر 12 شهرًا.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendsChartConfig} className="h-72 w-full">
              <LineChart
                accessibilityLayer
                data={monthlyTrendsData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0,
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
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    allowDecimals={false}
                />
                 <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    allowDecimals={false}
                    tickFormatter={(value) => `${value}م²`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="orders"
                  type="monotone"
                  stroke="var(--color-orders)"
                  strokeWidth={2}
                  dot={true}
                  yAxisId="left"
                />
                 <Line
                  dataKey="totalArea"
                  type="monotone"
                  stroke="var(--color-totalArea)"
                  strokeWidth={2}
                  dot={true}
                  yAxisId="right"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>أنواع الأباجور الأكثر طلبًا</CardTitle>
            <CardDescription>
                إجمالي الأمتار المربعة المطلوبة لكل نوع أباجور.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={topMaterialsChartConfig} className="h-72 w-full">
              <BarChart accessibilityLayer data={topMaterialsData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={60}
                />
                <XAxis dataKey="totalArea" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="totalArea" fill="var(--color-totalArea)" radius={4}>
                    {topMaterialsData.map((entry, index) => (
                        <rect key={`bar-${index}`} width={entry.totalArea} height={10} />
                    ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle className="flex items-center gap-2"><ListChecks /> الطلبات الحرجة</CardTitle>
                    <CardDescription>الطلبات المتأخرة التي تحتاج إلى متابعة فورية.</CardDescription>
                </div>
                 <Button asChild size="sm" className="mr-auto gap-1">
                    <Link href="/admin/orders">
                        عرض الكل
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>اسم الطلب</TableHead>
                            <TableHead className="hidden sm:table-cell">العميل</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>تاريخ الطلب</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {criticalOrders.length > 0 ? criticalOrders.map(order => (
                             <TableRow key={order.id}>
                                <TableCell>
                                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">{order.orderName}</Link>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{getUserName(order.userId)}</TableCell>
                                <TableCell><Badge variant="destructive">{order.status}</Badge></TableCell>
                                <TableCell>{order.date}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">لا توجد طلبات حرجة حاليًا.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle className="flex items-center gap-2"><Users /> أفضل العملاء</CardTitle>
                    <CardDescription>العملاء الأكثر طلبًا وقيمة.</CardDescription>
                </div>
                <Button asChild size="sm" className="mr-auto gap-1">
                    <Link href="/admin/users">
                        عرض الكل
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>العميل</TableHead>
                            <TableHead>إجمالي الطلبات</TableHead>
                            <TableHead className="hidden sm:table-cell">إجمالي م²</TableHead>
                            <TableHead>إجمالي المبيعات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topCustomers.length > 0 ? topCustomers.map(customer => (
                            <TableRow key={customer.id}>
                                <TableCell>
                                     <Link href={`/admin/users/${customer.id}`} className="font-medium hover:underline">{customer.name}</Link>
                                </TableCell>
                                <TableCell>{customer.totalOrders}</TableCell>
                                <TableCell className="hidden sm:table-cell">{customer.totalArea.toFixed(2)}</TableCell>
                                <TableCell className="font-mono">${customer.totalSpent.toFixed(2)}</TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">لا توجد بيانات كافية لعرض أفضل العملاء.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </main>
  );
}

    