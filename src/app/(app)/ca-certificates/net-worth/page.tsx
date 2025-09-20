
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

const liabilitySchema = z.object({
  description: z.string().min(3, "Description is required."),
  value: z.coerce.number().positive("Value must be a positive number."),
});

const formSchema = z.object({
  clientName: z.string().min(3, "Client's name is required."),
  clientPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  clientAddress: z.string().min(10, "Address is required."),
  asOnDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  assets: z.array(assetSchema),
  liabilities: z.array(liabilitySchema),
});

type FormData = z.infer<typeof formSchema>;

const numberToWords = (num: number): string => {
    const a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    const b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if (!num) return 'Zero';
    if ((num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != '00') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim().charAt(0).toUpperCase() + str.trim().slice(1) + " Only";
}


export default function NetWorthCertificatePage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPan: "",
      clientAddress: "",
      asOnDate: new Date().toISOString().split("T")[0],
      assets: [{ description: "Immovable Property - Residential Flat", value: 5000000 }],
      liabilities: [{ description: "Housing Loan from HDFC Bank", value: 2000000 }],
    },
  });

  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({ control: form.control, name: "assets" });
  const { fields: liabilityFields, append: appendLiability, remove: removeLiability } = useFieldArray({ control: form.control, name: "liabilities" });
  
  const watchedAssets = form.watch("assets");
  const watchedLiabilities = form.watch("liabilities");
  const totalAssets = watchedAssets.reduce((acc, asset) => acc + (Number(asset.value) || 0), 0);
  const totalLiabilities = watchedLiabilities.reduce((acc, liability) => acc + (Number(liability.value) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const handleGenerateDraft = async () => {
    const isValid = await form.trigger();
    if(isValid) {
        setStep(4); // Move to preview step
        toast({
            title: "Draft Ready for Preview",
            description: "Review the generated certificate below.",
        });
    } else {
         toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill all required fields before generating the draft.",
        });
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Net_Worth_Certificate_${form.getValues("clientName")}`,
    onAfterPrint: () => toast({ title: "Print job sent." }),
  });


  const renderStepContent = () => {
    switch(step) {
        case 1:
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Client and Date Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel>Client's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="clientAddress" render={({ field }) => (<FormItem><FormLabel>Client's Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="clientPan" render={({ field }) => (<FormItem><FormLabel>Client's PAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="asOnDate" render={({ field }) => (<FormItem><FormLabel>Net Worth as on Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                    </CardContent>
                     <CardFooter className="justify-end"><Button type="button" onClick={() => form.trigger(["clientName", "clientAddress", "clientPan", "asOnDate"]).then(isValid => isValid && setStep(2))}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
                </Card>
            )
        case 2:
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assetFields.map((field, index) => (
                             <div key={field.id} className="flex gap-2 items-end">
                                <FormField control={form.control} name={`assets.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`assets.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeAsset(index)}><Trash2 className="size-4 text-destructive"/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendAsset({ description: "", value: 0 })}><PlusCircle className="mr-2"/> Add Asset</Button>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2"/> Back</Button>
                        <Button type="button" onClick={() => form.trigger("assets").then(isValid => isValid && setStep(3))}>Next <ArrowRight className="ml-2"/></Button>
                    </CardFooter>
                 </Card>
            )
        case 3:
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {liabilityFields.map((field, index) => (
                             <div key={field.id} className="flex gap-2 items-end">
                                <FormField control={form.control} name={`liabilities.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`liabilities.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeLiability(index)}><Trash2 className="size-4 text-destructive"/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendLiability({ description: "", value: 0 })}><PlusCircle className="mr-2"/> Add Liability</Button>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button type="button" variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2"/> Back</Button>
                        <Button type="button" onClick={handleGenerateDraft}>
                            <FileSignature className="mr-2"/> Generate Draft
                        </Button>
                    </CardFooter>
                 </Card>
            )
        case 4:
            const formData = form.getValues();
            const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Final Preview</CardTitle>
                        <CardDescription>Review the generated certificate. You can print it or send it for certification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div ref={printRef} className="prose dark:prose-invert max-w-none border rounded-lg p-8">
                           <header className="text-center border-b-2 border-primary pb-4 mb-8">
                                <h1 className="text-2xl font-bold text-primary m-0">S. KRANTHI KUMAR & Co.</h1>
                                <p className="text-sm m-0">Chartered Accountants</p>
                                <p className="text-xs m-0">H.No. 2-2-1130/2/A, G-1, Amberpet, Hyderabad-500013</p>
                                <p className="text-xs m-0">Email: skkandco@gmail.com</p>
                           </header>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="font-bold text-sm">To Whom It May Concern</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">UDIN: [UDIN GOES HERE]</p>
                                    <p className="text-sm">Date: {new Date(formData.asOnDate).toLocaleDateString('en-GB', dateOptions)}</p>
                                </div>
                            </div>
                            
                             <p>
                                This is to certify that the Net Worth of <strong>Sri {formData.clientName}</strong>, S/o (or other relation) [Parent's Name], R/o {formData.clientAddress} (PAN: {formData.clientPan}) as on {new Date(formData.asOnDate).toLocaleDateString('en-GB', dateOptions)} is as follows:
                            </p>

                            <Table className="my-4">
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-bold text-foreground">ASSETS</TableHead>
                                        <TableHead className="text-right font-bold text-foreground">Amount in Rs</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.assets.map((asset, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{asset.description}</TableCell>
                                            <TableCell className="text-right font-mono">{asset.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFoot>
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Total Assets</TableCell>
                                        <TableCell className="text-right font-mono">{totalAssets.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                                    </TableRow>
                                </TableFoot>
                            </Table>

                             <Table className="my-4">
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-bold text-foreground">LIABILITIES</TableHead>
                                        <TableHead className="text-right font-bold text-foreground">Amount in Rs</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {formData.liabilities.map((lib, i) => (
                                        <TableRow key={i}>
                                            <TableCell>Less: {lib.description}</TableCell>
                                            <TableCell className="text-right font-mono">{lib.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFoot>
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Total Liabilities</TableCell>
                                        <TableCell className="text-right font-mono">{totalLiabilities.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                                    </TableRow>
                                </TableFoot>
                            </Table>
                            
                             <Table className="my-4">
                                <TableBody>
                                    <TableRow className="font-bold text-lg bg-primary/10">
                                        <TableCell>NET WORTH AS ON {new Date(formData.asOnDate).toLocaleDateString('en-GB', dateOptions).toUpperCase()}</TableCell>
                                        <TableCell className="text-right font-mono">{netWorth.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <p>(Rupees {numberToWords(netWorth)} only)</p>

                            <p className="mt-8 text-xs">
                                This certificate is issued based on the information and records produced before us and is true to the best of our knowledge and belief.
                            </p>

                            <div className="mt-24 text-right">
                                <p className="font-bold">For S. KRANTHI KUMAR & Co.</p>
                                <p>Chartered Accountants</p>
                                <div className="h-20"></div>
                                <p>(S. Kranthi Kumar)</p>
                                <p>Proprietor</p>
                                <p>Membership No: 224983</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                         <Button type="button" variant="outline" onClick={() => setStep(3)}><ArrowLeft className="mr-2"/> Back</Button>
                         <div>
                            <button onClick={handlePrint} className={cn(buttonVariants())}>
                                <Printer className="mr-2"/> Print / Save PDF
                            </button>
                            <Button type="button" className="ml-2" onClick={() => toast({title: "Request Sent", description: "Draft sent to admin for certification."})}>
                                <FileSignature className="mr-2"/> Request Certification
                            </Button>
                         </div>
                    </CardFooter>
                </Card>
            )
        default: return null;
    }
  }


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/ca-certificates" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Certificate Menu
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Net Worth Certificate</h1>
        <p className="text-muted-foreground">Generate a draft certificate of net worth for an individual or HUF.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
            {renderStepContent()}
        </form>
      </Form>
    </div>
  );
}
