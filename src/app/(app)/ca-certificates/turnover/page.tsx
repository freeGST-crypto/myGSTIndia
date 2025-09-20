
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ArrowLeft, FileSignature, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ShareButtons } from "@/components/documents/share-buttons";

const formSchema = z.object({
  entityName: z.string().min(3, "Entity name is required."),
  entityAddress: z.string().min(10, "Entity address is required."),
  entityPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  financialYear: z.string().regex(/^\d{4}-\d{2}$/, "Invalid format. Use YYYY-YY."),
  turnoverAmount: z.coerce.number().positive("Turnover must be a positive number."),
  dataSource: z.string().min(3, "Source of data is required."),
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
    str += (parseInt(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (parseInt(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (parseInt(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (parseInt(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (parseInt(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim().charAt(0).toUpperCase() + str.trim().slice(1) + " Only";
}

export default function TurnoverCertificatePage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityName: "",
      entityAddress: "",
      entityPan: "",
      financialYear: "2023-24",
      turnoverAmount: 0,
      dataSource: "audited financial statements",
    },
  });

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if(isValid) {
        setStep(2);
        toast({ title: "Draft Ready", description: "Review the certificate before proceeding." });
    } else {
        toast({ variant: "destructive", title: "Validation Error", description: "Please fill all required fields."});
    }
  }

  const handleCertificationRequest = () => {
      toast({
          title: "Request Sent",
          description: "Draft sent to admin for certification."
      });
  }

  const renderContent = () => {
    if (step === 1) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Business and Period Information</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <FormField control={form.control} name="entityName" render={({ field }) => (<FormItem><FormLabel>Entity Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     <FormField control={form.control} name="entityAddress" render={({ field }) => (<FormItem><FormLabel>Registered Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <div className="grid md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="entityPan" render={({ field }) => (<FormItem><FormLabel>PAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                         <FormField control={form.control} name="financialYear" render={({ field }) => (<FormItem><FormLabel>Financial Year (e.g., 2023-24)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                     <FormField control={form.control} name="turnoverAmount" render={({ field }) => (<FormItem><FormLabel>Turnover Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     <FormField control={form.control} name="dataSource" render={({ field }) => (<FormItem><FormLabel>Basis of Certification</FormLabel><FormControl><Input placeholder="e.g., Audited financial statements" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </CardContent>
                 <CardFooter>
                    <Button type="button" onClick={handlePreview}>
                       <ArrowRight className="mr-2" /> Preview Certificate
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === 2) {
        const formData = form.getValues();
        const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const whatsappMessage = `Dear ${formData.entityName},\n\nPlease find attached the Turnover Certificate for FY ${formData.financialYear}.\n\nThank you,\nS. KRANTHI KUMAR & Co.`;

        return (
             <Card>
                <CardHeader>
                    <CardTitle>Final Preview</CardTitle>
                    <CardDescription>Review the generated certificate. You can download or share it.</CardDescription>
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
                                <p className="font-bold text-sm">TO WHOMSOEVER IT MAY CONCERN</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">UDIN: [UDIN GOES HERE]</p>
                                <p className="text-sm">Date: {new Date().toLocaleDateString('en-GB', dateOptions)}</p>
                            </div>
                        </div>
                        
                        <h4 className="font-bold text-center underline my-6">TURNOVER CERTIFICATE</h4>

                        <p>This is to certify that we have verified the books of accounts and other relevant records of <strong>M/s {formData.entityName}</strong>, having its registered office at {formData.entityAddress} and holding PAN <strong>{formData.entityPan}</strong>.</p>
                        
                        <p>Based on our verification of the {formData.dataSource}, we certify that the total turnover of the entity for the financial year ended on 31st March {formData.financialYear.slice(0,4)} is as follows:</p>

                        <table className="my-6 w-full">
                            <tbody>
                                <tr className="border-t border-b">
                                    <td className="py-2 font-semibold">Financial Year</td>
                                    <td className="py-2 text-right font-semibold">{formData.financialYear}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 font-semibold">Turnover / Gross Receipts</td>
                                    <td className="py-2 text-right font-mono font-semibold">₹ {formData.turnoverAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <p>The total turnover is <strong>Rupees {numberToWords(formData.turnoverAmount)} only</strong>.</p>

                        <p className="mt-8 text-xs">
                            This certificate is issued at the specific request of the entity for the purpose of submitting to [Purpose, e.g., Tender Application]. Our liability is limited to the extent of information provided by the management and is based on the records produced before us.
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
                     <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2"/> Back to Edit</Button>
                     <div className="flex gap-2">
                        <ShareButtons
                            contentRef={printRef}
                            fileName={`Turnover_Certificate_${formData.entityName}`}
                            whatsappMessage={whatsappMessage}
                        />
                        <Button type="button" onClick={handleCertificationRequest}>
                            <FileSignature className="mr-2"/> Request Certification
                        </Button>
                     </div>
                </CardFooter>
            </Card>
        )
    }
  }


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/ca-certificates" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Certificate Menu
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Turnover Certificate</h1>
        <p className="text-muted-foreground">Generate a draft certificate for business turnover.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
            {renderContent()}
        </form>
      </Form>
    </div>
  );
}
