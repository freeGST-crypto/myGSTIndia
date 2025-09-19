
"use client"

import { useMemo, useContext } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

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
import { type ChartConfig } from "@/components/ui/chart"
import { AccountingContext } from "@/context/accounting-context";

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
  const { journalVouchers } = useContext(AccountingContext)!;

  const chartData = useMemo(() => {
    const data: { [key: string]: { sales: number; purchases: number; month: string } } = {};
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const month = format(addMonths(sixMonthsAgo, i), 'MMM');
        const yearMonth = format(addMonths(sixMonthsAgo, i), 'yyyy-MM');
        data[yearMonth] = { month, sales: 0, purchases: 0 };
    }

    journalVouchers.forEach(voucher => {
        const voucherDate = new Date(voucher.date);
        if (voucherDate >= sixMonthsAgo) {
            const yearMonth = format(voucherDate, 'yyyy-MM');
            
            if (data[yearMonth]) {
                if (voucher.id.startsWith("JV-INV-")) {
                    data[yearMonth].sales += voucher.amount;
                } else if (voucher.id.startsWith("JV-BILL-")) {
                    data[yearMonth].purchases += voucher.amount;
                }
            }
        }
    });
    
    return Object.values(data).map(d => ({...d, net: d.sales - d.purchases }));

  }, [journalVouchers]);


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
