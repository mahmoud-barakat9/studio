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
  { month: "January", revenue: 11860 },
  { month: "February", revenue: 13050 },
  { month: "March", revenue: 9370 },
  { month: "April", revenue: 12730 },
  { month: "May", revenue: 15090 },
  { month: "June", revenue: 11140 },
];

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const orderTypeData = [
  { type: "Standard", count: 251, fill: "var(--color-standard)" },
  { type: "Narrow", count: 124, fill: "var(--color-narrow)" },
  { type: "Wide", count: 86, fill: "var(--color-wide)" },
];

const orderTypeConfig = {
  count: {
    label: "Count",
  },
  standard: {
    label: "Standard",
    color: "hsl(var(--chart-1))",
  },
  narrow: {
    label: "Narrow",
    color: "hsl(var(--chart-2))",
  },
  wide: {
    label: "Wide",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function AdminReportsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-semibold text-lg md:text-2xl">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue from the last 6 months.</CardDescription>
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
            <CardTitle>Order Types Distribution</CardTitle>
            <CardDescription>
              Distribution of different abjour types ordered.
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
