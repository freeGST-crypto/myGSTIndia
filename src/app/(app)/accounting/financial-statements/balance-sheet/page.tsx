
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
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

export default function BalanceSheetPage() {
    const { toast } = useToast();
    const { journalVouchers } = useContext(AccountingContext)!;
    const [user] = useAuthState(auth);
    const [date, setDate] = useState<Date | undefined>(new Date());

    const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
    const [customersSnapshot] = useCollection(customersQuery);
    const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name, type: 'Customer' })) || [], [customersSnapshot]);
    
    const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
    const [vendorsSnapshot] = useCollection(vendorsQuery);
    const vendors = useMemo(() => vendorsSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name, type: 'Vendor' })) || [], [vendorsSnapshot]);
    
    const accountsQuery = user ? query(collection(db, 'user_accounts'), where("userId", "==", user.uid)) : null;
    const [accountsSnapshot] = useCollection(accountsQuery);
    const userAccounts = useMemo(() => accountsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [accountsSnapshot]);

    const accountBalances = useMemo(() => {
        const balances: Record<string, number> = {};
        const allDynamicAccounts = [
            ...allAccounts,
            ...userAccounts,
            ...customers.map(c => ({ code: c.id, name: c.name, type: 'Asset' })),
            ...vendors.map(v => ({ code: v.id, name: v.name, type: 'Liability' })),
        ];

        allDynamicAccounts.forEach((acc: any) => { balances[acc.code] = acc.openingWdv || 0; });
        
        journalVouchers.forEach(voucher => {
            voucher.lines.forEach(line => {
                if (!balances.hasOwnProperty(line.account)) {
                    balances[line.account] = 0;
                }
                 const debit = parseFloat(line.debit);
                 const credit = parseFloat(line.credit);
                 balances[line.account] += debit - credit;
            });
        });
        
        Object.keys(balances).forEach(key => {
            const accDetails = allDynamicAccounts.find((a: any) => a.code === key);
            if (accDetails && ["Liability", "Equity", "Revenue"].includes(accDetails.type)) {
                if(balances[key] !== 0) balances[key] = -balances[key];
            }
        });
        
        return balances;
    }, [journalVouchers, customers, vendors, userAccounts]);
    
    // Calculate P&L for Retained Earnings
    const netProfit = useMemo(() => {
        const revenueAccounts = allAccounts.filter(a => a.type === 'Revenue');
        const expenseAccounts = allAccounts.filter(a => a.type === 'Expense');
        const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
        const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
        return totalRevenue - totalExpenses;
    }, [accountBalances]);

    // Aggregate Liabilities and Equity
    const capitalAccount = (accountBalances['2010'] || 0);
    const reservesAndSurplus = (accountBalances['2020'] || 0) + netProfit;
    
    const longTermLiabilities = allAccounts
        .filter(a => a.type === 'Long Term Liability')
        .reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
    
    const currentLiabilitiesAccounts = [
        ...allAccounts.filter(a => a.type === 'Current Liability'),
        ...vendors.map(v => ({code: v.id, name: v.name}))
    ];
    const totalCurrentLiabilities = currentLiabilitiesAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);

    const totalEquityAndLiabilities = capitalAccount + reservesAndSurplus + longTermLiabilities + totalCurrentLiabilities;

    // Aggregate Assets
    const fixedAssetsAccounts = [
        ...allAccounts.filter(a => a.type === 'Fixed Asset'),
        ...userAccounts.filter((a: any) => a.type === 'Fixed Asset')
    ];
    const netFixedAssets = fixedAssetsAccounts.reduce((sum, acc: any) => sum + (accountBalances[acc.code] || 0), 0);
    
    const investmentAccounts = allAccounts.filter(a => a.type === 'Investment');
    const totalInvestments = investmentAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);
    
    const totalReceivables = customers.reduce((sum, customer) => sum + (accountBalances[customer.id] || 0), 0);
    
    const currentAssetsAccounts = allAccounts.filter(a => 
      ['Current Asset', 'Cash', 'Bank'].includes(a.type)
    );
    const totalOtherCurrentAssets = currentAssetsAccounts.reduce((sum, acc) => sum + (accountBalances[acc.code] || 0), 0);

    const totalAssets = netFixedAssets + totalInvestments + totalReceivables + totalOtherCurrentAssets;

    // Schedules
    const depreciationSchedule = useMemo(() => {
        return userAccounts.filter((a: any) => a.type === 'Fixed Asset').map((asset: any) => {
            const openingWdv = asset.openingWdv || 0;
            const additions = 0; // Simplified for now
            const depreciationRate = asset.depreciationRate || 0;
            const depreciation = openingWdv * (depreciationRate / 100);
            const closingWdv = openingWdv - depreciation;
            return {
                asset: asset.name,
                openingWdv,
                additions,
                depreciationRate,
                depreciation,
                closingWdv,
            };
        });
    }, [userAccounts]);
    const totalDepreciation = depreciationSchedule.reduce((acc, item) => acc + item.depreciation, 0);

    const capitalAccounts = useMemo(() => {
        if (journalVouchers.length === 0 && capitalAccount === 0) return [];
        return [
            { partner: "Owner's Equity", opening: 0, introduced: capitalAccount, drawings: 0, profitShare: netProfit, closing: capitalAccount + reservesAndSurplus },
        ];
    }, [journalVouchers, netProfit, capitalAccount, reservesAndSurplus]);
    
    const exportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Balance Sheet", 14, 22);
        doc.setFontSize(11);
        doc.text(`As on ${date ? format(date, "PPP") : 'selected date'}`, 14, 29);

        // Liabilities and Equity
        const liabilitiesData = [
            ["Capital & Reserves", ""],
            ["  Capital Account", formatCurrency(capitalAccount)],
            ["  Reserves & Surplus (incl. P&L)", formatCurrency(reservesAndSurplus)],
            ["Long-Term Liabilities", ""],
            ["  Long-Term Loans", formatCurrency(longTermLiabilities)],
            ["Current Liabilities", ""],
            ...currentLiabilitiesAccounts.map(acc => [`  ${acc.name}`, formatCurrency(accountBalances[acc.code] || 0)]),
        ];
        (doc as any).autoTable({
            head: [['Liabilities & Equity', 'Amount (₹)']],
            body: liabilitiesData,
            startY: 40,
            theme: 'striped',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            foot: [
                ['Total', formatCurrency(totalEquityAndLiabilities)]
            ],
            footStyles: { fontStyle: 'bold', fillColor: [230, 230, 230] }
        });

        // Assets
        const assetsData = [
            ["Fixed Assets", ""],
            ...fixedAssetsAccounts.map((acc: any) => [`  ${acc.name}`, formatCurrency(accountBalances[acc.code] || 0)]),
            ["Net Fixed Assets", formatCurrency(netFixedAssets)],
            ["Investments", formatCurrency(totalInvestments)],
            ["Current Assets", ""],
            ["  Accounts Receivable", formatCurrency(totalReceivables)],
            ...currentAssetsAccounts.map(acc => [`  ${acc.name}`, formatCurrency(accountBalances[acc.code] || 0)]),
        ];
         (doc as any).autoTable({
            head: [['Assets', 'Amount (₹)']],
            body: assetsData,
            startY: (doc as any).lastAutoTable.finalY + 10,
            theme: 'striped',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            foot: [
                ['Total', formatCurrency(totalAssets)]
            ],
            footStyles: { fontStyle: 'bold', fillColor: [230, 230, 230] }
        });

        doc.save(`Balance_Sheet_${format(date || new Date(), "yyyy-MM-dd")}.pdf`);
        toast({ title: "Export Successful", description: "Your Balance Sheet has been exported as a PDF." });
    }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">
            A snapshot of your company's financial health.
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
                            {fixedAssetsAccounts.map((acc: any) => (
                                <ReportRow key={acc.code} label={acc.name} value={accountBalances[acc.code] || 0} isSub />
                            ))}
                            <TableRow><TableCell className="font-semibold pl-8">Net Fixed Assets</TableCell><TableCell className="text-right font-mono font-semibold">{formatCurrency(netFixedAssets)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Investments</TableCell><TableCell className="text-right font-mono">{formatCurrency(totalInvestments)}</TableCell></TableRow>

                            <TableRow><TableCell className="font-semibold pt-4">Current Assets</TableCell><TableCell></TableCell></TableRow>
                            <ReportRow label="Accounts Receivable" value={totalReceivables} isSub />
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
            <Accordion type="multiple" defaultValue={["depreciation", "capital-accounts"]} className="w-full">
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
                                    {depreciationSchedule.length > 0 ? depreciationSchedule.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.asset}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.openingWdv)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.additions)}</TableCell>
                                            <TableCell className="text-right">{item.depreciationRate}%</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.depreciation)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(item.closingWdv)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No fixed asset data found. Add fixed assets in the Chart of Accounts.</TableCell></TableRow>
                                    )}
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
                                     {capitalAccounts.length > 0 ? (
                                        <>
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
                                        </>
                                     ) : (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No capital account data for this period.</TableCell></TableRow>
                                     )}
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
