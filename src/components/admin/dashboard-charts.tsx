
'use client';

import { LineChart, Line, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

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

const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

// Client component for charts that need interactivity
export function DashboardCharts({ monthlyTrendsData, topMaterialsData }: { monthlyTrendsData: any[], topMaterialsData: any[] }) {
    return (
        <>
            <Card className="xl:col-span-2 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                    <CardTitle>اتجاهات الطلبات الشهرية</CardTitle>
                    <CardDescription>نظرة عامة على عدد الطلبات وإجمالي المتر المربع لآخر 12 شهرًا.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={trendsChartConfig} className="h-72 w-full">
                        <LineChart accessibilityLayer data={monthlyTrendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} tickFormatter={(value) => `${value}م²`} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line dataKey="orders" type="monotone" stroke="var(--color-orders)" strokeWidth={2} dot={true} yAxisId="left" name="الطلبات" />
                            <Line dataKey="totalArea" type="monotone" stroke="var(--color-totalArea)" strokeWidth={2} dot={true} yAxisId="right" name="إجمالي م²" />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="xl:col-span-2 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                    <CardTitle>أنواع الأباجور الأكثر طلبًا</CardTitle>
                    <CardDescription>إجمالي الأمتار المربعة المطلوبة لكل نوع أباجور.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={topMaterialsChartConfig} className="h-72 w-full">
                        <BarChart accessibilityLayer data={topMaterialsData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                tickLine={false} 
                                tickMargin={10} 
                                axisLine={false} 
                                width={100}
                                tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                            />
                            <XAxis dataKey="totalArea" type="number" hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Bar dataKey="totalArea" radius={4}>
                                {topMaterialsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </>
    );
}
