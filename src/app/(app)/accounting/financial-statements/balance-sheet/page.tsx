
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
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const data = {
    equityAndLiabilities: {
        capitalAccount: 500000,
        reservesAndSurplus: 150000,
        longTermLoans: 200000,
        currentLiabilities: {
            sundryCreditors: 85000,
            billsPayable: 40000,
            outstandingExpenses: 25000,
        }
    },
    assets: {
        fixedAssets: {
            landAndBuilding: 400000,
            plantAndMachinery: 250000,
            lessAccumulatedDepreciation: 75000,
        },
        investments: 50000,
        currentAssets: {
            closingStock: 90000,
            sundryDebtors: 125000,
            cashInHand: 30000,
            bankBalance: 75000,
        }
    }
};

const depreciationSchedule = [
    { asset: "Land & Building", openingWdv: 400000, additions: 0, depreciationRate: 5, depreciation: 20000, closingWdv: 380000 },
    { asset: "Plant & Machinery", openingWdv: 250000, additions: 50000, depreciationRate: 15, depreciation: 45000, closingWdv: 255000 },
];

const capitalAccounts = [
    { partner: "Rohan Sharma", opening: 250000, introduced: 50000, drawings: -20000, profitShare: 85000, closing: 365000 },
    { partner: "Priya Mehta", opening: 250000, introduced: 0, drawings: -15000, profitShare: 85000, closing: 320000 },
];


const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BalanceSheetPage() {
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const totalCurrentLiabilities = data.equityAndLiabilities.currentLiabilities.sundryCreditors + data.equityAndLiabilities.currentLiabilities.billsPayable + data.equityAndLiabilities.currentLiabilities.outstandingExpenses;
    const totalEquityAndLiabilities = data.equityAndLiabilities.capitalAccount + data.equityAndLiabilities.reservesAndSurplus + data.equityAndLiabilities.longTermLoans + totalCurrentLiabilities;

    const netFixedAssets = data.assets.fixedAssets.landAndBuilding + data.assets.fixedAssets.plantAndMachinery - data.assets.fixedAssets.lessAccumulatedDepreciation;
    const totalCurrentAssets = data.assets.currentAssets.closingStock + data.assets.currentAssets.sundryDebtors + data.assets.currentAssets.cashInHand + data.assets.currentAssets.bankBalance;
    const totalAssets = netFixedAssets + data.assets.investments + totalCurrentAssets;

    const totalDepreciation = depreciationSchedule.reduce((acc, item) => acc + item.depreciation, 0);


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
                        <CardDescription>Select a date to generate the balance sheet.</CardDescription>
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-[280px] justify-start text-left font-normal",
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
                        <ReportRow label="Reserves & Surplus" value={data.equityAndLiabilities.reservesAndSurplus} isSub />
                        
                        <TableRow><TableCell className="font-semibold pt-4">Long-Term Liabilities</TableCell><TableCell></TableCell></TableRow>
                        <ReportRow label="Long-Term Loans" value={data.equityAndLiabilities.longTermLoans} isSub />

                        <TableRow><TableCell className="font-semibold pt-4">Current Liabilities</TableCell><TableCell></TableCell></TableRow>
                        <ReportRow label="Sundry Creditors" value={data.equityAndLiabilities.currentLiabilities.sundryCreditors} isSub />
                        <ReportRow label="Bills Payable" value={data.equityAndLiabilities.currentLiabilities.billsPayable} isSub />
                        <ReportRow label="Outstanding Expenses" value={data.equityAndLiabilities.currentLiabilities.outstandingExpenses} isSub />
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
                        <ReportRow label="Land & Building" value={data.assets.fixedAssets.landAndBuilding} isSub />
                        <ReportRow label="Plant & Machinery" value={data.assets.fixedAssets.plantAndMachinery} isSub />
                        <ReportRow label="Less: Acc. Depreciation" value={-data.assets.fixedAssets.lessAccumulatedDepreciation} isSub />
                         <TableRow><TableCell className="font-semibold pl-8">Net Fixed Assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(netFixedAssets)}</TableCell></TableRow>

                        <TableRow><TableCell className="font-semibold pt-4">Investments</TableCell><TableCell className="text-right font-mono">{formatCurrency(data.assets.investments)}</TableCell></TableRow>

                        <TableRow><TableCell className="font-semibold pt-4">Current Assets</TableCell><TableCell></TableCell></TableRow>
                        <ReportRow label="Closing Stock" value={data.assets.currentAssets.closingStock} isSub />
                        <ReportRow label="Sundry Debtors" value={data.assets.currentAssets.sundryDebtors} isSub />
                        <ReportRow label="Cash in Hand" value={data.assets.currentAssets.cashInHand} isSub />
                        <ReportRow label="Bank Balance" value={data.assets.currentAssets.bankBalance} isSub />
                    </TableBody>
                     <TableFooter>
                        <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(totalAssets)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            
            {totalAssets !== totalEquityAndLiabilities && (
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
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="capital-accounts">
                    <AccordionTrigger>Schedule 2: Partners' / Directors' Capital Accounts</AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </CardContent>
      </Card>
    </div>
  );
}

    