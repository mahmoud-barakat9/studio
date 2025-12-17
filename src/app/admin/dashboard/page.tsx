
import { LineChart, Line, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
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
import { DollarSign, ClipboardList, TrendingUp, TrendingDown, AlertTriangle, Package, Ruler, CalendarDays, Users, ListChecks, BrainCircuit, CalendarCheck, HandCoins } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { getOrders, getUsers, getPurchases } from "@/lib/firebase-actions";
import { cn } from "@/lib/utils";
import type { Order, User } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/admin/dashboard-charts";


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
        <Card className={cn("shadow-lg hover:shadow-xl transition-shadow", className)}>
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


export default async function AdminDashboardPage() {
    const [orders, users, purchases] = await Promise.all([
        getOrders(),
        getUsers(true),
        getPurchases(),
    ]);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const avgPurchasePrices = purchases.reduce((acc, p) => {
        if (!acc[p.materialName]) {
            acc[p.materialName] = { totalCost: 0, totalQuantity: 0 };
        }
        acc[p.materialName].totalCost += p.purchasePricePerMeter * p.quantity;
        acc[p.materialName].totalQuantity += p.quantity;
        return acc;
    }, {} as Record<string, { totalCost: number, totalQuantity: number }>);
    
    const materialCosts = Object.fromEntries(
        Object.entries(avgPurchasePrices).map(([name, { totalCost, totalQuantity }]) => [
            name,
            totalQuantity > 0 ? totalCost / totalQuantity : 0,
        ])
    );

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
    const monthlyProfit = thisMonthOrders.reduce((sum, o) => {
        const cogs = (materialCosts[o.mainAbjourType] || 0) * o.totalArea;
        return sum + (o.totalCost - cogs);
    }, 0);

    // KPIs for last month
    const lastMonthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });
    const lastMonthOrdersCount = lastMonthOrders.length;
    const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.totalCost + (o.deliveryCost || 0), 0);
    const lastMonthProfit = lastMonthOrders.reduce((sum, o) => {
        const cogs = (materialCosts[o.mainAbjourType] || 0) * o.totalArea;
        return sum + (o.totalCost - cogs);
    }, 0);

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
    const monthlyProfitComparison = getComparison(monthlyProfit, lastMonthProfit);
    
    const kpiData = {
        todaysOrdersCount,
        monthlyOrdersCount,
        monthlyTotalArea,
        monthlySales,
        monthlyProfit,
        inProductionCount,
        lateOrdersCount,
        monthlyOrdersComparison,
        monthlySalesComparison,
        monthlyProfitComparison,
    };

    // Monthly trends for the last 12 months
    const monthlyTrendsData = Array.from({length: 12}, (_, i) => {
        const d = new Date(currentYear, currentMonth - 11 + i, 1);
        const month = d.toLocaleString('ar-EG', { month: 'short' });
        const year = d.getFullYear();
        const monthKey = `${month} ${year}`

        const monthOrders = orders.filter(o => {
            const orderDate = new Date(o.date);
            return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear();
        });
        return {
            name: monthKey,
            monthName: month,
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

    // AI Forecasting
    const last3Months = monthlyTrendsData.slice(-3);
    const nextMonthOrdersForecast = Math.round(last3Months.reduce((sum, m) => sum + m.orders, 0) / (last3Months.length || 1));
    const nextMonthAreaForecast = parseFloat((last3Months.reduce((sum, m) => sum + m.totalArea, 0) / (last3Months.length || 1)).toFixed(1));
    
    const peakPeriods = [...monthlyTrendsData].sort((a, b) => b.orders - a.orders).slice(0, 3).map(m => m.monthName);

    const forecasts = {
        nextMonthOrdersForecast,
        nextMonthAreaForecast,
        peakPeriods,
    };

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || "غير معروف";

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <KpiCard title="الطلبات الجديدة اليوم" value={`${kpiData.todaysOrdersCount}`} comparisonText="" isPositive={null} Icon={CalendarDays} />
        <KpiCard title="الطلبات الشهرية" value={`${kpiData.monthlyOrdersCount}`} comparisonText={kpiData.monthlyOrdersComparison.text} isPositive={kpiData.monthlyOrdersComparison.isPositive} Icon={ClipboardList} />
        <KpiCard title="قيمة المبيعات الشهرية" value={`$${kpiData.monthlySales?.toFixed(2)}`} comparisonText={kpiData.monthlySalesComparison.text} isPositive={kpiData.monthlySalesComparison.isPositive} Icon={DollarSign} />
        <KpiCard title="الأرباح الشهرية" value={`$${kpiData.monthlyProfit?.toFixed(2)}`} comparisonText={kpiData.monthlyProfitComparison.text} isPositive={kpiData.monthlyProfitComparison.isPositive} Icon={HandCoins} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <KpiCard title="إجمالي المتر المربع (شهري)" value={`${kpiData.monthlyTotalArea?.toFixed(2)} م²`} comparisonText="" isPositive={null} Icon={Ruler} />
        <KpiCard title="طلبات قيد التنفيذ" value={`${kpiData.inProductionCount}`} comparisonText="" isPositive={null} Icon={Package} />
        <KpiCard title="الطلبات المتأخرة" value={`${kpiData.lateOrdersCount}`} comparisonText="تحتاج إلى انتباه فوري" isPositive={false} Icon={AlertTriangle} className={kpiData.lateOrdersCount > 0 ? "border-destructive text-destructive shadow-lg hover:shadow-xl transition-shadow" : ""} />
      </div>
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">
            <DashboardCharts monthlyTrendsData={monthlyTrendsData} topMaterialsData={topMaterialsData} />
             <Card className="shadow-lg hover:shadow-xl transition-shadow xl:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit /> توقعات وتحليلات ذكية</CardTitle>
                    <CardDescription>تقديرات للشهر القادم بناءً على بيانات آخر 3 أشهر.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">توقع عدد الطلبات الشهر المقبل</p>
                            <p className="text-2xl font-bold">~{forecasts.nextMonthOrdersForecast} طلب</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                             <Ruler className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">توقع إجمالي المتر المربع</p>
                            <p className="text-2xl font-bold">≈ {forecasts.nextMonthAreaForecast} م²</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                           <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">فترات الذروة (أعلى 3 أشهر)</p>
                            <p className="text-lg font-bold">{forecasts.peakPeriods?.join('، ')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        
         <Card className="col-span-full shadow-lg hover:shadow-xl transition-shadow">
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
                        {criticalOrders.length > 0 ? criticalOrders.slice(0, 5).map(order => (
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
      </div>

       <div className="grid grid-cols-1 gap-4 md:gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
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
