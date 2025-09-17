
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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const initialB2BInvoices = [
  {
    gstin: "27AACCG1234F1Z5",
    invoiceNumber: "INV-001",
    invoiceDate: "2024-05-15",
    invoiceValue: 25000.00,
    taxableValue: 21186.44,
    taxRate: 18,
    igst: 3813.56,
    cgst: 0,
    sgst: 0,
    cess: 0,
  },
  {
    gstin: "29AABCI5678G1Z4",
    invoiceNumber: "INV-002",
    invoiceDate: "2024-05-20",
    invoiceValue: 15000.00,
    taxableValue: 12711.86,
    taxRate: 18,
    igst: 2288.14,
    cgst: 0,
    sgst: 0,
    cess: 0,
  },
   {
    gstin: "24AAACS4321H1Z2",
    invoiceNumber: "INV-004",
    invoiceDate: "2024-05-25",
    invoiceValue: 45000.00,
    taxableValue: 38135.59,
    taxRate: 18,
    igst: 6864.41,
    cgst: 0,
    sgst: 0,
    cess: 0,
  },
];

export default function Gstr1WizardPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [b2bInvoices, setB2bInvoices] = useState(initialB2BInvoices);

  const handleInvoiceChange = (index: number, field: keyof typeof b2bInvoices[0], value: string | number) => {
    const newInvoices = [...b2bInvoices];
    (newInvoices[index] as any)[field] = value;
    setB2bInvoices(newInvoices);
  };
  
  const handleAddInvoice = () => {
    setB2bInvoices([
        ...b2bInvoices,
        {
            gstin: "",
            invoiceNumber: "",
            invoiceDate: "",
            invoiceValue: 0,
            taxableValue: 0,
            taxRate: 18,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess: 0,
        }
    ]);
  }
  
  const handleRemoveInvoice = (index: number) => {
    const newInvoices = [...b2bInvoices];
    newInvoices.splice(index, 1);
    setB2bInvoices(newInvoices);
  }

  const handleNext = () => {
    toast({
      title: `Step ${step} Saved!`,
      description: `Moving to the next step.`,
    });
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: B2B Invoices</CardTitle>
              <CardDescription>
                Table 4A, 4B, 4C, 6B, 6C: Review supplies made to registered persons (B2B).
                <br />
                The data is auto-populated from your sales. Review and make any necessary adjustments.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient GSTIN</TableHead>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Taxable Value</TableHead>
                    <TableHead className="text-right">Rate (%)</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                    <TableHead className="text-right">Cess</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {b2bInvoices.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell><Input value={invoice.gstin} onChange={(e) => handleInvoiceChange(index, 'gstin', e.target.value)} /></TableCell>
                      <TableCell><Input value={invoice.invoiceNumber} onChange={(e) => handleInvoiceChange(index, 'invoiceNumber', e.target.value)} /></TableCell>
                      <TableCell><Input type="date" value={invoice.invoiceDate} onChange={(e) => handleInvoiceChange(index, 'invoiceDate', e.target.value)} /></TableCell>
                      <TableCell><Input type="number" className="text-right" value={invoice.invoiceValue} onChange={(e) => handleInvoiceChange(index, 'invoiceValue', parseFloat(e.target.value))} /></TableCell>
                      <TableCell><Input type="number" className="text-right" value={invoice.taxableValue} onChange={(e) => handleInvoiceChange(index, 'taxableValue', parseFloat(e.target.value))} /></TableCell>
                      <TableCell><Input type="number" className="text-right" value={invoice.taxRate} onChange={(e) => handleInvoiceChange(index, 'taxRate', parseFloat(e.target.value))} /></TableCell>
                      <TableCell><Input type="number" className="text-right" value={invoice.igst} onChange={(e) => handleInvoiceChange(index, 'igst', parseFloat(e.target.value))} /></TableCell>
                      <TableCell><Input type="number" className="text-right" value={invoice.cgst} onChange={(e) => handleInvoiceChange(index, 'cgst', parseFloat(e.target.value))} /></TableCell>
                      <TableCell><Input type="number" className="text-right" value={invoice.sgst} onChange={(e) => handleInvoiceChange(index, 'sgst', parseFloat(e.target.value))} /></TableCell>
                      <TableCell><Input type="number" className="text-right" value={invoice.cess} onChange={(e) => handleInvoiceChange(index, 'cess', parseFloat(e.target.value))} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveInvoice(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleAddInvoice}>
                <PlusCircle className="mr-2 h-4 w-4"/> Add Invoice
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleNext}>
                    Save & Continue
                    <ArrowRight className="ml-2" />
                </Button>
            </CardFooter>
          </Card>
        );
      default:
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Wizard Complete</CardTitle>
                    <CardDescription>You've finished the GSTR-1 preparation wizard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>More steps will be added here for B2C, Credit Notes, etc.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2" /> Back
                    </Button>
                </CardFooter>
            </Card>
        );
    }
  }

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <Link href="/gst-filings" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2" />
            Back to GST Filings
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">GSTR-1 Filing Wizard</h1>
          <p className="text-muted-foreground">Period: May 2024</p>
        </div>
      </div>

      {renderStep()}
    </div>
  );
}

    