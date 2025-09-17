
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
  TableHeader,
  TableHead,
  TableFooter,
} from "@/components/ui/table";
import { FileDown, CalendarDays } from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import { Separator } from "@/components/ui/separator";

const data = {
    revenue: {
        sales: 850000,
        otherIncome: 15000,
    },
    cogs: {
        openingStock: 75000,
        purchases: 420000,
        directExpenses: 25000,
        closingStock: 90000,
    },
    operatingExpenses: {
        salaries: 120000,
        rent: 60000,
        marketing: 35000,
        depreciation: 45000,
        other: 20000,
    },
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProfitAndLossPage() {

    const tradingDebits = data.cogs.openingStock + data.cogs.purchases + data.cogs.directExpenses;
    const tradingCredits = data.revenue.sales + data.cogs.closingStock;
    const grossProfit = tradingCredits - tradingDebits;
    const tradingTotal = tradingCredits;

    const plDebits = data.operatingExpenses.salaries + data.operatingExpenses.rent + data.operatingExpenses.marketing + data.operatingExpenses.depreciation + data.operatingExpenses.other;
    const plCredits = grossProfit + data.revenue.otherIncome;
    const netProfit = plCredits - plDebits;
    const plTotal = plCredits;
    
    const ReportRow = ({ label, value }: { label: string; value: number }) => (
         <TableRow>
            <TableCell>{label}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(value)}</TableCell>
        </TableRow>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading and Profit & Loss Account</h1>
          <p className="text-muted-foreground">
            Summary of revenues, costs, and expenses in a horizontal T-form.
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
                        <CardDescription>Select a date range to generate the report.</CardDescription>
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
              <CardTitle>Trading and Profit & Loss Account</CardTitle>
              <CardDescription>For the period from 01-Apr-2023 to 31-Mar-2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Trading Account Section */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-center">Trading Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Debits Column */}
                    <Table>
                        <TableHeader><TableRow><TableHead>Particulars</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <ReportRow label="To Opening Stock" value={data.cogs.openingStock} />
                            <ReportRow label="To Purchases" value={data.cogs.purchases} />
                            <ReportRow label="To Direct Expenses" value={data.cogs.directExpenses} />
                            {grossProfit > 0 && <ReportRow label="To Gross Profit c/d" value={grossProfit} />}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(tradingTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                    {/* Credits Column */}
                    <Table>
                        <TableHeader><TableRow><TableHead>Particulars</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <ReportRow label="By Sales Revenue" value={data.revenue.sales} />
                            <ReportRow label="By Closing Stock" value={data.cogs.closingStock} />
                            {grossProfit < 0 && <ReportRow label="By Gross Loss c/d" value={-grossProfit} />}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(tradingTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>

            <Separator/>

            {/* Profit & Loss Account Section */}
             <div>
                <h3 className="text-xl font-semibold mb-4 text-center">Profit & Loss Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Debits Column */}
                    <Table>
                        <TableHeader><TableRow><TableHead>Particulars</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                        <TableBody>
                             {grossProfit < 0 && <ReportRow label="To Gross Loss b/d" value={-grossProfit} />}
                            <ReportRow label="To Salaries & Wagages" value={data.operatingExpenses.salaries} />
                            <ReportRow label="To Rent Expense" value={data.operatingExpenses.rent} />
                            <ReportRow label="To Marketing & Advertising" value={data.operatingExpenses.marketing} />
                            <ReportRow label="To Depreciation" value={data.operatingExpenses.depreciation} />
                            <ReportRow label="To Other Operating Expenses" value={data.operatingExpenses.other} />
                             {netProfit > 0 && <ReportRow label="To Net Profit" value={netProfit} />}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(plTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                    {/* Credits Column */}
                    <Table>
                        <TableHeader><TableRow><TableHead>Particulars</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {grossProfit > 0 && <ReportRow label="By Gross Profit b/d" value={grossProfit} />}
                            <ReportRow label="By Other Income" value={data.revenue.otherIncome} />
                            {netProfit < 0 && <ReportRow label="By Net Loss" value={-netProfit} />}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(plTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
            
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground pt-4">
              Note: This is a system-generated report based on ledger balances. Figures are in INR.
          </CardFooter>
      </Card>
    </div>
  );
}

    
