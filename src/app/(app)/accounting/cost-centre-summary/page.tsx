
"use client";

import { useMemo, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, PieChart } from "lucide-react";
import { AccountingContext } from "@/context/accounting-context";
import { allAccounts, costCentres } from "@/lib/accounts";

const formatCurrency = (value: number) => {
    if (Math.abs(value) < 0.01) value = 0;
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CostCentreSummaryPage() {
    const { journalVouchers, loading } = useContext(AccountingContext)!;

    const costCentreData = useMemo(() => {
        const summary: Record<string, { income: number, expense: number, name: string }> = {};

        costCentres.forEach(cc => {
            summary[cc.id] = { name: cc.name, income: 0, expense: 0 };
        });

        journalVouchers.forEach(voucher => {
            voucher.lines.forEach(line => {
                if (line.costCentre && summary[line.costCentre]) {
                    const account = allAccounts.find(acc => acc.code === line.account);
                    if (!account) return;

                    const debit = parseFloat(line.debit);
                    const credit = parseFloat(line.credit);

                    if (account.type === 'Revenue') {
                        summary[line.costCentre].income += credit - debit;
                    } else if (account.type === 'Expense') {
                        summary[line.costCentre].expense += debit - credit;
                    }
                }
            });
        });
        
        return Object.values(summary).map(data => ({
            ...data,
            net: data.income - data.expense,
        }));
        
    }, [journalVouchers]);

    const totals = useMemo(() => {
        return costCentreData.reduce((acc, curr) => ({
            income: acc.income + curr.income,
            expense: acc.expense + curr.expense,
            net: acc.net + curr.net,
        }), { income: 0, expense: 0, net: 0 });
    }, [costCentreData]);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><PieChart/> Cost Centre Summary</h1>
          <p className="text-muted-foreground">
            A summary of income, expenses, and profitability for each cost centre.
          </p>
        </div>
        <Button variant="outline">
          <FileDown className="mr-2"/>
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profitability by Cost Centre</CardTitle>
          <CardDescription>
            Analyze the performance of different departments, projects, or business units.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Cost Centre</TableHead>
                <TableHead className="text-right">Total Income (₹)</TableHead>
                <TableHead className="text-right">Total Expenses (₹)</TableHead>
                <TableHead className="text-right">Net Profit / (Loss) (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : costCentreData.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No cost centre data found. Start by assigning cost centres in your journal vouchers.</TableCell></TableRow>
              ) : (
                costCentreData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{formatCurrency(item.income)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">{formatCurrency(item.expense)}</TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${item.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(item.net)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
             <TableFooter>
                <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.income)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.expense)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totals.net)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    