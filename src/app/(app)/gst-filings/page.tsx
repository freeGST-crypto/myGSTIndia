
"use client";

import { useState, useMemo, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, GitCompareArrows, FileText, ArrowRight, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { useToast } from "@/hooks/use-toast";
import { AccountingContext } from "@/context/accounting-context";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function GstFilingsPage() {
    const [date, setDate] = useState<Date>(new Date());
    const period = format(date, 'yyyy-MM');
    const { toast } = useToast();
    const { journalVouchers, loading } = useContext(AccountingContext)!;
    
    const { gstr1Summary, gstr3bSummary } = useMemo(() => {
        const periodStart = startOfMonth(new Date(period));
        const periodEnd = endOfMonth(new Date(period));
        
        const salesInvoices = journalVouchers.filter(v => {
            if (!v || !v.id || !v.date) return false;
            const vDate = new Date(v.date);
            return v.id.startsWith("JV-INV-") && vDate >= periodStart && vDate <= periodEnd;
        });
        
        const purchaseBills = journalVouchers.filter(v => {
            if (!v || !v.id || !v.date) return false;
            const vDate = new Date(v.date);
            return v.id.startsWith("JV-BILL-") && vDate >= periodStart && vDate <= periodEnd;
        });
        
        const purchaseReturns = journalVouchers.filter(v => {
             if (!v || !v.id || !v.date) return false;
            const vDate = new Date(v.date);
            return v.id.startsWith("JV-DN-") && vDate >= periodStart && vDate <= periodEnd;
        });

        const b2bTaxableValue = salesInvoices.reduce((acc, v) => acc + (v.lines.find(l => l.account === '4010')?.credit ? parseFloat(v.lines.find(l => l.account === '4010')!.credit) : 0), 0);
        const b2bTaxAmount = salesInvoices.reduce((acc, v) => acc + (v.lines.find(l => l.account === '2110')?.credit ? parseFloat(v.lines.find(l => l.account === '2110')!.credit) : 0), 0);
        
        const dynamicGstr1Summary = [
            { type: "B2B Supplies", invoices: salesInvoices.length, taxableValue: b2bTaxableValue, taxAmount: b2bTaxAmount, total: b2bTaxableValue + b2bTaxAmount },
        ];

        const itcAvailable = purchaseBills.reduce((acc, v) => acc + (v.lines.find(l => l.account === '2110')?.debit ? parseFloat(v.lines.find(l => l.account === '2110')!.debit) : 0), 0);
        const itcReversed = purchaseReturns.reduce((acc, v) => acc + (v.lines.find(l => l.account === '2110')?.credit ? parseFloat(v.lines.find(l => l.account === '2110')!.credit) : 0), 0);
        const netItc = itcAvailable - itcReversed;
        const taxPayable = b2bTaxAmount - netItc;
        
        const dynamicGstr3bSummary = {
            outwardTaxable: b2bTaxableValue,
            outwardTax: b2bTaxAmount,
            itcAvailable,
            itcReversed,
            netItc,
            taxPayable: taxPayable > 0 ? taxPayable : 0,
        };

        return { gstr1Summary: dynamicGstr1Summary, gstr3bSummary: dynamicGstr3bSummary };

    }, [journalVouchers, period]);


    const handleDrillDown = (item: string) => {
        toast({
            title: `Viewing ${item} Transactions`,
            description: `A dialog would open showing all transactions related to ${item}.`,
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">GST Filings</h1>
                    <p className="text-muted-foreground">
                        Prepare and review your GSTR-1 and GSTR-3B reports.
                    </p>
                </div>
                <div className="flex items-center gap-4">
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
                            {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(day) => day && setDate(day)}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                     <Link href="/reconciliation/gstr-comparison" passHref>
                        <Button variant="outline">
                            <GitCompareArrows className="mr-2"/>
                            Compare Reports
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="gstr-1">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl">
                    <TabsTrigger value="gstr-1">GSTR-1 Summary</TabsTrigger>
                    <TabsTrigger value="gstr-3b">GSTR-3B Summary</TabsTrigger>
                    <TabsTrigger value="gstr-9">GSTR-9 Annual</TabsTrigger>
                    <TabsTrigger value="gstr-9c">GSTR-9C Reconciliation</TabsTrigger>
                </TabsList>

                <TabsContent value="gstr-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>GSTR-1 Summary for {format(date, 'MMMM yyyy')}</CardTitle>
                            <CardDescription>Review your outward supplies before filing. Click a row to see details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Supply Type</TableHead>
                                        <TableHead>Invoices</TableHead>
                                        <TableHead className="text-right">Taxable Value (₹)</TableHead>
                                        <TableHead className="text-right">Tax Amount (₹)</TableHead>
                                        <TableHead className="text-right">Total (₹)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gstr1Summary.length > 0 && gstr1Summary[0].invoices > 0 ? gstr1Summary.map((row) => (
                                        <TableRow key={row.type} className="cursor-pointer" onClick={() => handleDrillDown(row.type)}>
                                            <TableCell className="font-medium">{row.type}</TableCell>
                                            <TableCell>{row.invoices}</TableCell>
                                            <TableCell className="text-right">{row.taxableValue.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{row.taxAmount.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-bold">{row.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No outward supplies data for this period.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline"><FileSpreadsheet className="mr-2"/> Export CSV</Button>
                            <Link href="/gst-filings/gstr-1-wizard">
                                <Button>Prepare GSTR-1</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                <TabsContent value="gstr-3b">
                     <Card>
                        <CardHeader>
                            <CardTitle>GSTR-3B Summary for {format(date, 'MMMM yyyy')}</CardTitle>
                            <CardDescription>Review your monthly summary and tax computation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg">1. Outward Supplies & Tax Liability</h3>
                                     <div className="space-y-2 p-4 border rounded-lg">
                                        <div className="flex justify-between cursor-pointer hover:bg-muted/50 p-1 rounded" onClick={() => handleDrillDown('Total Taxable Value')}>
                                            <span className="text-muted-foreground">Total Taxable Value</span>
                                            <span>₹{gstr3bSummary.outwardTaxable.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium cursor-pointer hover:bg-muted/50 p-1 rounded" onClick={() => handleDrillDown('Total Tax on Outward Supplies')}>
                                            <span className="text-muted-foreground">Total Tax</span>
                                            <span>₹{gstr3bSummary.outwardTax.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                 <div className="space-y-4">
                                     <h3 className="font-semibold text-lg">2. Eligible Input Tax Credit (ITC)</h3>
                                     <div className="space-y-2 p-4 border rounded-lg">
                                        <div className="flex justify-between cursor-pointer hover:bg-muted/50 p-1 rounded" onClick={() => handleDrillDown('ITC Available')}>
                                            <span className="text-muted-foreground">ITC Available</span>
                                            <span className="text-green-600">+ ₹{gstr3bSummary.itcAvailable.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between cursor-pointer hover:bg-muted/50 p-1 rounded" onClick={() => handleDrillDown('ITC Reversed')}>
                                            <span className="text-muted-foreground">ITC Reversed</span>
                                            <span className="text-red-600">- ₹{gstr3bSummary.itcReversed.toFixed(2)}</span>
                                        </div>
                                         <div className="flex justify-between font-medium border-t pt-2 mt-2 cursor-pointer hover:bg-muted/50 p-1 rounded" onClick={() => handleDrillDown('Net ITC')}>
                                            <span className="text-muted-foreground">Net ITC</span>
                                            <span>₹{gstr3bSummary.netItc.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center pt-4">
                                <StatCard
                                    title="Net Tax Payable"
                                    value={`₹${gstr3bSummary.taxPayable.toFixed(2)}`}
                                    description="(Total Tax - Net ITC)"
                                    icon={FileText}
                                    className="max-w-sm w-full"
                                    loading={loading}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                             <Button variant="outline"><FileSpreadsheet className="mr-2"/> Export CSV</Button>
                             <Link href="/gst-filings/gstr-3b-wizard">
                                <Button>Prepare GSTR-3B</Button>
                             </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="gstr-9">
                    <Card>
                        <CardHeader>
                            <CardTitle>GSTR-9 Annual Return</CardTitle>
                            <CardDescription>Prepare and file your GST annual return for the selected financial year.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Use the wizard to consolidate your monthly/quarterly data, make adjustments, and prepare your GSTR-9 for filing.</p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/gst-filings/gstr-9-wizard" passHref>
                               <Button>
                                    <span>Prepare GSTR-9</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                               </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                <TabsContent value="gstr-9c">
                    <Card>
                        <CardHeader>
                            <CardTitle>GSTR-9C Reconciliation Statement</CardTitle>
                            <CardDescription>Prepare the reconciliation statement between your audited annual financial statements and the GSTR-9 annual return.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Upload your audited financials and use our tool to reconcile the figures with your GSTR-9 data.</p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/gst-filings/gstr-9c-reconciliation" passHref>
                                <Button>
                                    <span>Prepare GSTR-9C</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
