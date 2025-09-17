
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { FileDown, CalendarDays } from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import { Separator } from "@/components/ui/separator";

const data = {
    revenue: {
        sales: 850000,
        otherIncome: 15000,
        total: 865000,
    },
    cogs: {
        openingStock: 75000,
        purchases: 420000,
        directExpenses: 25000,
        closingStock: 90000,
        total: 430000,
    },
    grossProfit: 435000,
    operatingExpenses: {
        salaries: 120000,
        rent: 60000,
        marketing: 35000,
        depreciation: 45000,
        other: 20000,
        total: 280000,
    },
    operatingProfit: 155000,
    nonOperating: {
        interestIncome: 5000,
        interestExpense: 12000,
    },
    netProfit: 148000,
};

export default function ProfitAndLossPage() {
    
    const ReportRow = ({ label, value, isTotal = false, isSub = false }: { label: string; value: number, isTotal?: boolean, isSub?: boolean }) => (
         <TableRow className={cn(isTotal && "font-bold", isSub && "text-muted-foreground")}>
            <TableCell className={cn("pl-8", isSub && "pl-12")}>{label}</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right font-mono pr-8">{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
        </TableRow>
    );

    const SectionHeader = ({ label, value }: { label: string, value: number }) => (
        <TableRow className="font-semibold bg-muted/30">
            <TableCell className="pl-4">{label}</TableCell>
            <TableCell className="text-right font-mono pr-8">{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
             <TableCell></TableCell>
        </TableRow>
    )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Account</h1>
          <p className="text-muted-foreground">
            Summary of revenues, costs, and expenses during a specific period.
          </p>
        </div>
        <Button>
          <FileDown className="mr-2"/>
          Export PDF
        </Button>
      </div>

       <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                        <CardTitle>Report Period</CardTitle>
                        <CardDescription>Select a date range to generate the P&L report.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="text-muted-foreground"/>
                        <DateRangePicker className="w-full md:w-auto" />
                    </div>
                </div>
            </CardHeader>
        </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>For the period from 01-Apr-2023 to 31-Mar-2024</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableBody>
                    {/* Revenue Section */}
                    <SectionHeader label="Revenue" value={data.revenue.total} />
                    <ReportRow label="Sales Revenue" value={data.revenue.sales} isSub />
                    <ReportRow label="Other Income" value={data.revenue.otherIncome} isSub />

                    {/* COGS Section */}
                    <SectionHeader label="Cost of Goods Sold (COGS)" value={-data.cogs.total} />
                    <ReportRow label="Opening Stock" value={data.cogs.openingStock} isSub />
                    <ReportRow label="Purchases" value={data.cogs.purchases} isSub />
                    <ReportRow label="Direct Expenses" value={data.cogs.directExpenses} isSub />
                    <ReportRow label="Less: Closing Stock" value={-data.cogs.closingStock} isSub />
                    
                    {/* Gross Profit */}
                    <TableRow className="bg-muted/50 font-bold text-lg">
                        <TableCell className="pl-4">Gross Profit</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono pr-8">{data.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>

                    {/* Operating Expenses Section */}
                    <SectionHeader label="Operating Expenses" value={-data.operatingExpenses.total} />
                    <ReportRow label="Salaries & Wages" value={data.operatingExpenses.salaries} isSub />
                    <ReportRow label="Rent Expense" value={data.operatingExpenses.rent} isSub />
                    <ReportRow label="Marketing & Advertising" value={data.operatingExpenses.marketing} isSub />
                    <ReportRow label="Depreciation" value={data.operatingExpenses.depreciation} isSub />
                    <ReportRow label="Other Operating Expenses" value={data.operatingExpenses.other} isSub />

                    {/* Operating Profit */}
                    <TableRow className="bg-muted/50 font-bold text-lg">
                        <TableCell className="pl-4">Operating Profit</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono pr-8">{data.operatingProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>

                    {/* Non-Operating Income/Expenses */}
                     <TableRow>
                        <TableCell className="pl-8 text-muted-foreground">Add: Non-Operating Income</TableCell>
                        <TableCell className="text-right font-mono pr-8 text-muted-foreground">{data.nonOperating.interestIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="pl-8 text-muted-foreground">Less: Non-Operating Expenses</TableCell>
                        <TableCell className="text-right font-mono pr-8 text-muted-foreground">({data.nonOperating.interestExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</TableCell>
                        <TableCell></TableCell>
                    </TableRow>

                </TableBody>
            </Table>
            <Separator className="my-4"/>
             <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-lg">
                <span className="text-xl font-bold">Net Profit</span>
                <span className="text-2xl font-bold font-mono">₹{data.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground pt-4">
              Note: This is a system-generated report based on the ledger balances. Figures are in INR.
          </CardFooter>
      </Card>
    </div>
  );
}
