
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
import { ReportRow } from "@/components/accounting/report-row";
import { useToast } from "@/hooks/use-toast";
import { useContext, useMemo } from "react";
import { AccountingContext } from "@/context/accounting-context";
import { allAccounts } from "@/lib/accounts";

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProfitAndLossPage() {
    const { toast } = useToast();
    const { journalVouchers } = useContext(AccountingContext)!;
    
    const accountBalances = useMemo(() => {
        const balances: Record<string, number> = {};

        allAccounts.forEach(acc => {
            balances[acc.code] = 0;
        });

        journalVouchers.forEach(voucher => {
            voucher.lines.forEach(line => {
                if (balances.hasOwnProperty(line.account)) {
                    const accountType = allAccounts.find(a => a.code === line.account)?.type;
                    const debit = parseFloat(line.debit);
                    const credit = parseFloat(line.credit);

                    if (accountType === 'Asset' || accountType === 'Expense') {
                        balances[line.account] += debit - credit;
                    } else { // Liability, Equity, Revenue
                        balances[line.account] += credit - debit;
                    }
                }
            });
        });
        return balances;
    }, [journalVouchers]);

    const data = useMemo(() => {
        const salesInvoices = journalVouchers.filter(v => v.id.startsWith("JV-INV-"));
        const salesCreditNotes = journalVouchers.filter(v => v.id.startsWith("JV-CN-"));
        const purchaseBills = journalVouchers.filter(v => v.id.startsWith("JV-BILL-"));
        const purchaseDebitNotes = journalVouchers.filter(v => v.id.startsWith("JV-DN-"));

        const totalSales = salesInvoices.reduce((acc, v) => acc + (v.lines.find(l => l.account === '4010')?.credit ? parseFloat(v.lines.find(l => l.account === '4010')!.credit) : 0), 0);
        const totalSalesReturns = salesCreditNotes.reduce((acc, v) => acc + (v.lines.find(l => l.account === '4010')?.debit ? parseFloat(v.lines.find(l => l.account === '4010')!.debit) : 0), 0);
        
        const totalPurchases = purchaseBills.reduce((acc, v) => acc + (v.lines.find(l => l.account === '5050')?.debit ? parseFloat(v.lines.find(l => l.account === '5050')!.debit) : 0), 0);
        const totalPurchaseReturns = purchaseDebitNotes.reduce((acc, v) => acc + (v.lines.find(l => l.account === '5050')?.credit ? parseFloat(v.lines.find(l => l.account === '5050')!.credit) : 0), 0);

        return {
            revenue: {
                sales: totalSales - totalSalesReturns,
                otherIncome: 0, // Placeholder
            },
            cogs: {
                openingStock: 0, // Placeholder
                purchases: totalPurchases - totalPurchaseReturns,
                directExpenses: 0, // Placeholder
                closingStock: 0, // Placeholder
            },
            operatingExpenses: {
                salaries: accountBalances['5020'] || 0,
                rent: accountBalances['5010'] || 0,
                marketing: 0, // Placeholder
                depreciation: accountBalances['5150'] || 0,
                other: (accountBalances['5030'] || 0) + (accountBalances['5040'] || 0) + (accountBalances['5160'] || 0),
            },
        };
    }, [journalVouchers, accountBalances]);


    const tradingDebits = data.cogs.openingStock + data.cogs.purchases + data.cogs.directExpenses;
    const tradingCredits = data.revenue.sales + data.cogs.closingStock;
    const grossProfit = tradingCredits - tradingDebits;
    const tradingTotal = Math.max(tradingDebits + (grossProfit > 0 ? grossProfit : 0), tradingCredits + (grossProfit < 0 ? -grossProfit : 0));

    const plDebits = Object.values(data.operatingExpenses).reduce((sum, val) => sum + val, 0);
    const plCredits = grossProfit + data.revenue.otherIncome;
    const netProfit = plCredits - plDebits;
    const plTotal = Math.max(plDebits + (netProfit > 0 ? netProfit : 0), plCredits + (netProfit < 0 ? -netProfit : 0));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading and Profit &amp; Loss Account</h1>
          <p className="text-muted-foreground">
            Summary of revenues, costs, and expenses in a horizontal T-form.
          </p>
        </div>
        <Button onClick={() => toast({ title: "Exporting PDF", description: "Your P&L report is being generated."})}>
          <FileDown className="mr-2"/>
          Export PDF
        </Button>
      </div>

       <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                        <CardTitle>Report Period</CardTitle>
                        <CardDescription>Select a date range to generate the report. Currently showing live data.</CardDescription>
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
              <CardTitle>Trading and Profit &amp; Loss Account</CardTitle>
              <CardDescription>For the period from 01-Apr-2023 to 31-Mar-2024 (Live Data)</CardDescription>
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
                            {grossProfit >= 0 && <ReportRow label="To Gross Profit c/d" value={grossProfit} />}
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
                <h3 className="text-xl font-semibold mb-4 text-center">Profit &amp; Loss Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Debits Column */}
                    <Table>
                        <TableHeader><TableRow><TableHead>Particulars</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                        <TableBody>
                             {grossProfit < 0 && <ReportRow label="To Gross Loss b/d" value={-grossProfit} />}
                            <ReportRow label="To Salaries & Wages" value={data.operatingExpenses.salaries} />
                            <ReportRow label="To Rent Expense" value={data.operatingExpenses.rent} />
                            <ReportRow label="To Marketing & Advertising" value={data.operatingExpenses.marketing} />
                            <ReportRow label="To Depreciation" value={data.operatingExpenses.depreciation} />
                            <ReportRow label="To Other Operating Expenses" value={data.operatingExpenses.other} />
                             {netProfit >= 0 && <ReportRow label="To Net Profit" value={netProfit} />}
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
                            {grossProfit >= 0 && <ReportRow label="By Gross Profit b/d" value={grossProfit} />}
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

    

    