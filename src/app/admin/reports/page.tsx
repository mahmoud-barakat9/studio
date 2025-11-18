"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
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

const revenueData = [
  { month: "يناير", revenue: 11860 },
  { month: "فبراير", revenue: 13050 },
  { month: "مارس", revenue: 9370 },
  { month: "أبريل", revenue: 12730 },
  { month: "مايو", revenue: 15090 },
  { month: "يونيو", revenue: 11140 },
];

const revenueChartConfig = {
  revenue: {
    label: "الإيرادات",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const orderTypeData = [
  { type: "قياسي", count: 251, fill: "var(--color-standard)" },
  { type: "ضيق", count: 124, fill: "var(--color-narrow)" },
  { type: "عريض", count: 86, fill: "var(--color-wide)" },
];

const orderTypeConfig = {
  count: {
    label: "العدد",
  },
  standard: {
    label: "قياسي",
    color: "hsl(var(--chart-1))",
  },
  narrow: {
    label: "ضيق",
    color: "hsl(var(--chart-2))",
  },
  wide: {
    label: "عريض",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function AdminReportsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-semibold text-lg md:text-2xl">التقارير</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
            <CardDescription>إيرادات آخر 6 أشهر.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-72 w-full">
              <BarChart accessibilityLayer data={revenueData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع أنواع الطلبات</CardTitle>
            <CardDescription>
              توزيع أنواع الأباجور المختلفة المطلوبة.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={orderTypeConfig}
              className="mx-auto aspect-square h-64"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={orderTypeData} dataKey="count" nameKey="type" innerRadius={60}>
                     {orderTypeData.map((entry) => (
                        <Cell key={`cell-${entry.type}`} fill={entry.fill} />
                      ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="type" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
