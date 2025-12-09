
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, YAxis, Tooltip, Legend, Line, LineChart } from "recharts";
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
import type { ChartConfig } from "@/components/ui/chart";
import { useOrdersAndUsers } from "@/hooks/use-orders-and-users";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/lib/definitions";

const statusTranslations: Record<OrderStatus, string> = {
    "Pending": "بانتظار الموافقة",
    "Approved": "تمت الموافقة",
    "FactoryOrdered": "تم الطلب من المعمل",
    "Processing": "قيد التجهيز",
    "FactoryShipped": "تم الشحن من المعمل",
    "ReadyForDelivery": "جاهز للتسليم",
    "Delivered": "تم التوصيل",
    "Rejected": "مرفوض",
  };

const statusColors: Record<OrderStatus, string> = {
    "Pending": "hsl(var(--chart-1))",
    "Approved": "hsl(var(--chart-2))",
    "FactoryOrdered": "hsl(var(--chart-3))",
    "Processing": "hsl(var(--chart-4))",
    "FactoryShipped": "hsl(var(--chart-5))",
    "ReadyForDelivery": "hsl(var(--primary))",
    "Delivered": "hsl(220, 80%, 60%)",
    "Rejected": "hsl(var(--destructive))",
};


export default function AdminReportsPage() {
    const { orders, purchases, loading } = useOrdersAndUsers();

    const { monthlyRevenueData, statusDistributionData, materialPerformanceData, revenueChartConfig, statusChartConfig } = useMemo(() => {
        if (loading || orders.length === 0) {
            return { monthlyRevenueData: [], statusDistributionData: [], materialPerformanceData: [], revenueChartConfig: {}, statusChartConfig: {} };
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

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

        // Monthly Revenue for last 12 months
        const monthlyRevenueData = Array.from({length: 12}, (_, i) => {
            const d = new Date(currentYear, currentMonth - 11 + i, 1);
            const monthName = d.toLocaleString('ar-EG', { month: 'short' });
            
            const monthOrders = orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear();
            });

            const revenue = monthOrders.reduce((sum, o) => sum + o.totalCost + (o.deliveryCost || 0), 0);
            const profit = monthOrders.reduce((sum, o) => {
                const cogs = (materialCosts[o.mainAbjourType] || 0) * o.totalArea;
                return sum + (o.totalCost - cogs);
            }, 0);
            return { 
                month: monthName, 
                revenue: parseFloat(revenue.toFixed(0)),
                profit: parseFloat(profit.toFixed(0)),
             };
        });

        const revenueChartConfig = {
            revenue: { label: "الإيرادات", color: "hsl(var(--primary))" },
            profit: { label: "الأرباح", color: "hsl(140, 70%, 50%)" },
        } satisfies ChartConfig;


        // Status Distribution
        const statusCounts = orders.reduce((acc, order) => {
            if (!order.isArchived) {
                acc[order.status] = (acc[order.status] || 0) + 1;
            }
            return acc;
        }, {} as Record<OrderStatus, number>);

        const statusDistributionData = Object.entries(statusCounts).map(([status, count]) => ({
            status: statusTranslations[status as OrderStatus],
            count,
            fill: statusColors[status as OrderStatus],
        }));

        const statusChartConfig: ChartConfig = Object.entries(statusTranslations).reduce((acc, [key, label]) => {
            acc[label] = { label, color: statusColors[key as OrderStatus] };
            return acc;
        }, {} as ChartConfig);


        // Material Performance
        const materialData = orders.reduce((acc, order) => {
            const type = order.mainAbjourType;
            if (!acc[type]) {
                acc[type] = { name: type, totalSales: 0, orderCount: 0, totalArea: 0, totalProfit: 0 };
            }
            acc[type].totalSales += order.totalCost + (order.deliveryCost || 0);
            acc[type].orderCount += 1;
            acc[type].totalArea += order.totalArea;

            const cogs = (materialCosts[order.mainAbjourType] || 0) * order.totalArea;
            acc[type].totalProfit += order.totalCost - cogs;

            return acc;
        }, {} as Record<string, {name: string, totalSales: number, orderCount: number, totalArea: number, totalProfit: number}>);

        const materialPerformanceData = Object.values(materialData).map(m => ({
            ...m,
            avgOrderValue: m.totalSales / m.orderCount,
        })).sort((a, b) => b.totalSales - a.totalSales);


        return { monthlyRevenueData, statusDistributionData, materialPerformanceData, revenueChartConfig, statusChartConfig };
    }, [orders, purchases, loading]);


    if (loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <h1 className="font-semibold text-lg md:text-2xl">التقارير</h1>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent><Skeleton className="h-72 w-full" /></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent className="flex items-center justify-center"><Skeleton className="h-64 w-64 rounded-full" /></CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            </main>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-semibold text-lg md:text-2xl">التقارير</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات والأرباح الشهرية</CardTitle>
            <CardDescription>نظرة على إجمالي الإيرادات والأرباح لآخر 12 شهرًا.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-72 w-full">
              <BarChart accessibilityLayer data={monthlyRevenueData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                 <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} name="الإيرادات" />
                <Bar dataKey="profit" fill="var(--color-profit)" radius={4} name="الأرباح" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالات الطلبات</CardTitle>
            <CardDescription>
              توزيع جميع الطلبات النشطة على حالاتها المختلفة.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={statusChartConfig}
              className="mx-auto aspect-square h-64"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={statusDistributionData} dataKey="count" nameKey="status" innerRadius={60}>
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>تقرير أداء المواد</CardTitle>
            <CardDescription>تحليل لمبيعات وأرباح كل نوع من أنواع الأباجور.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>نوع المادة</TableHead>
                        <TableHead>إجمالي المبيعات</TableHead>
                        <TableHead>إجمالي الأرباح</TableHead>
                        <TableHead>عدد الطلبات</TableHead>
                        <TableHead>متوسط سعر الطلب</TableHead>
                        <TableHead>إجمالي م²</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {materialPerformanceData.map(material => (
                        <TableRow key={material.name}>
                            <TableCell className="font-medium">{material.name}</TableCell>
                            <TableCell className="font-mono">${material.totalSales.toFixed(2)}</TableCell>
                            <TableCell className="font-mono font-semibold text-green-600">${material.totalProfit.toFixed(2)}</TableCell>
                            <TableCell>{material.orderCount}</TableCell>
                            <TableCell className="font-mono">${material.avgOrderValue.toFixed(2)}</TableCell>
                            <TableCell>{material.totalArea.toFixed(2)} م²</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </main>
  );
}

    

