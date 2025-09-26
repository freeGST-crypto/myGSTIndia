
"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, PlusCircle, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useReactToPrint } from "react-to-print";
import { cn } from "@/lib/utils";

const shareholderSchema = z.object({
  name: z.string().min(2, "Shareholder name is required."),
  address: z.string().min(10, "Address is required."),
  shares: z.coerce.number().positive("Shares must be a positive number."),
  class: z.string().min(1, "Class of shares is required.").default("Equity"),
});

const formSchema = z.object({
  companyName: z.string().min(3, "Company name is required."),
  companyAddress: z.string().min(10, "Company address is required."),
  agreementDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  
  shareholders: z.array(shareholderSchema).min(2, "At least two shareholders are required."),
  
  boardComposition: z.string().default("The Board shall consist of three (3) directors. Each major shareholder group shall have the right to appoint one director."),
  
  reservedMatters: z.string().default("Amendments to MOA/AOA, issuance of new shares, declaration of dividends, sale of the company, and taking on debt above a specified limit shall require the affirmative vote of at least 75% of the shareholders."),
  
  transferRestrictions: z.string().default("No shareholder shall transfer their shares for a period of two (2) years (the 'Lock-in Period'). Thereafter, any transfer will be subject to a Right of First Refusal (ROFR) in favor of the other shareholders."),
  
  dividendPolicy: z.string().default("The distribution of dividends shall be determined by the Board of Directors at the end of each financial year, subject to the availability of distributable profits and the business needs of the Company."),

  jurisdictionCity: z.string().min(2, "Jurisdiction city is required.").default("Mumbai"),
});

type FormData = z.infer<typeof formSchema>;

export default function ShareholdersAgreementPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      agreementDate: new Date().toISOString().split("T")[0],
      shareholders: [
        { name: "", address: "", shares: 5000, class: "Equity" },
        { name: "", address: "", shares: 5000, class: "Equity" },
      ],
      jurisdictionCity: "Mumbai",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shareholders",
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const processStep = async () => {
    let fieldsToValidate: any[] = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["companyName", "companyAddress", "agreementDate", "shareholders"];
        break;
      case 2:
        fieldsToValidate = ["boardComposition", "reservedMatters", "transferRestrictions", "dividendPolicy", "jurisdictionCity"];
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
            <CardHeader><CardTitle>Step 1: Parties & Shareholding</CardTitle><CardDescription>Enter details about the company and its shareholders.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
               <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="companyAddress" render={({ field }) => ( <FormItem><FormLabel>Registered Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="agreementDate" render={({ field }) => ( <FormItem className="max-w-xs"><FormLabel>Agreement Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <Separator />
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h3 className="font-medium">Shareholder {index + 1}</h3>
                  {fields.length > 2 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  <FormField control={form.control} name={`shareholders.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Full Name / Entity Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  <FormField control={form.control} name={`shareholders.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name={`shareholders.${index}.shares`} render={({ field }) => ( <FormItem><FormLabel>Number of Shares</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name={`shareholders.${index}.class`} render={({ field }) => ( <FormItem><FormLabel>Class of Shares</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", address: "", shares: 0, class: "Equity" })}><PlusCircle className="mr-2"/> Add Shareholder</Button>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Governance & Key Clauses</CardTitle><CardDescription>Define the rules for company management and share transfers.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="boardComposition" render={({ field }) => ( <FormItem><FormLabel>Board Composition & Director Rights</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="reservedMatters" render={({ field }) => ( <FormItem><FormLabel>Reserved Matters (Requiring Special Consent)</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="transferRestrictions" render={({ field }) => ( <FormItem><FormLabel>Restrictions on Transfer of Shares (Lock-in, ROFR)</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="dividendPolicy" render={({ field }) => ( <FormItem><FormLabel>Dividend Policy</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <FormField control={form.control} name="jurisdictionCity" render={({ field }) => ( <FormItem className="max-w-sm"><FormLabel>Jurisdiction City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Document <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        const formData = form.getValues();
        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated Shareholders' Agreement.</CardDescription></CardHeader>
                <CardContent>
                  <div ref={printRef} className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h2 className="text-center font-bold">SHAREHOLDERS' AGREEMENT</h2>
                    <p>This Agreement is made on <strong>{new Date(formData.agreementDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
                    
                    <h4 className="font-bold">PARTIES:</h4>
                    <p>1. <strong>{formData.companyName}</strong>, a company incorporated under the Companies Act, 2013, with its registered office at {formData.companyAddress} (the "Company").</p>
                    <p>2. The persons listed in Schedule A (collectively, the "Shareholders").</p>
                    
                    <h4 className="font-bold mt-4">1. Board of Directors</h4>
                    <p>{formData.boardComposition}</p>
                    
                    <h4 className="font-bold mt-4">2. Reserved Matters</h4>
                    <p>Notwithstanding anything to the contrary in the Articles of Association, the following matters shall require the prior written consent of shareholders holding at least {formData.reservedMatters.includes('75%') ? '75%' : 'a majority'} of the voting shares: {formData.reservedMatters}</p>

                    <h4 className="font-bold mt-4">3. Transfer of Shares</h4>
                    <p>{formData.transferRestrictions}</p>

                    <h4 className="font-bold mt-4">4. Dividend Policy</h4>
                    <p>{formData.dividendPolicy}</p>

                    <h4 className="font-bold mt-4">5. Governing Law and Jurisdiction</h4>
                    <p>This Agreement shall be governed by the laws of India. The courts in {formData.jurisdictionCity}, India, shall have exclusive jurisdiction.</p>

                    <h3 className="font-bold mt-8">SCHEDULE A: SHAREHOLDERS</h3>
                    <table className="w-full my-4 border-collapse border border-black">
                        <thead><tr className="bg-muted/50"><th className="border border-black p-1">Name</th><th className="border border-black p-1">Address</th><th className="border border-black p-1">No. of Shares</th><th className="border border-black p-1">Class</th></tr></thead>
                        <tbody>
                            {formData.shareholders.map((s, index) => (
                                <tr key={index}><td className="border border-black p-1">{s.name}</td><td className="border border-black p-1">{s.address}</td><td className="border border-black p-1">{s.shares}</td><td className="border border-black p-1">{s.class}</td></tr>
                            ))}
                        </tbody>
                    </table>
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
        <h1 className="text-3xl font-bold">Shareholders' Agreement (SHA) Generator</h1>
        <p className="text-muted-foreground">Draft a comprehensive agreement to govern the relationship between a company and its shareholders.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}
