
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileDown, Calendar as CalendarIcon } from "lucide-react";
import { ReportRow } from "@/components/accounting/report-row";
import { useToast } from "@/hooks/use-toast";
import { useState, useContext, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AccountingContext } from "@/context/accounting-context";
import { allAccounts } from "@/lib/accounts";

const formatCurrency = (value: number) => {
    // A value of -0.000001 should be 0.00, not -0.00
    if (Math.abs(value) < 0.01) value = 0;
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BalanceSheetPage() {
    const { toast } = useToast();
    const { journalVouchers } = useContext(AccountingContext)!;
    const [date, setDate] = useState<Date | undefined>(new Date());

    const accountBalances = useMemo(() => {
        const balances: Record<string, number> = {};

        allAccounts.forEach(acc => {
            balances[acc.code] = 0;
        });

        journalVouchers.forEach(voucher => {
            voucher.lines.forEach(line => {
                if (balances.hasOwnProperty(line.account)) {
                    const accountType = allAccounts.find(a => a.code === line.account)?.type;
                     if (accountType === 'Asset' || accountType === 'Expense') {
                        balances[line.account] += parseFloat(line.debit) - parseFloat(line.credit);
                    } else { // Liability, Equity, Revenue
                        balances[line.account] += parseFloat(line.credit) - parseFloat(line.debit);
                    }
                }
            });
        });
        return balances;
    }, [journalVouchers]);
    
    // Calculate P&L for Retained Earnings
    const netProfit = useMemo(() => {
        const revenueAccounts = allAccounts.filter(a => a.type === 'Revenue');
        const expenseAccounts = allAccounts.filter(a => a.type === 'Expense');
        const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
        const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
        return totalRevenue - totalExpenses;
    }, [accountBalances]);

    // Aggregate Liabilities and Equity
    const capitalAccount = (accountBalances['3010'] || 0);
    // Correctly add Net Profit/Loss to Retained Earnings
    const reservesAndSurplus = (accountBalances['3020'] || 0) + netProfit;
    
    const longTermLiabilities = allAccounts
        .filter(a => a.type === 'Liability' && a.name.includes('Long-Term'))
        .reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
    
    const currentLiabilitiesAccounts = allAccounts.filter(a => a.type === 'Liability' && !a.name.includes('Long-Term'));
    const totalCurrentLiabilities = currentLiabilitiesAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);

    const totalEquityAndLiabilities = capitalAccount + reservesAndSurplus + longTermLiabilities + totalCurrentLiabilities;

    // Aggregate Assets
    const fixedAssetsAccounts = allAccounts.filter(a => a.name.includes('Fixed Asset') || a.name.includes('Accumulated Depreciation'));
    const netFixedAssets = fixedAssetsAccounts.reduce((sum, acc) => {
        const balance = accountBalances[acc.code] || 0;
        // Accumulated Depreciation is a contra-asset, its balance will be negative in our logic (credit), so we add.
        // Or if it's stored as positive, we subtract. The current logic makes it a negative asset balance.
        return sum + balance;
    }, 0);
    
    const investmentAccounts = allAccounts.filter(a => a.name.includes('Investments'));
    const totalInvestments = investmentAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);

    const currentAssetsAccounts = allAccounts.filter(a => a.type === 'Asset' && !fixedAssetsAccounts.includes(a) && !investmentAccounts.includes(a));
    const totalCurrentAssets = currentAssetsAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
    
    const totalAssets = netFixedAssets + totalInvestments + totalCurrentAssets;

    // Schedules
    const depreciationSchedule = [
        { asset: "Office Equipment", openingWdv: 0, additions: 0, depreciationRate: 20, depreciation: 5000, closingWdv: -5000 },
    ];
    const totalDepreciation = depreciationSchedule.reduce((acc, item) => acc + item.depreciation, 0);

    const capitalAccounts = [
        { partner: "Owner's Equity", opening: 0, introduced: 0, drawings: 0, profitShare: netProfit, closing: capitalAccount + reservesAndSurplus },
    ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">
            A snapshot of your company's financial health.
          </p>
        </div>
        <Button onClick={() => toast({ title: "Exporting PDF", description: "Your Balance Sheet is being generated."})}>
          <FileDown className="mr-2"/>
          Export PDF
        </Button>
      </div>

       <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                        <CardTitle>Report Date</CardTitle>
                        <CardDescription>Select a date to generate the balance sheet. (Currently shows live data)</CardDescription>
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full md:w-[280px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
        </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>As on {date ? format(date, "PPP") : 'selected date'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {/* Liabilities + Equity Column */}
                <div className="w-full">
                    <Table className="w-full">
                        <TableHeader><TableRow><TableHead>Liabilities & Equity</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell className="font-semibold">Capital & Reserves</TableCell><TableCell></TableCell></TableRow>
                            <ReportRow label="Capital Account" value={capitalAccount} isSub />
                            <ReportRow label="Reserves & Surplus (incl. P&L)" value={reservesAndSurplus} isSub />
                            
                            <TableRow><TableCell className="font-semibold pt-4">Long-Term Liabilities</TableCell><TableCell></TableCell></TableRow>
                            <ReportRow label="Long-Term Loans" value={longTermLiabilities} isSub />

                            <TableRow><TableCell className="font-semibold pt-4">Current Liabilities</TableCell><TableCell></TableCell></TableRow>
                             {currentLiabilitiesAccounts.map(acc => (
                                <ReportRow key={acc.code} label={acc.name} value={accountBalances[acc.code] || 0} isSub />
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(totalEquityAndLiabilities)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>

                {/* Assets Column */}
                <div className="w-full">
                    <Table className="w-full">
                        <TableHeader><TableRow><TableHead>Assets</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell className="font-semibold">Fixed Assets</TableCell><TableCell></TableCell></TableRow>
                            {fixedAssetsAccounts.map(acc => (
                                <ReportRow key={acc.code} label={acc.name} value={accountBalances[acc.code] || 0} isSub />
                            ))}
                            <TableRow><TableCell className="font-semibold pl-8">Net Fixed Assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(netFixedAssets)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Investments</TableCell><TableCell className="text-right font-mono">{formatCurrency(totalInvestments)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Current Assets</TableCell><TableCell></TableCell></TableRow>
                             {currentAssetsAccounts.map(acc => (
                                <ReportRow key={acc.code} label={acc.name} value={accountBalances[acc.code] || 0} isSub />
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(totalAssets)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
            
            {Math.abs(totalAssets - totalEquityAndLiabilities) > 0.01 && (
                 <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive font-semibold text-center">
                    Warning: Balance Sheet is out of balance by ₹{formatCurrency(Math.abs(totalAssets - totalEquityAndLiabilities))}!
                </div>
            )}
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground pt-4">
              Note: This is a system-generated report. Figures are in INR.
          </CardFooter>
      </Card>

        <Card>
          <CardHeader>
              <CardTitle>Schedules to the Balance Sheet</CardTitle>
              <CardDescription>Detailed breakdown of key Balance Sheet items.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="depreciation">
                    <AccordionTrigger>Schedule 1: Depreciation on Fixed Assets</AccordionTrigger>
                    <AccordionContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset</TableHead>
                                        <TableHead className="text-right">Opening WDV</TableHead>
                                        <TableHead className="text-right">Additions</TableHead>
                                        <TableHead className="text-right">Depreciation Rate (%)</TableHead>
                                        <TableHead className="text-right">Depreciation for Year</TableHead>
                                        <TableHead className="text-right">Closing WDV</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {depreciationSchedule.map((item) => (
                                        <TableRow key={item.asset}>
                                            <TableCell className="font-medium">{item.asset}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.openingWdv)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.additions)}</TableCell>
                                            <TableCell className="text-right">{item.depreciationRate}%</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.depreciation)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.closingWdv)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell colSpan={4}>Total</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalDepreciation)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="capital-accounts">
                    <AccordionTrigger>Schedule 2: Capital Accounts</AccordionTrigger>
                    <AccordionContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Particulars</TableHead>
                                        {capitalAccounts.map(p => <TableHead key={p.partner} className="text-right">{p.partner}</TableHead>)}
                                        <TableHead className="text-right font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Opening Balance</TableCell>
                                        {capitalAccounts.map(p => <TableCell key={p.partner} className="text-right font-mono">{formatCurrency(p.opening)}</TableCell>)}
                                        <TableCell className="text-right font-mono font-bold">{formatCurrency(capitalAccounts.reduce((acc, p) => acc + p.opening, 0))}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Capital Introduced</TableCell>
                                        {capitalAccounts.map(p => <TableCell key={p.partner} className="text-right font-mono">{formatCurrency(p.introduced)}</TableCell>)}
                                        <TableCell className="text-right font-mono font-bold">{formatCurrency(capitalAccounts.reduce((acc, p) => acc + p.introduced, 0))}</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="font-medium">Drawings</TableCell>
                                        {capitalAccounts.map(p => <TableCell key={p.partner} className="text-right font-mono">{formatCurrency(p.drawings)}</TableCell>)}
                                        <TableCell className="text-right font-mono font-bold">{formatCurrency(capitalAccounts.reduce((acc, p) => acc + p.drawings, 0))}</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="font-medium">Share of Profit/(Loss)</TableCell>
                                        {capitalAccounts.map(p => <TableCell key={p.partner} className="text-right font-mono">{formatCurrency(p.profitShare)}</TableCell>)}
                                        <TableCell className="text-right font-mono font-bold">{formatCurrency(capitalAccounts.reduce((acc, p) => acc + p.profitShare, 0))}</TableCell>
                                    </TableRow>
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Closing Balance</TableCell>
                                         {capitalAccounts.map(p => <TableCell key={p.partner} className="text-right font-mono">{formatCurrency(p.closing)}</TableCell>)}
                                        <TableCell className="text-right font-mono">{formatCurrency(capitalAccounts.reduce((acc, p) => acc + p.closing, 0))}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </CardContent>
      </Card>
    </div>
  );
}
