
"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ArrowLeft, FileSignature, Trash2, PlusCircle, ArrowRight, Printer } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import { Table, TableBody, TableCell, TableFooter as TableFoot, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const assetSchema = z.object({
  description: z.string().min(3, "Description is required."),
  value: z.coerce.number().positive("Value must be a positive number."),
});

const formSchema = z.object({
  studentName: z.string().min(3, "Student's name is required."),
  sponsorNames: z.string().min(3, "Sponsor name(s) are required."),
  sponsorAddress: z.string().min(10, "Sponsor address is required."),
  universityName: z.string().min(3, "University name is required."),
  universityAddress: z.string().min(10, "University address is required."),
  asOnDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  usdRate: z.coerce.number().positive("USD rate is required."),
  immovableProperties: z.array(assetSchema),
  liquidAssets: z.array(assetSchema),
  bankBalances: z.array(assetSchema),
  currentIncome: z.array(assetSchema),
  educationLoan: z.array(assetSchema),
});

type FormData = z.infer<typeof formSchema>;

export default function VisaImmigrationCertificatePage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "Meghana Macha",
      sponsorNames: "Mr Narsimha Reddy Macha and Mrs Saritha Macha",
      sponsorAddress: "H No : 1-2-39, Paripally Street, Siddipet, Telangana, India – 502103",
      universityName: "THE UNIVERSITY OF MEMPHIS",
      universityAddress: "110 PANHELLENIC BUILDING, Center for International Education and Services, MEMPHIS, TN 38152",
      asOnDate: new Date().toISOString().split("T")[0],
      usdRate: 77.80,
      immovableProperties: [],
      liquidAssets: [],
      bankBalances: [],
      currentIncome: [],
      educationLoan: [],
    },
  });

  const { fields: immovableFields, append: appendImmovable, remove: removeImmovable } = useFieldArray({ control: form.control, name: "immovableProperties" });
  const { fields: liquidFields, append: appendLiquid, remove: removeLiquid } = useFieldArray({ control: form.control, name: "liquidAssets" });
  const { fields: bankFields, append: appendBank, remove: removeBank } = useFieldArray({ control: form.control, name: "bankBalances" });
  const { fields: incomeFields, append: appendIncome, remove: removeIncome } = useFieldArray({ control: form.control, name: "currentIncome" });
  const { fields: loanFields, append: appendLoan, remove: removeLoan } = useFieldArray({ control: form.control, name: "educationLoan" });

  const watchAllFields = form.watch();
  const totalImmovable = watchAllFields.immovableProperties.reduce((acc, asset) => acc + (Number(asset.value) || 0), 0);
  const totalLiquid = watchAllFields.liquidAssets.reduce((acc, asset) => acc + (Number(asset.value) || 0), 0);
  const totalBank = watchAllFields.bankBalances.reduce((acc, asset) => acc + (Number(asset.value) || 0), 0);
  const totalIncome = watchAllFields.currentIncome.reduce((acc, asset) => acc + (Number(asset.value) || 0), 0);
  const totalLoan = watchAllFields.educationLoan.reduce((acc, asset) => acc + (Number(asset.value) || 0), 0);
  const grandTotal = totalImmovable + totalLiquid + totalBank + totalIncome + totalLoan;
  
  const toUsd = (inr: number) => watchAllFields.usdRate > 0 ? inr / watchAllFields.usdRate : 0;
  
  const handleGenerateDraft = async () => {
    const isValid = await form.trigger();
    if(isValid) {
        setStep(3); // Move to preview step
        toast({ title: "Draft Ready", description: "Review the generated certificate below." });
    } else {
         toast({ variant: "destructive", title: "Validation Error", description: "Please fill all required fields." });
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Financial_Questionnaire_${form.getValues("studentName")}`,
  });

  const renderStepContent = () => {
    switch(step) {
        case 1:
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Applicant & Sponsor Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="studentName" render={({ field }) => (<FormItem><FormLabel>Student's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="sponsorNames" render={({ field }) => (<FormItem><FormLabel>Sponsor(s) Name (e.g., Parents)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="sponsorAddress" render={({ field }) => (<FormItem><FormLabel>Sponsor(s) Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="universityName" render={({ field }) => (<FormItem><FormLabel>University Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="universityAddress" render={({ field }) => (<FormItem><FormLabel>University Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="asOnDate" render={({ field }) => (<FormItem><FormLabel>Financial Position as on Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="usdRate" render={({ field }) => (<FormItem><FormLabel>USD Conversion Rate (1 USD = ? INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end"><Button type="button" onClick={() => form.trigger().then(isValid => isValid && setStep(2))}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
                </Card>
            )
        case 2:
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Financial Details</CardTitle>
                        <CardDescription>Enter details for each financial category.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderAssetSection("Immovable Properties", immovableFields, appendImmovable, removeImmovable, 'immovableProperties')}
                        {renderAssetSection("Investment Properties & Liquid Assets", liquidFields, appendLiquid, removeLiquid, 'liquidAssets')}
                        {renderAssetSection("Bank Balances", bankFields, appendBank, removeBank, 'bankBalances')}
                        {renderAssetSection("Current Income", incomeFields, appendIncome, removeIncome, 'currentIncome')}
                        {renderAssetSection("Educational Loan", loanFields, appendLoan, removeLoan, 'educationLoan')}
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2"/> Back</Button>
                        <Button type="button" onClick={handleGenerateDraft}>
                            <FileSignature className="mr-2"/> Generate Certificate
                        </Button>
                    </CardFooter>
                 </Card>
            )
        case 3:
            const formData = form.getValues();
            const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const asOnDate = new Date(formData.asOnDate).toLocaleDateString('en-GB', dateOptions);

            const summaryData = [
                { source: "IMMOVABLE PROPERTIES", value: totalImmovable },
                { source: "INVESTMENT PROPERTIES & LIQUID ASSESTS", value: totalLiquid },
                { source: "BANK BALANCES", value: totalBank },
                { source: "CURRENT INCOME", value: totalIncome },
                { source: "EDUCATIONAL LOAN", value: totalLoan },
            ];

            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Final Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div ref={printRef} className="prose dark:prose-invert max-w-none border rounded-lg p-8 space-y-8">
                           <header className="text-center">
                                <h1 className="text-lg font-bold m-0">CERTIFICATE</h1>
                                <p className="text-sm font-semibold m-0">FINANCIAL DATA QUESTIONNAIRE FOR STUDENT VISA APPLICATION</p>
                                <p className="text-sm font-semibold m-0">AMERICAN CONSULATE GENERAL</p>
                           </header>

                            <p className="text-sm">I, S. Kranthi Kumar Member of The Institute of Chartered Accountants of India, with ICAI Membership No 224983, FRN 017148S, have reviewed the financial condition of <strong>{formData.sponsorNames}</strong> parents of <strong>Ms {formData.studentName}</strong>, R/o {formData.sponsorAddress}, with the view of establishing their ability to meet the cost of their daughter {formData.studentName}'s EDUCATION and STAY at <strong>{formData.universityName}</strong>, {formData.universityAddress}.</p>
                            <p className="text-sm">The Financial position of {formData.sponsorNames} as on {asOnDate} is as follows:</p>
                            
                            <Table className="text-sm">
                                <TableHeader><TableRow><TableHead>S No</TableHead><TableHead>Source of Funds</TableHead><TableHead className="text-right">Indian Rs</TableHead><TableHead className="text-right">In USD</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {summaryData.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i+1}</TableCell>
                                            <TableCell>{item.source}</TableCell>
                                            <TableCell className="text-right font-mono">{item.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                                            <TableCell className="text-right font-mono">{toUsd(item.value).toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFoot>
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell colSpan={2}>TOTAL</TableCell>
                                        <TableCell className="text-right font-mono">{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                                        <TableCell className="text-right font-mono">{toUsd(grandTotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                                    </TableRow>
                                </TableFoot>
                            </Table>
                            <p className="text-center text-xs">(CONVERSION 1 USD = INR {formData.usdRate.toFixed(2)} as on {asOnDate})</p>
                            
                            {renderDetailTable("IMMOVABLE PROPERTIES", formData.immovableProperties, toUsd, totalImmovable)}
                            {renderDetailTable("INVESTMENT PROPERTIES & LIQUID ASSESTS", formData.liquidAssets, toUsd, totalLiquid)}
                            {renderDetailTable("BANK BALANCES", formData.bankBalances, toUsd, totalBank)}
                            {renderDetailTable("CURRENT INCOME", formData.currentIncome, toUsd, totalIncome)}
                            {renderDetailTable("EDUCATIONAL LOAN", formData.educationLoan, toUsd, totalLoan)}

                            <div className="flex justify-between items-end pt-16 !no-prose">
                                <div className="text-left text-sm">
                                    <p>Thanking You</p>
                                    <p>Sincerely</p>
                                </div>
                                <div className="text-left text-sm">
                                    <p className="font-bold">S Kranthi Kumar & Co</p>
                                    <p>Chartered Accountants</p>
                                    <br/><br/><br/>
                                    <p className="font-bold">S Kranthi Kumar</p>
                                    <p>Proprietor</p>
                                    <p>ICAI Mem 224983</p>
                                    <p>FRN 017486S</p>
                                    <p>UDIN [UDIN GOES HERE]</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                         <Button type="button" variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2"/> Back</Button>
                         <button onClick={handlePrint} className={cn(buttonVariants())}><Printer className="mr-2"/> Print / Save PDF</button>
                    </CardFooter>
                </Card>
            )
        default: return null;
    }
  }

  const renderAssetSection = (title: string, fields: any[], append: (val: any) => void, remove: (idx: number) => void, fieldName: keyof FormData) => (
    <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end p-2 border rounded-md">
                    <FormField control={form.control} name={`${fieldName}.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Textarea className="h-10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`${fieldName}.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="size-4 text-destructive"/></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", value: 0 })}><PlusCircle className="mr-2"/> Add Row</Button>
        </div>
    </div>
  );

  const renderDetailTable = (title: string, data: { description: string, value: number }[], toUsd: (val: number) => number, total: number) => {
    if (data.length === 0) return null;
    return (
        <div className="break-inside-avoid">
            <h4 className="font-bold text-center underline">{title}</h4>
            <Table className="text-sm">
                <TableHeader><TableRow><TableHead>S.No</TableHead><TableHead className="w-2/3">DESCRIPTION</TableHead><TableHead className="text-right">Indian RS</TableHead><TableHead className="text-right">Equivalent USD</TableHead></TableRow></TableHeader>
                <TableBody>
                    {data.map((item, i) => (
                        <TableRow key={i}>
                            <TableCell>{i+1}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right font-mono">{item.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                            <TableCell className="text-right font-mono">{toUsd(item.value).toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFoot>
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>TOTAL</TableCell>
                        <TableCell className="text-right font-mono">{total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                        <TableCell className="text-right font-mono">{toUsd(total).toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                    </TableRow>
                </TableFoot>
            </Table>
        </div>
    );
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/ca-certificates" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Certificate Menu
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Visa / Immigration Certificate</h1>
        <p className="text-muted-foreground">Generate a detailed financial statement for student visa applications.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
            {renderStepContent()}
        </form>
      </Form>
    </div>
  );
}
