
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"

const chartData: any[] = []; // Empty data


const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-2))",
  },
  purchases: {
    label: "Purchases",
    color: "hsl(var(--chart-1))",
  },
   net: {
    label: "Net",
    color: "hsl(var(--chart-3))",
  }
} satisfies ChartConfig

export function FinancialSummaryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary - Last 6 Months</CardTitle>
        <CardDescription>A look at sales, purchases, and net flow.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
              <Bar dataKey="purchases" fill="var(--color-purchases)" radius={4} />
              <Bar dataKey="net" fill="var(--color-net)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No financial data available for the last 6 months.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
