
"use client";

import { useState } from "react";
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
import { FileDown, FileJson, GitCompareArrows, FileText } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { useToast } from "@/hooks/use-toast";


const gstr1Summary = [
    { type: "B2B", invoices: 5, taxableValue: 75000, taxAmount: 13500, total: 88500 },
    { type: "B2C (Large)", invoices: 2, taxableValue: 300000, taxAmount: 54000, total: 354000 },
    { type: "B2C (Small)", invoices: 25, taxableValue: 125000, taxAmount: 22500, total: 147500 },
    { type: "Credit/Debit Notes (Regd)", invoices: 1, taxableValue: -2500, taxAmount: -450, total: -2950 },
    { type: "Exports", invoices: 1, taxableValue: 50000, taxAmount: 0, total: 50000 },
];

const gstr3bSummary = {
    outwardTaxable: 547500,
    outwardTax: 89550,
    itcAvailable: 65200,
    itcReversed: 1200,
    netItc: 64000,
    taxPayable: 25550,
};


export default function GstFilingsPage() {
    const [period, setPeriod] = useState("2024-05");
    const { toast } = useToast();

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
                     <Select defaultValue={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024-05">May 2024</SelectItem>
                            <SelectItem value="2024-04">April 2024</SelectItem>
                            <SelectItem value="2024-03">March 2024</SelectItem>
                        </SelectContent>
                    </Select>
                     <Link href="/reconciliation/gstr-comparison" passHref>
                        <Button variant="outline">
                            <GitCompareArrows className="mr-2"/>
                            Compare Reports
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="gstr-1">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="gstr-1">GSTR-1 Summary (Outward Supplies)</TabsTrigger>
                    <TabsTrigger value="gstr-3b">GSTR-3B Summary (Tax Computation)</TabsTrigger>
                </TabsList>

                <TabsContent value="gstr-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>GSTR-1 Summary for {period}</CardTitle>
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
                                    {gstr1Summary.map((row) => (
                                        <TableRow key={row.type} className="cursor-pointer" onClick={() => handleDrillDown(row.type)}>
                                            <TableCell className="font-medium">{row.type}</TableCell>
                                            <TableCell>{row.invoices}</TableCell>
                                            <TableCell className="text-right">{row.taxableValue.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{row.taxAmount.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-bold">{row.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline"><FileDown className="mr-2"/> Download GSTR-1 PDF</Button>
                            <Button><FileJson className="mr-2"/> Generate JSON for Filing</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                <TabsContent value="gstr-3b">
                     <Card>
                        <CardHeader>
                            <CardTitle>GSTR-3B Summary for {period}</CardTitle>
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
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                             <Button variant="outline"><FileDown className="mr-2"/> Download GSTR-3B PDF</Button>
                             <Button>Proceed to Payment</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );

    