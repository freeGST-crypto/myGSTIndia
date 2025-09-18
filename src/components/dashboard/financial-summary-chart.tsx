
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

const chartData = [
  { month: "January", sales: 186000, purchases: 80000 },
  { month: "February", sales: 305000, purchases: 200000 },
  { month: "March", sales: 237000, purchases: 120000 },
  { month: "April", sales: 73000, purchases: 190000 },
  { month: "May", sales: 209000, purchases: 130000 },
  { month: "June", sales: 214000, purchases: 140000 },
].map(item => ({
    ...item,
    net: item.sales - item.purchases,
}));


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
      </CardContent>
    </Card>
  )
}
