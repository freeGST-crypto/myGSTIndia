
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

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BalanceSheetPage() {
    
    const totalCurrentLiabilities = data.equityAndLiabilities.currentLiabilities.sundryCreditors + data.equityAndLiabilities.currentLiabilities.billsPayable + data.equityAndLiabilities.currentLiabilities.outstandingExpenses;
    const totalEquityAndLiabilities = data.equityAndLiabilities.capitalAccount + data.equityAndLiabilities.reservesAndSurplus + data.equityAndLiabilities.longTermLoans + totalCurrentLiabilities;

    const netFixedAssets = data.assets.fixedAssets.landAndBuilding + data.assets.fixedAssets.plantAndMachinery - data.assets.fixedAssets.lessAccumulatedDepreciation;
    const totalCurrentAssets = data.assets.currentAssets.closingStock + data.assets.currentAssets.sundryDebtors + data.assets.currentAssets.cashInHand + data.assets.currentAssets.bankBalance;
    const totalAssets = netFixedAssets + data.assets.investments + totalCurrentAssets;


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">
            A snapshot of your company's financial health.
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
                        <CardTitle>Report Date</CardTitle>
                        <CardDescription>Select a date to generate the balance sheet. Currently showing live data.</CardDescription>
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
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>As on 31st March 2024</CardDescription>
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
    </div>
  );
}
