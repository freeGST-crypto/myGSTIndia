
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const states = [
    "01-Jammu & Kashmir", "02-Himachal Pradesh", "03-Punjab", "04-Chandigarh", "05-Uttarakhand", "06-Haryana", "07-Delhi",
    "08-Rajasthan", "09-Uttar Pradesh", "10-Bihar", "11-Sikkim", "12-Arunachal Pradesh", "13-Nagaland", "14-Manipur",
    "15-Mizoram", "16-Tripura", "17-Meghalaya", "18-Assam", "19-West Bengal", "20-Jharkhand", "21-Odisha",
    "22-Chhattisgarh", "23-Madhya Pradesh", "24-Gujarat", "25-Daman & Diu", "26-Dadra & Nagar Haveli",
    "27-Maharashtra", "29-Karnataka", "30-Goa", "31-Lakshadweep", "32-Kerala", "33-Tamil Nadu", "34-Puducherry",
    "35-Andaman & Nicobar Islands", "36-Telangana", "37-Andhra Pradesh", "97-Other Territory"
];

const exportTypes = ["WPAY", "WOPAY"];


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

const initialB2CLargeInvoices = [
    {
        pos: "07-Delhi",
        invoiceNumber: "INV-B2CL-001",
        invoiceDate: "2024-05-18",
        invoiceValue: 300000.00,
        taxableValue: 254237.29,
        taxRate: 18,
        igst: 45762.71,
        cess: 0
    }
];

const initialExportInvoices = [
    {
        exportType: "WPAY",
        invoiceNumber: "EXP-001",
        invoiceDate: "2024-05-22",
        invoiceValue: 50000.00,
        portCode: "INBOM1",
        shippingBillNumber: "SB-12345",
        shippingBillDate: "2024-05-23",
        taxableValue: 50000.00,
        taxRate: 18,
        igst: 9000,
        cess: 0,
    }
];

const initialB2COthers = [
    {
        pos: "27-Maharashtra",
        taxableValue: 125000.00,
        taxRate: 18,
        igst: 0,
        cgst: 11250,
        sgst: 11250,
        cess: 0
    },
    {
        pos: "29-Karnataka",
        taxableValue: 80000.00,
        taxRate: 12,
        igst: 9600.00,
        cgst: 0,
        sgst: 0,
        cess: 0
    }
];

const initialNilRated = [
    { description: "Inter-State supplies to Registered persons", nilRated: 5000, exempted: 0, nonGst: 0 },
    { description: "Intra-State supplies to Registered persons", nilRated: 12000, exempted: 2000, nonGst: 0 },
    { description: "Inter-State supplies to Unregistered persons", nilRated: 0, exempted: 3000, nonGst: 0 },
    { description: "Intra-State supplies to Unregistered persons", nilRated: 8000, exempted: 1500, nonGst: 500 },
];

export default function Gstr1WizardPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [b2bInvoices, setB2bInvoices] = useState(initialB2BInvoices);
  const [b2cLargeInvoices, setB2cLargeInvoices] = useState(initialB2CLargeInvoices);
  const [exportInvoices, setExportInvoices] = useState(initialExportInvoices);
  const [b2cOther, setB2cOther] = useState(initialB2COthers);
  const [nilRated, setNilRated] = useState(initialNilRated);


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
  
  const handleB2cLargeChange = (index: number, field: keyof typeof b2cLargeInvoices[0], value: string | number) => {
    const newInvoices = [...b2cLargeInvoices];
    (newInvoices[index] as any)[field] = value;
    setB2cLargeInvoices(newInvoices);
  };
  const handleAddB2cLarge = () => {
    setB2cLargeInvoices([...b2cLargeInvoices, { pos: "", invoiceNumber: "", invoiceDate: "", invoiceValue: 0, taxableValue: 0, taxRate: 18, igst: 0, cess: 0 }]);
  }
  const handleRemoveB2cLarge = (index: number) => {
    const newInvoices = [...b2cLargeInvoices];
    newInvoices.splice(index, 1);
    setB2cLargeInvoices(newInvoices);
  }

  const handleExportChange = (index: number, field: keyof typeof exportInvoices[0], value: string | number) => {
    const newInvoices = [...exportInvoices];
    (newInvoices[index] as any)[field] = value;
    setExportInvoices(newInvoices);
  };
  const handleAddExport = () => {
    setExportInvoices([...exportInvoices, { exportType: "WPAY", invoiceNumber: "", invoiceDate: "", invoiceValue: 0, portCode: "", shippingBillNumber: "", shippingBillDate: "", taxableValue: 0, taxRate: 18, igst: 0, cess: 0 }]);
  }
  const handleRemoveExport = (index: number) => {
    const newInvoices = [...exportInvoices];
    newInvoices.splice(index, 1);
    setExportInvoices(newInvoices);
  }

  const handleB2cOtherChange = (index: number, field: keyof typeof b2cOther[0], value: string | number) => {
    const newRows = [...b2cOther];
    (newRows[index] as any)[field] = value;
    setB2cOther(newRows);
  };
  const handleAddB2cOther = () => {
    setB2cOther([...b2cOther, { pos: "", taxableValue: 0, taxRate: 18, igst: 0, cgst: 0, sgst: 0, cess: 0 }]);
  }
  const handleRemoveB2cOther = (index: number) => {
    const newRows = [...b2cOther];
    newRows.splice(index, 1);
    setB2cOther(newRows);
  }

  const handleNilRatedChange = (index: number, field: keyof typeof nilRated[0], value: string | number) => {
    const newRows = [...nilRated];
    (newRows[index] as any)[field] = value;
    setNilRated(newRows);
  };


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
              <CardTitle>Step 1: B2B Invoices (Table 4)</CardTitle>
              <CardDescription>
                Review supplies made to registered persons (B2B).
                Data is auto-populated from your sales. Review and adjust.
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
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: B2C (Large) Invoices (Table 5)</CardTitle>
              <CardDescription>
                Inter-state supplies to unregistered persons where invoice value is more than ₹2.5 lakh.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Place Of Supply</TableHead>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Taxable Value</TableHead>
                    <TableHead className="text-right">Rate (%)</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">Cess</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {b2cLargeInvoices.map((invoice, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <Select value={invoice.pos} onValueChange={(value) => handleB2cLargeChange(index, 'pos', value)}>
                                <SelectTrigger><SelectValue placeholder="Select State"/></SelectTrigger>
                                <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell><Input value={invoice.invoiceNumber} onChange={(e) => handleB2cLargeChange(index, 'invoiceNumber', e.target.value)} /></TableCell>
                        <TableCell><Input type="date" value={invoice.invoiceDate} onChange={(e) => handleB2cLargeChange(index, 'invoiceDate', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.invoiceValue} onChange={(e) => handleB2cLargeChange(index, 'invoiceValue', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.taxableValue} onChange={(e) => handleB2cLargeChange(index, 'taxableValue', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.taxRate} onChange={(e) => handleB2cLargeChange(index, 'taxRate', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.igst} onChange={(e) => handleB2cLargeChange(index, 'igst', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.cess} onChange={(e) => handleB2cLargeChange(index, 'cess', parseFloat(e.target.value))} /></TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveB2cLarge(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               <Button variant="outline" size="sm" className="mt-4" onClick={handleAddB2cLarge}>
                <PlusCircle className="mr-2 h-4 w-4"/> Add Invoice
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button onClick={handleNext}>
                  Save & Continue
                  <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Export Invoices (Table 6)</CardTitle>
              <CardDescription>
                Details of zero-rated supplies (exports) and deemed exports.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export Type</TableHead>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Port Code</TableHead>
                    <TableHead>Shipping Bill No.</TableHead>
                    <TableHead>Shipping Bill Date</TableHead>
                    <TableHead className="text-right">Taxable Value</TableHead>
                    <TableHead className="text-right">Rate (%)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportInvoices.map((invoice, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <Select value={invoice.exportType} onValueChange={(value) => handleExportChange(index, 'exportType', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>{exportTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell><Input value={invoice.invoiceNumber} onChange={(e) => handleExportChange(index, 'invoiceNumber', e.target.value)} /></TableCell>
                        <TableCell><Input type="date" value={invoice.invoiceDate} onChange={(e) => handleExportChange(index, 'invoiceDate', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.invoiceValue} onChange={(e) => handleExportChange(index, 'invoiceValue', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input value={invoice.portCode} onChange={(e) => handleExportChange(index, 'portCode', e.target.value)} /></TableCell>
                        <TableCell><Input value={invoice.shippingBillNumber} onChange={(e) => handleExportChange(index, 'shippingBillNumber', e.target.value)} /></TableCell>
                        <TableCell><Input type="date" value={invoice.shippingBillDate} onChange={(e) => handleExportChange(index, 'shippingBillDate', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.taxableValue} onChange={(e) => handleExportChange(index, 'taxableValue', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={invoice.taxRate} onChange={(e) => handleExportChange(index, 'taxRate', parseFloat(e.target.value))} /></TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveExport(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               <Button variant="outline" size="sm" className="mt-4" onClick={handleAddExport}>
                <PlusCircle className="mr-2 h-4 w-4"/> Add Export Invoice
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button onClick={handleNext}>
                  Save & Continue
                  <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
    case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: B2C (Others) (Table 7)</CardTitle>
              <CardDescription>
                Consolidated details of B2C supplies (intra-state and inter-state up to ₹2.5 lakh).
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Place Of Supply</TableHead>
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
                  {b2cOther.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <Select value={row.pos} onValueChange={(value) => handleB2cOtherChange(index, 'pos', value)}>
                                <SelectTrigger><SelectValue placeholder="Select State"/></SelectTrigger>
                                <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell><Input type="number" className="text-right" value={row.taxableValue} onChange={(e) => handleB2cOtherChange(index, 'taxableValue', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={row.taxRate} onChange={(e) => handleB2cOtherChange(index, 'taxRate', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={row.igst} onChange={(e) => handleB2cOtherChange(index, 'igst', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={row.cgst} onChange={(e) => handleB2cOtherChange(index, 'cgst', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={row.sgst} onChange={(e) => handleB2cOtherChange(index, 'sgst', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" className="text-right" value={row.cess} onChange={(e) => handleB2cOtherChange(index, 'cess', parseFloat(e.target.value))} /></TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveB2cOther(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               <Button variant="outline" size="sm" className="mt-4" onClick={handleAddB2cOther}>
                <PlusCircle className="mr-2 h-4 w-4"/> Add Summary Row
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button onClick={handleNext}>
                  Save & Continue
                  <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
    case 5:
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Step 5: Nil Rated, Exempted, and Non-GST Supplies (Table 8)</CardTitle>
                    <CardDescription>
                        Consolidated details of supplies that are nil rated, exempted, or not covered under GST.
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/2">Description</TableHead>
                                <TableHead className="text-right">Nil Rated Supplies</TableHead>
                                <TableHead className="text-right">Exempted Supplies</TableHead>
                                <TableHead className="text-right">Non-GST Supplies</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {nilRated.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.description}</TableCell>
                                    <TableCell>
                                        <Input type="number" className="text-right" value={row.nilRated} onChange={(e) => handleNilRatedChange(index, 'nilRated', parseFloat(e.target.value))} />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" className="text-right" value={row.exempted} onChange={(e) => handleNilRatedChange(index, 'exempted', parseFloat(e.target.value))} />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" className="text-right" value={row.nonGst} onChange={(e) => handleNilRatedChange(index, 'nonGst', parseFloat(e.target.value))} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2" /> Back
                    </Button>
                    <Button onClick={handleNext}>
                        Save & Continue
                        <ArrowRight className="ml-2" />
                    </Button>
                </CardFooter>
            </Card>
        );
    case 6:
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Step 6: Amendments to Outward Supplies (Table 9)</CardTitle>
                    <CardDescription>
                        Report amendments to details of taxable outward supplies furnished in returns for earlier tax periods.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert variant="default">
                        <AlertTitle>Under Development</AlertTitle>
                        <AlertDescription>
                           This section for amendments (Table 9A, 9B, 9C) is complex and will be built out in a future step. It will allow you to modify B2B invoices, B2C Large invoices, export invoices, and credit/debit notes from previous periods.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2" /> Back
                    </Button>
                    <Button onClick={handleNext}>
                        Save & Continue
                        <ArrowRight className="ml-2" />
                    </Button>
                </CardFooter>
            </Card>
        );
      case 7:
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Step 7: Amendments to B2C (Others) (Table 10)</CardTitle>
                    <CardDescription>
                        Report amendments to taxable outward supplies to unregistered persons from earlier tax periods.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert variant="default">
                        <AlertTitle>Under Development</AlertTitle>
                        <AlertDescription>
                           This section is for making corrections to the B2C (Others) summary data reported in previous GSTR-1 filings. The functionality to select a previous period and amend the POS-wise summary will be implemented here.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2" /> Back
                    </Button>
                    <Button onClick={handleNext}>
                        Save & Continue
                        <ArrowRight className="ml-2" />
                    </Button>
                </CardFooter>
            </Card>
        );
      case 8:
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Step 8: Advances Received/Adjusted (Table 11)</CardTitle>
                    <CardDescription>
                        Consolidated statement of advances received, advances adjusted, and amendments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert variant="default">
                        <AlertTitle>Under Development</AlertTitle>
                        <AlertDescription>
                           This section will contain two parts: Part I for reporting gross advances received on which tax is payable, and Part II for reporting adjustments of advances against supplies made in the current period. Functionality to add and amend these details will be built here.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2" /> Back
                    </Button>
                    <Button onClick={handleNext}>
                        Save & Continue
                        <ArrowRight className="ml-2" />
                    </Button>
                </CardFooter>
            </Card>
        );
      case 9:
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Step 9: HSN-wise Summary of Outward Supplies (Table 12)</CardTitle>
                    <CardDescription>
                        A summary of supplies reported in this return, categorized by HSN/SAC code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="default">
                        <AlertTitle>Auto-Generated Summary</AlertTitle>
                        <AlertDescription>
                            This table would be automatically populated based on the items you've sold in your invoices. Below is a representation of how it would look.
                        </AlertDescription>
                    </Alert>
                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead>HSN</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>UQC</TableHead>
                                <TableHead className="text-right">Total Quantity</TableHead>
                                <TableHead className="text-right">Total Value</TableHead>
                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">IGST</TableHead>
                                <TableHead className="text-right">CGST</TableHead>
                                <TableHead className="text-right">SGST</TableHead>
                                <TableHead className="text-right">Cess</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             <TableRow>
                                <TableCell>9401</TableCell>
                                <TableCell>Office Chairs</TableCell>
                                <TableCell>NOS</TableCell>
                                <TableCell className="text-right">10</TableCell>
                                <TableCell className="text-right">75000.00</TableCell>
                                <TableCell className="text-right">75000.00</TableCell>
                                <TableCell className="text-right">13500.00</TableCell>
                                <TableCell className="text-right">0.00</TableCell>
                                <TableCell className="text-right">0.00</TableCell>
                                <TableCell className="text-right">0.00</TableCell>
                             </TableRow>
                             <TableRow>
                                <TableCell>9982</TableCell>
                                <TableCell>Accounting Services</TableCell>
                                <TableCell>OTH</TableCell>
                                <TableCell className="text-right">1</TableCell>
                                <TableCell className="text-right">15000.00</TableCell>
                                <TableCell className="text-right">15000.00</TableCell>
                                <TableCell className="text-right">0.00</TableCell>
                                <TableCell className="text-right">1350.00</TableCell>
                                <TableCell className="text-right">1350.00</TableCell>
                                <TableCell className="text-right">0.00</TableCell>
                             </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2" /> Back
                    </Button>
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
                    <p>More steps will be added here for other tables (e.g. Table 13 - Documents Issued).</p>
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

    