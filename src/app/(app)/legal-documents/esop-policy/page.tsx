
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
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useReactToPrint } from "react-to-print";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  companyName: z.string().min(3, "Company name is required."),
  planName: z.string().min(3, "Plan name is required (e.g., 'ESOP 2024')."),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  
  optionPoolSize: z.coerce.number().positive("Option pool size must be a positive percentage."),
  
  eligibility: z.string().default("All permanent employees, including whole-time directors of the Company, who have been with the Company for a minimum continuous period of one (1) year."),
  
  vestingPeriodYears: z.coerce.number().positive("Vesting period must be positive.").default(4),
  vestingCliffMonths: z.coerce.number().min(0, "Cliff must be non-negative.").default(12),
  vestingSchedule: z.string().default("25% of the Options shall vest upon completion of one year from the grant date (the 'cliff'), and the remaining 75% shall vest in 36 equal monthly installments thereafter."),

  exercisePrice: z.string().default("The exercise price per Option shall be the fair market value of the share as determined by a registered valuer on the date of grant."),
  exercisePeriod: z.string().default("The vested Options may be exercised by the employee at any time within a period of five (5) years from the date of vesting."),

  administration: z.string().default("The Plan shall be administered by the Nomination and Remuneration Committee of the Board of Directors of the Company."),
});

type FormData = z.infer<typeof formSchema>;

export default function EsopPolicyPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        companyName: "Acme Innovations Pvt. Ltd.",
        planName: "Acme ESOP 2024",
        effectiveDate: new Date().toISOString().split("T")[0],
        optionPoolSize: 10,
        eligibility: "All permanent employees, including whole-time directors of the Company, who have been with the Company for a minimum continuous period of one (1) year.",
        vestingPeriodYears: 4,
        vestingCliffMonths: 12,
        vestingSchedule: "25% of the Options shall vest upon completion of one year from the grant date (the 'cliff'), and the remaining 75% shall vest in 36 equal monthly installments thereafter.",
        exercisePrice: "The exercise price per Option shall be the fair market value of the share as determined by a registered valuer on the date of grant.",
        exercisePeriod: "The vested Options may be exercised by the employee at any time within a period of five (5) years from the date of vesting.",
        administration: "The Plan shall be administered by the Nomination and Remuneration Committee of the Board of Directors of the Company.",
    },
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const processStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["companyName", "planName", "effectiveDate", "optionPoolSize", "eligibility"];
        break;
      case 2:
        fieldsToValidate = ["vestingPeriodYears", "vestingCliffMonths", "vestingSchedule", "exercisePrice", "exercisePeriod", "administration"];
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
      if (step < 3) {
        toast({ title: `Step ${step} Saved`, description: `Proceeding to step ${step + 1}.` });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors before proceeding.",
      });
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader><CardTitle>Step 1: Plan Basics</CardTitle><CardDescription>Define the name, size, and eligibility criteria for your ESOP.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="planName" render={({ field }) => ( <FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="effectiveDate" render={({ field }) => ( <FormItem><FormLabel>Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="optionPoolSize" render={({ field }) => ( <FormItem><FormLabel>Total Option Pool (% of Equity)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
                 <FormField control={form.control} name="eligibility" render={({ field }) => ( <FormItem><FormLabel>Eligibility Criteria</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Vesting & Exercise Terms</CardTitle><CardDescription>Define how and when employees can earn and purchase their shares.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="vestingPeriodYears" render={({ field }) => ( <FormItem><FormLabel>Total Vesting Period (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="vestingCliffMonths" render={({ field }) => ( <FormItem><FormLabel>Vesting Cliff (Months)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
                 <FormField control={form.control} name="vestingSchedule" render={({ field }) => ( <FormItem><FormLabel>Vesting Schedule Description</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <Separator/>
                 <FormField control={form.control} name="exercisePrice" render={({ field }) => ( <FormItem><FormLabel>Exercise Price Determination</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <FormField control={form.control} name="exercisePeriod" render={({ field }) => ( <FormItem><FormLabel>Post-Termination Exercise Period</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <FormField control={form.control} name="administration" render={({ field }) => ( <FormItem><FormLabel>Plan Administration</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Document <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        const formData = form.getValues();
        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated ESOP Policy document.</CardDescription></CardHeader>
                <CardContent>
                  <div ref={printRef} className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h2 className="text-center font-bold">{formData.companyName}</h2>
                    <h3 className="text-center font-bold">EMPLOYEE STOCK OPTION PLAN {new Date(formData.effectiveDate).getFullYear()} ("{formData.planName}")</h3>
                    <p><strong>Effective Date:</strong> {new Date(formData.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                    <h4 className="font-bold mt-4">1. OBJECTIVES</h4>
                    <p>The objectives of this Plan are to attract, retain, and motivate talented employees, to align their interests with those of the shareholders, and to promote ownership-thinking.</p>

                    <h4 className="font-bold mt-4">2. TOTAL SIZE OF THE OPTION POOL</h4>
                    <p>The total number of shares reserved for issuance under this Plan shall not exceed {formData.optionPoolSize}% of the total issued and outstanding equity shares of the Company on a fully diluted basis.</p>

                    <h4 className="font-bold mt-4">3. ELIGIBILITY</h4>
                    <p>{formData.eligibility}</p>

                    <h4 className="font-bold mt-4">4. VESTING OF OPTIONS</h4>
                    <p>The Options granted under this Plan shall vest over a total period of {formData.vestingPeriodYears} years. {formData.vestingSchedule}</p>

                    <h4 className="font-bold mt-4">5. EXERCISE OF OPTIONS</h4>
                    <p><strong>Exercise Price:</strong> {formData.exercisePrice}</p>
                    <p><strong>Exercise Period:</strong> {formData.exercisePeriod}</p>
                    <p>The exercise of vested Options shall be subject to a separate Grant Letter and is conditional upon the employee's continued employment with the Company.</p>
                    
                    <h4 className="font-bold mt-4">6. ADMINISTRATION</h4>
                    <p>{formData.administration}</p>

                    <h4 className="font-bold mt-4">7. GOVERNING LAW</h4>
                    <p>This Plan shall be governed by and construed in accordance with the applicable laws of India.</p>
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
        <h1 className="text-3xl font-bold">ESOP Policy Generator</h1>
        <p className="text-muted-foreground">Follow the steps to create a comprehensive Employee Stock Option Plan policy.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}

