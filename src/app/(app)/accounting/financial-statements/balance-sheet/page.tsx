
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
                    const debit = parseFloat(line.debit);
                    const credit = parseFloat(line.credit);
                    balances[line.account] += debit - credit;
                }
            });
        });
        return balances;
    }, [journalVouchers]);
    
    // Calculate P&L for Retained Earnings
    const revenueAccounts = allAccounts.filter(a => a.type === 'Revenue').map(a => a.code);
    const expenseAccounts = allAccounts.filter(a => a.type === 'Expense').map(a => a.code);
    
    // Revenue is credit-positive, so we negate the balance (which is debit-positive)
    const totalRevenue = revenueAccounts.reduce((sum, code) => sum + -(accountBalances[code] || 0), 0);
    // Expenses are debit-positive, so we use the balance directly
    const totalExpenses = expenseAccounts.reduce((sum, code) => sum + (accountBalances[code] || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    const data = useMemo(() => {
        return {
            equityAndLiabilities: {
                capitalAccount: -(accountBalances['3010'] || 0),
                reservesAndSurplus: -(accountBalances['3020'] || 0) + netProfit,
                longTermLoans: -(accountBalances['2210'] || 0),
                currentLiabilities: {
                    sundryCreditors: -(accountBalances['2010'] || 0),
                    gstPayable: -(accountBalances['2110'] || 0),
                    otherCurrentLiabilities: 0,
                }
            },
            assets: {
                fixedAssets: {
                    officeEquipment: accountBalances['1450'] || 0,
                    lessAccumulatedDepreciation: accountBalances['1455'] || 0,
                },
                investments: 0,
                currentAssets: {
                    sundryDebtors: accountBalances['1210'] || 0,
                    cashInHand: accountBalances['1010'] || 0,
                    bankBalance: accountBalances['1020'] || 0,
                    prepaidInsurance: accountBalances['1510'] || 0,
                    officeSupplies: accountBalances['1410'] || 0,
                }
            }
        };
    }, [accountBalances, netProfit]);


    const totalCurrentLiabilities = Object.values(data.equityAndLiabilities.currentLiabilities).reduce((sum, val) => sum + val, 0);
    const totalEquityAndLiabilities = data.equityAndLiabilities.capitalAccount + data.equityAndLiabilities.reservesAndSurplus + data.equityAndLiabilities.longTermLoans + totalCurrentLiabilities;

    const netFixedAssets = data.assets.fixedAssets.officeEquipment + data.assets.fixedAssets.lessAccumulatedDepreciation;
    const totalCurrentAssets = Object.values(data.assets.currentAssets).reduce((sum, val) => sum + val, 0);
    const totalAssets = netFixedAssets + data.assets.investments + totalCurrentAssets;
    
    // Sample static data for schedules - will be made dynamic later
    const depreciationSchedule = [
        { asset: "Office Equipment", openingWdv: 0, additions: 0, depreciationRate: 20, depreciation: 5000, closingWdv: -5000 },
    ];
    const totalDepreciation = depreciationSchedule.reduce((acc, item) => acc + item.depreciation, 0);

    const capitalAccounts = [
        { partner: "Owner's Equity", opening: 0, introduced: 0, drawings: 0, profitShare: netProfit, closing: netProfit },
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
                <Table>
                    <TableHeader><TableRow><TableHead>Liabilities & Equity</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell className="font-semibold">Capital & Reserves</TableCell><TableCell></TableCell></TableRow>
                        <ReportRow label="Capital Account" value={data.equityAndLiabilities.capitalAccount} isSub />
                        <ReportRow label="Reserves & Surplus (incl. P&L)" value={data.equityAndLiabilities.reservesAndSurplus} isSub />
                        
                        <TableRow><TableCell className="font-semibold pt-4">Long-Term Liabilities</TableCell><TableCell></TableCell></TableRow>
                        <ReportRow label="Long-Term Loans" value={data.equityAndLiabilities.longTermLoans} isSub />

                        <TableRow><TableCell className="font-semibold pt-4">Current Liabilities</TableCell><TableCell></TableCell></TableRow>
                        <ReportRow label="Sundry Creditors" value={data.equityAndLiabilities.currentLiabilities.sundryCreditors} isSub />
                        <ReportRow label="GST Payable" value={data.equityAndLiabilities.currentLiabilities.gstPayable} isSub />
                        <ReportRow label="Other Current Liabilities" value={data.equityAndLiabilities.currentLiabilities.otherCurrentLiabilities} isSub />
                    </TableBody>
                     <TableFooter>
                        <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(totalEquityAndLiabilities)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>

                {/* Assets Column */}
                <Table>
                    <TableHeader><TableRow><TableHead>Assets</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell className="font-semibold">Fixed Assets</TableCell><TableCell></TableCell></TableRow>
                        <ReportRow label="Office Equipment" value={data.assets.fixedAssets.officeEquipment} isSub />
                        <ReportRow label="Less: Acc. Depreciation" value={data.assets.fixedAssets.lessAccumulatedDepreciation} isSub />
                         <TableRow><TableCell className="font-semibold pl-8">Net Fixed Assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(netFixedAssets)}</TableCell></TableRow>

                        <TableRow><TableCell className="font-semibold pt-4">Investments</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.investments)}</TableCell></TableRow>

                        <TableRow><TableCell className="font-semibold pt-4">Current Assets</TableCell><TableCell></TableCell></TableRow>
                         <ReportRow label="Office Supplies" value={data.assets.currentAssets.officeSupplies} isSub />
                        <ReportRow label="Sundry Debtors" value={data.assets.currentAssets.sundryDebtors} isSub />
                        <ReportRow label="Cash in Hand" value={data.assets.currentAssets.cashInHand} isSub />
                        <ReportRow label="Bank Balance" value={data.assets.currentAssets.bankBalance} isSub />
                        <ReportRow label="Prepaid Insurance" value={data.assets.currentAssets.prepaidInsurance} isSub />
                    </TableBody>
                     <TableFooter>
                        <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(totalAssets)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
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
                                        <TableCell className="font-medium">Share of Profit</TableCell>
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

    