
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, Upload, GitCompareArrows, Loader2, ArrowLeft, FileDown, FileSpreadsheet, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


// Reconciliation of Gross Turnover (Table 5)
const initialTurnoverRecon = [
    { id: "A", description: "Turnover (incl. exports) as per audited financial statements", value: 51000000 },
    { id: "B", description: "Unbilled revenue at the beginning of the Financial Year", value: 0 },
    { id: "C", description: "Unadjusted advances at the end of the Financial Year", value: 200000 },
    { id: "D", description: "Deemed Supply under Schedule I", value: 0 },
    { id: "E", description: "Credit Notes issued after the end of the FY but reflected in GSTR-9", value: -150000 },
    { id: "F", description: "Trade Discounts accounted for in the audited accounts but are not permissible under GST", value: 0 },
    { id: "I", description: "Unbilled revenue at the end of the Financial Year", value: -300000 },
    { id: "J", description: "Unadjusted advances at the beginning of the Financial Year", value: -100000 },
    { id: "L", description: "Adjustments on account of supply of goods by SEZ units to DTA Units", value: 0 },
    { id: "N", description: "Turnover for the period under composition scheme", value: 0 },
];

// Reconciliation of Taxable Turnover (Table 7)
const initialTaxableTurnoverRecon = [
    { id: "A", description: "Annual turnover after adjustments (from Table 5Q)", value: 50650000 },
    { id: "B", description: "Value of Exempted, Nil Rated, Non-GST supplies, No-Supply turnover", value: -500000 },
    { id: "C", description: "Zero-rated supplies without payment of tax", value: -200000 },
    { id: "D", description: "Supplies on which tax is to be paid by the recipient on reverse charge basis", value: -150000 },
];

// Reconciliation of Tax Paid (Table 9)
const initialTaxPaidRecon = [
    { rate: "5%", taxableValue: 10000000, cgst: 250000, sgst: 250000, igst: 0, cess: 0 },
    { rate: "12%", taxableValue: 15000000, cgst: 900000, sgst: 900000, igst: 0, cess: 0 },
    { rate: "18%", taxableValue: 25000000, cgst: 0, sgst: 0, igst: 4500000, cess: 0 },
];

// Reconciliation of ITC (Table 12)
const initialItcRecon = [
    { id: "A", description: "ITC availed as per audited Financial Statements", value: 3500000 },
    { id: "B", description: "ITC booked in earlier FYs claimed in current FY", value: 50000 },
    { id: "C", description: "ITC booked in current FY to be claimed in subsequent FYs", value: -100000 },
    { id: "D", description: "ITC availed as per audited financial statements or books of account", value: 3450000, isTotal: true },
    { id: "E", description: "ITC claimed in Annual Return (GSTR-9)", value: 3400000 },
];


export default function Gstr9cPage() {
  const { toast } = useToast();

  const [turnoverReconData, setTurnoverReconData] = useState(initialTurnoverRecon);
  const [taxableTurnoverReconData, setTaxableTurnoverReconData] = useState(initialTaxableTurnoverRecon);
  const [taxPaidData, setTaxPaidData] = useState(initialTaxPaidRecon);
  const [itcReconData, setItcReconData] = useState(initialItcRecon);

  const totalTurnover = turnoverReconData.reduce((acc, item) => acc + item.value, 0);
  const totalTaxableTurnover = taxableTurnoverReconData.reduce((acc, item) => acc + item.value, 0);
  const itcDifference = (itcReconData.find(i=>i.id === 'D')?.value || 0) - (itcReconData.find(i=>i.id === 'E')?.value || 0);
  
  const handleGenerateJson = () => {
    const reportData = {
        financialYear: "2023-24",
        reconciliationOfTurnover: turnoverReconData,
        reconciliationOfTaxableTurnover: taxableTurnoverReconData,
        reconciliationOfTaxPaid: taxPaidData,
        reconciliationOfITC: itcReconData,
    };
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GSTR9C_2023-24_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: `JSON Generation Complete`,
      description: `Your GSTR-9C JSON file has been downloaded.`,
    });
  }

  return (
    <div className="space-y-8">
        <Link href="/gst-filings" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to GST Filings
        </Link>
        <div className="text-center">
            <h1 className="text-3xl font-bold">GSTR-9C Preparation Utility</h1>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                Prepare the reconciliation statement between your audited annual financial statements and your GSTR-9 annual return.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>GSTR-9C Data Entry</CardTitle>
                <CardDescription>
                    Enter the values from your Audited Financials and GSTR-9.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['turnover-recon']} className="w-full">
                    {/* Turnover Reconciliation */}
                    <AccordionItem value="turnover-recon">
                        <AccordionTrigger>Part II: Reconciliation of Turnover</AccordionTrigger>
                        <AccordionContent>
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Sl. No.</TableHead>
                                       <TableHead className="w-2/3">Description</TableHead>
                                       <TableHead className="text-right">Amount (₹)</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {turnoverReconData.map(item => (
                                       <TableRow key={item.id}>
                                           <TableCell>{item.id}</TableCell>
                                           <TableCell>{item.description}</TableCell>
                                           <TableCell><Input type="number" className="text-right" defaultValue={item.value} /></TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                               <TableFooter>
                                    <TableRow className="font-bold bg-muted/50">
                                       <TableCell>Q</TableCell>
                                       <TableCell>Turnover as per annual return (GSTR9)</TableCell>
                                       <TableCell className="text-right font-mono">{totalTurnover.toLocaleString()}</TableCell>
                                   </TableRow>
                               </TableFooter>
                           </Table>
                        </AccordionContent>
                    </AccordionItem>
                    
                     {/* Taxable Turnover Reconciliation */}
                    <AccordionItem value="taxable-turnover-recon">
                        <AccordionTrigger>Part III: Reconciliation of Taxable Turnover</AccordionTrigger>
                        <AccordionContent>
                             <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Sl. No.</TableHead>
                                       <TableHead className="w-2/3">Description</TableHead>
                                       <TableHead className="text-right">Amount (₹)</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {taxableTurnoverReconData.map(item => (
                                       <TableRow key={item.id}>
                                           <TableCell>{item.id}</TableCell>
                                           <TableCell>{item.description}</TableCell>
                                           <TableCell><Input type="number" className="text-right" defaultValue={item.value} /></TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                               <TableFooter>
                                    <TableRow className="font-bold bg-muted/50">
                                       <TableCell>E</TableCell>
                                       <TableCell>Taxable Turnover as per liability declared in Annual Return (GSTR9)</TableCell>
                                       <TableCell className="text-right font-mono">{totalTaxableTurnover.toLocaleString()}</TableCell>
                                   </TableRow>
                               </TableFooter>
                           </Table>
                        </AccordionContent>
                    </AccordionItem>
                    
                    {/* Tax Paid Reconciliation */}
                    <AccordionItem value="tax-paid-recon">
                        <AccordionTrigger>Part IV: Reconciliation of Tax Paid</AccordionTrigger>
                        <AccordionContent>
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Rate</TableHead><TableHead className="text-right">Taxable Value (₹)</TableHead><TableHead className="text-right">CGST (₹)</TableHead><TableHead className="text-right">SGST (₹)</TableHead><TableHead className="text-right">IGST (₹)</TableHead><TableHead className="text-right">Cess (₹)</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {taxPaidData.map(item => (
                                        <TableRow key={item.rate}><TableCell>{item.rate}</TableCell><TableCell><Input className="text-right" defaultValue={item.taxableValue}/></TableCell><TableCell><Input className="text-right" defaultValue={item.cgst}/></TableCell><TableCell><Input className="text-right" defaultValue={item.sgst}/></TableCell><TableCell><Input className="text-right" defaultValue={item.igst}/></TableCell><TableCell><Input className="text-right" defaultValue={item.cess}/></TableCell></TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                     <TableRow className="font-bold bg-muted/50">
                                         <TableCell>Total</TableCell>
                                         <TableCell className="text-right font-mono">{(taxPaidData.reduce((a, b) => a + b.taxableValue, 0)).toLocaleString()}</TableCell>
                                         <TableCell className="text-right font-mono">{(taxPaidData.reduce((a, b) => a + b.cgst, 0)).toLocaleString()}</TableCell>
                                         <TableCell className="text-right font-mono">{(taxPaidData.reduce((a, b) => a + b.sgst, 0)).toLocaleString()}</TableCell>
                                         <TableCell className="text-right font-mono">{(taxPaidData.reduce((a, b) => a + b.igst, 0)).toLocaleString()}</TableCell>
                                         <TableCell className="text-right font-mono">{(taxPaidData.reduce((a, b) => a + b.cess, 0)).toLocaleString()}</TableCell>
                                     </TableRow>
                                </TableFooter>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>

                     {/* ITC Reconciliation */}
                    <AccordionItem value="itc-recon">
                        <AccordionTrigger>Part V: Reconciliation of Input Tax Credit (ITC)</AccordionTrigger>
                        <AccordionContent>
                             <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Sl. No.</TableHead>
                                       <TableHead className="w-2/3">Description</TableHead>
                                       <TableHead className="text-right">Amount (₹)</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {itcReconData.map(item => (
                                       <TableRow key={item.id} className={item.isTotal ? 'font-bold bg-muted/50' : ''}>
                                           <TableCell>{item.id}</TableCell>
                                           <TableCell>{item.description}</TableCell>
                                           <TableCell>
                                                {item.isTotal ? <div className="text-right font-mono">{item.value.toLocaleString()}</div> : <Input type="number" className="text-right" defaultValue={item.value} />}
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                               <TableFooter>
                                    <TableRow className="font-bold bg-destructive/10 text-destructive">
                                       <TableCell>F</TableCell>
                                       <TableCell>Un-reconciled ITC (D-E)</TableCell>
                                       <TableCell className="text-right font-mono">{itcDifference.toLocaleString()}</TableCell>
                                   </TableRow>
                               </TableFooter>
                           </Table>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </CardContent>
             <CardFooter className="flex justify-end gap-2">
                <Button variant="outline"><FileSpreadsheet className="mr-2"/> Export to Excel</Button>
                <Button onClick={handleGenerateJson}><FileJson className="mr-2"/> Download GSTR-9C JSON</Button>
             </CardFooter>
        </Card>
    </div>
  );
}
