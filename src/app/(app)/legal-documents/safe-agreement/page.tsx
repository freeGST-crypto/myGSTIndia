
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useReactToPrint } from "react-to-print";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  companyName: z.string().min(3, "Company name is required."),
  companyAddress: z.string().min(10, "Company address is required."),
  investorName: z.string().min(3, "Investor's name is required."),
  investorAddress: z.string().min(10, "Investor's address is required."),
  agreementDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  
  investmentAmount: z.coerce.number().positive("Investment amount must be positive."),
  
  valuationCap: z.coerce.number().positive("Valuation cap is required."),
  discountRate: z.coerce.number().min(0).max(100).default(20),
  
  liquidityEvent: z.string().default("A change of control or an initial public offering."),
  dissolutionEvent: z.string().default("A voluntary or involuntary termination of the Company’s operations."),
});

type FormData = z.infer<typeof formSchema>;

export default function SafeAgreementPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      investorName: "",
      investorAddress: "",
      agreementDate: new Date().toISOString().split("T")[0],
      investmentAmount: 500000,
      valuationCap: 50000000, // 5 Crore
      discountRate: 20,
    },
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const processStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["companyName", "companyAddress", "investorName", "investorAddress", "agreementDate"];
        break;
      case 2:
        fieldsToValidate = ["investmentAmount", "valuationCap", "discountRate", "liquidityEvent", "dissolutionEvent"];
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
      if (step < 3) {
        toast({ title: `Step ${step} Saved` });
      }
    } else {
      toast({ variant: "destructive", title: "Validation Error" });
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader><CardTitle>Step 1: Parties & Investment</CardTitle><CardDescription>Enter details about the company and the investor.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="investorName" render={({ field }) => ( <FormItem><FormLabel>Investor Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <FormField control={form.control} name="agreementDate" render={({ field }) => ( <FormItem className="max-w-xs"><FormLabel>Agreement Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Key SAFE Terms</CardTitle><CardDescription>Define the critical terms of the investment.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="investmentAmount" render={({ field }) => ( <FormItem><FormLabel>Investment Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="valuationCap" render={({ field }) => ( <FormItem><FormLabel>Valuation Cap (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="discountRate" render={({ field }) => ( <FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
                <Separator/>
                 <FormField control={form.control} name="liquidityEvent" render={({ field }) => ( <FormItem><FormLabel>Definition of Liquidity Event</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <FormField control={form.control} name="dissolutionEvent" render={({ field }) => ( <FormItem><FormLabel>Definition of Dissolution Event</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Document <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        const formData = form.getValues();
        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated SAFE Agreement.</CardDescription></CardHeader>
                <CardContent>
                  <div ref={printRef} className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h2 className="text-center font-bold">SAFE (Simple Agreement for Future Equity)</h2>
                    <p><strong>THIS INSTRUMENT AND ANY SECURITIES ISSUABLE PURSUANT HERETO HAVE NOT BEEN REGISTERED... [Standard Disclaimer]</strong></p>
                    
                    <p><strong>Company:</strong> {formData.companyName}</p>
                    <p><strong>Investor:</strong> {formData.investorName}</p>
                    <p><strong>Purchase Amount:</strong> ₹{formData.investmentAmount.toLocaleString('en-IN')}</p>
                    <p><strong>Effective Date:</strong> {new Date(formData.agreementDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    
                    <p>THIS CERTIFIES THAT in exchange for the payment by the Investor of the Purchase Amount, the Company issues to the Investor the right to certain shares of the Company’s capital stock, subject to the terms set forth below.</p>

                    <h4 className="font-bold mt-4">1. Events</h4>
                    <p><strong>(a) Equity Financing.</strong> If there is an Equity Financing before the expiration or termination of this instrument, the Company will automatically issue to the Investor a number of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Conversion Price.</p>
                    <p><strong>(b) Liquidity Event.</strong> If there is a Liquidity Event before the expiration or termination of this instrument, the Investor will, at its option, either (i) receive a cash payment equal to the Purchase Amount or (ii) automatically receive from the Company a number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price.</p>
                    <p><strong>(c) Dissolution Event.</strong> If there is a Dissolution Event before the expiration or termination of this instrument, the Company will pay an amount equal to the Purchase Amount, due and payable to the Investor immediately prior to the consummation of the Dissolution Event.</p>

                    <h4 className="font-bold mt-4">2. Definitions</h4>
                    <p><strong>"Valuation Cap"</strong> is ₹{formData.valuationCap.toLocaleString('en-IN')}.</p>
                    <p><strong>"Discount Rate"</strong> is {formData.discountRate}%.</p>
                    <p><strong>"Liquidity Event"</strong> means {formData.liquidityEvent}</p>
                     <p><strong>"Dissolution Event"</strong> means {formData.dissolutionEvent}</p>

                    <h4 className="font-bold mt-4">3. Company Representations</h4>
                    <p>The Company is a corporation duly organized, validly existing and in good standing under the laws of India. The execution, delivery and performance of this instrument is within the power and authority of the Company.</p>
                    
                    <p className="mt-8">IN WITNESS WHEREOF, the undersigned have caused this instrument to be duly executed and delivered as of the date first written above.</p>
                    
                     <div className="grid grid-cols-2 gap-16 mt-16">
                        <div className="text-left">
                            <p className="font-bold">COMPANY:</p>
                            <p className="mt-12">_________________________</p>
                            <p>By: {formData.companyName}</p>
                            <p>Name:</p>
                            <p>Title: Director</p>
                        </div>
                        <div className="text-left">
                            <p className="font-bold">INVESTOR:</p>
                            <p className="mt-12">_________________________</p>
                            <p>By: {formData.investorName}</p>
                        </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between mt-6">
                  <Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button>
                  <button onClick={handlePrint} className={cn(buttonVariants())}><Printer className="mr-2"/> Print / Save as PDF</button>
                </CardFooter>
            </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Document Selection
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">SAFE Agreement Generator</h1>
        <p className="text-muted-foreground">Create a Simple Agreement for Future Equity for early-stage fundraising.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}
