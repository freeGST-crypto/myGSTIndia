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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from "date-fns";

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

const formatCurrency = (value: number) => {
    // A value of -0.000001 should be 0.00, not -0.00
    if (Math.abs(value) < 0.01) value = 0;
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProfitAndLossPage() {
    const { toast } = useToast();
    const { journalVouchers, loading } = useContext(AccountingContext)!;
    
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
    
    const revenueAccounts = allAccounts.filter(a => a.type === 'Revenue');
    const expenseAccounts = allAccounts.filter(a => a.type === 'Expense');

    const totalRevenue = useMemo(() => revenueAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0), [accountBalances, revenueAccounts]);
    const totalCogs = useMemo(() => (accountBalances['5050'] || 0), [accountBalances]); // Assuming 5050 is Purchases/COGS
    
    const grossProfit = totalRevenue - totalCogs;
    
    const tradingDebits = totalCogs + (grossProfit >= 0 ? grossProfit : 0);
    const tradingCredits = totalRevenue + (grossProfit < 0 ? -grossProfit : 0);
    const tradingTotal = Math.max(tradingDebits, tradingCredits);
    
    const operatingExpenses = expenseAccounts.filter(a => a.code !== '5050');
    const totalOperatingExpenses = operatingExpenses.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
    
    const grossProfitBroughtDown = grossProfit >= 0 ? grossProfit : 0;
    const grossLossBroughtDown = grossProfit < 0 ? -grossProfit : 0;
    
    const plCreditSideTotal = grossProfitBroughtDown; // + other incomes if any
    const plDebitSideTotal = totalOperatingExpenses + grossLossBroughtDown;
    
    const netProfit = plCreditSideTotal - plDebitSideTotal;
    
    const finalPlDebits = plDebitSideTotal + (netProfit >= 0 ? netProfit : 0);
    const finalPlCredits = plCreditSideTotal + (netProfit < 0 ? -netProfit : 0);
    const plTotal = Math.max(finalPlDebits, finalPlCredits);

    const exportPdf = () => {
        const doc = new jsPDF();
        const date = new Date();
        
        doc.setFontSize(18);
        doc.text("Trading and Profit & Loss Account", 105, 22, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`For the period from 01-Apr-${date.getFullYear()-1} to 31-Mar-${date.getFullYear()}`, 105, 29, { align: 'center' });

        // Trading Account
        doc.setFontSize(14);
        doc.text("Trading Account", 105, 45, { align: 'center'});
        
        const tradingBody = [
            [
                { content: "Particulars", styles: { halign: 'left', fontStyle: 'bold' } }, 
                { content: "Amount (₹)", styles: { halign: 'right', fontStyle: 'bold' } }, 
                { content: "Particulars", styles: { halign: 'left', fontStyle: 'bold' } }, 
                { content: "Amount (₹)", styles: { halign: 'right', fontStyle: 'bold' } }
            ],
            [
                "To Purchases (COGS)", 
                { content: formatCurrency(totalCogs), styles: { halign: 'right' } },
                "By Sales Revenue", 
                { content: formatCurrency(totalRevenue), styles: { halign: 'right' } }
            ],
             [
                grossProfit >= 0 ? "To Gross Profit c/d" : "", 
                { content: grossProfit >= 0 ? formatCurrency(grossProfit) : "", styles: { halign: 'right' } },
                grossProfit < 0 ? "By Gross Loss c/d" : "", 
                { content: grossProfit < 0 ? formatCurrency(-grossProfit) : "", styles: { halign: 'right' } }
            ],
             [
                { content: "Total", styles: { fontStyle: 'bold' } }, 
                { content: formatCurrency(tradingTotal), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: "Total", styles: { fontStyle: 'bold' } }, 
                { content: formatCurrency(tradingTotal), styles: { halign: 'right', fontStyle: 'bold' } }
            ],
        ];

        (doc as any).autoTable({
            startY: 50,
            body: tradingBody,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 2 },
            didParseCell: function (data: any) {
                if (data.row.index > 0 && data.row.raw[data.column.index] === "" && data.column.index % 2 === 0) {
                     data.cell.styles.border = [false, false, false, false];
                }
            }
        });


        // Profit & Loss Account
        doc.setFontSize(14);
        doc.text("Profit & Loss Account", 105, (doc as any).lastAutoTable.finalY + 15, { align: 'center'});
        
        const plBodyDebit = [];
        if (grossProfit < 0) {
            plBodyDebit.push(["To Gross Loss b/d", { content: formatCurrency(-grossProfit), styles: { halign: 'right' }}]);
        }
        plBodyDebit.push(...operatingExpenses.map(acc => ([`To ${acc.name}`, { content: formatCurrency(accountBalances[acc.code] || 0), styles: { halign: 'right' }}])));
        if (netProfit >= 0) {
            plBodyDebit.push(["To Net Profit", { content: formatCurrency(netProfit), styles: { halign: 'right' }}]);
        }

        const plBodyCredit = [];
        if (grossProfit >= 0) {
            plBodyCredit.push(["By Gross Profit b/d", { content: formatCurrency(grossProfit), styles: { halign: 'right' }}]);
        }
         plBodyCredit.push(["By Other Income", { content: formatCurrency(0), styles: { halign: 'right' }}]);
        if (netProfit < 0) {
            plBodyCredit.push(["By Net Loss", { content: formatCurrency(-netProfit), styles: { halign: 'right' }}]);
        }
        
        const maxLength = Math.max(plBodyDebit.length, plBodyCredit.length);
        const mergedBody = Array.from({ length: maxLength }).map((_, i) => {
            const debitRow = plBodyDebit[i] || ["", ""];
            const creditRow = plBodyCredit[i] || ["", ""];
            return [debitRow[0], debitRow[1], creditRow[0], creditRow[1]];
        });


        (doc as any).autoTable({
             startY: (doc as any).lastAutoTable.finalY + 20,
             body: [
                 ...mergedBody,
                 [
                    { content: "Total", styles: { fontStyle: 'bold' } }, 
                    { content: formatCurrency(plTotal), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: "Total", styles: { fontStyle: 'bold' } }, 
                    { content: formatCurrency(plTotal), styles: { halign: 'right', fontStyle: 'bold' } }
                ],
             ],
             theme: 'grid',
             styles: { fontSize: 10, cellPadding: 2 },
             didParseCell: function (data: any) {
                if (data.row.index < mergedBody.length && data.row.raw[data.column.index] === "" && data.column.index % 2 === 0) {
                     data.cell.styles.border = [false, false, false, false];
                }
            }
        });


        doc.save(`P&L_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
        toast({ title: "Export Successful", description: "Your P&L report has been exported as a PDF." });
    }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading and Profit &amp; Loss Account</h1>
          <p className="text-muted-foreground">
            Summary of revenues, costs, and expenses in a horizontal T-form.
          </p>
        </div>
        <Button onClick={exportPdf}>
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
                            <ReportRow label="To Purchases (COGS)" value={totalCogs} />
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
                            <ReportRow label="By Sales Revenue" value={totalRevenue} />
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
                             {operatingExpenses.map(acc => (
                                <ReportRow key={acc.code} label={`To ${acc.name}`} value={accountBalances[acc.code] || 0} />
                             ))}
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
                            {/* Placeholder for other income */}
                             <ReportRow label="By Other Income" value={0} />
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
