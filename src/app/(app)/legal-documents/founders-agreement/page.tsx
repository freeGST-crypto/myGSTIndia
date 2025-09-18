
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const founderSchema = z.object({
  name: z.string().min(2, "Founder name is required."),
  address: z.string().min(10, "Address is required."),
  role: z.string().min(2, "Role/Title is required."),
  responsibilities: z.string().min(10, "Responsibilities are required."),
  equity: z.coerce.number().min(0).max(100),
});

const formSchema = z.object({
  projectName: z.string().min(3, "Project/Company name is required."),
  projectDescription: z.string().min(10, "A brief description is required."),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  
  founders: z.array(founderSchema).min(2, "At least two founders are required."),
  
  vestingYears: z.coerce.number().positive().default(4),
  vestingCliffMonths: z.coerce.number().min(0).default(12),

  decisionMaking: z.enum(["unanimous", "majority"]).default("unanimous"),
  ipAssignment: z.string().default("All Intellectual Property developed by any Founder related to the Project shall be owned by the Company."),
  confidentiality: z.string().default("Founders agree to keep all proprietary information confidential."),
  disputeResolution: z.string().default("Disputes shall be resolved through mediation, followed by arbitration in [City] if mediation fails."),
  
}).refine(data => {
    const totalEquity = data.founders.reduce((acc, f) => acc + f.equity, 0);
    return totalEquity === 100;
}, {
    message: "Total equity must equal 100%.",
    path: ["founders"],
});

type FormData = z.infer<typeof formSchema>;

export default function FoundersAgreementPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      projectDescription: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      founders: [
        { name: "", address: "", role: "CEO", responsibilities: "Overall strategy and fundraising.", equity: 50 },
        { name: "", address: "", role: "CTO", responsibilities: "Technology development and team management.", equity: 50 },
      ],
      vestingYears: 4,
      vestingCliffMonths: 12,
      decisionMaking: "unanimous",
      ipAssignment: "All work product and intellectual property created by the Founders related to the Project shall be the sole property of the Company.",
      confidentiality: "Each Founder agrees to maintain the confidentiality of the Project's proprietary information.",
      disputeResolution: "Any disputes arising out of this Agreement shall first be attempted to be resolved through mutual negotiation. If unresolved, disputes shall be subject to binding arbitration in [City].",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "founders",
  });

  const totalEquity = form.watch("founders").reduce((acc, founder) => acc + (founder.equity || 0), 0);

  const processStep = async () => {
    let fieldsToValidate: any[] = [];
    switch (step) {
        case 1:
            fieldsToValidate = ["projectName", "projectDescription", "effectiveDate", "founders"];
            break;
        case 2:
            fieldsToValidate = ["vestingYears", "vestingCliffMonths"];
            break;
        case 3:
            fieldsToValidate = ["decisionMaking", "ipAssignment", "confidentiality", "disputeResolution"];
            break;
    }
    
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(prev => prev + 1);
      if (step < 4) {
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
            <CardHeader><CardTitle>Step 1: Project & Founders</CardTitle><CardDescription>Define the venture and its founding members.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
               <FormField control={form.control} name="projectName" render={({ field }) => ( <FormItem><FormLabel>Project / Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="projectDescription" render={({ field }) => ( <FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="effectiveDate" render={({ field }) => ( <FormItem className="max-w-xs"><FormLabel>Agreement Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <Separator />
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h3 className="font-medium">Founder {index + 1}</h3>
                  {fields.length > 2 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  
                  <FormField control={form.control} name={`founders.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                   <FormField control={form.control} name={`founders.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name={`founders.${index}.role`} render={({ field }) => ( <FormItem><FormLabel>Role (e.g., CEO, CTO)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name={`founders.${index}.equity`} render={({ field }) => ( <FormItem><FormLabel>Equity Share (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                  <FormField control={form.control} name={`founders.${index}.responsibilities`} render={({ field }) => ( <FormItem><FormLabel>Primary Responsibilities</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", address: "", role: "", responsibilities: "", equity: 0 })}><PlusCircle className="mr-2"/> Add Founder</Button>
               {form.formState.errors.founders?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.founders.root.message}</p>}
               {totalEquity !== 100 && <p className="text-sm font-medium text-destructive">Total equity must equal 100%. Current total: {totalEquity}%</p>}
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Equity Vesting</CardTitle><CardDescription>Define the schedule for how founders earn their equity over time.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">A vesting schedule protects the company and its founders. If a founder leaves early, they only get to keep the portion of equity they have "earned". The standard is a 4-year vesting period with a 1-year cliff.</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="vestingYears" render={({ field }) => ( <FormItem><FormLabel>Vesting Period (in Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Total time to earn 100% of equity.</FormDescription><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="vestingCliffMonths" render={({ field }) => ( <FormItem><FormLabel>Vesting Cliff (in Months)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>If a founder leaves before the cliff, they get 0% equity.</FormDescription><FormMessage /></FormItem> )}/>
                </div>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Governance & IP</CardTitle><CardDescription>Define rules for decision-making and intellectual property.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="decisionMaking" render={({ field }) => ( <FormItem><FormLabel>Decision Making</FormLabel>
                <FormControl>
                    <div className="flex gap-4">
                        <Button type="button" variant={field.value === 'unanimous' ? 'default' : 'outline'} onClick={() => field.onChange('unanimous')}>Unanimous Consent</Button>
                        <Button type="button" variant={field.value === 'majority' ? 'default' : 'outline'} onClick={() => field.onChange('majority')}>Majority Vote</Button>
                    </div>
                </FormControl>
               <FormDescription>How will major company decisions be made?</FormDescription><FormMessage /></FormItem> )}/>
               <Separator/>
               <FormField control={form.control} name="ipAssignment" render={({ field }) => ( <FormItem><FormLabel>Intellectual Property (IP) Assignment</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="confidentiality" render={({ field }) => ( <FormItem><FormLabel>Confidentiality</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="disputeResolution" render={({ field }) => ( <FormItem><FormLabel>Dispute Resolution</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Draft <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 4:
        const formData = form.getValues();
        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated Founders' Agreement.</CardDescription></CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h2 className="text-center font-bold">FOUNDERS' AGREEMENT</h2>
                    <p>This Founders' Agreement (the "Agreement") is made and entered into as of <strong>{new Date(formData.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> (the "Effective Date"), by and among:</p>
                    
                    {formData.founders.map((p, i) => (
                       <div key={p.name} className="my-2">
                           <p><strong>{p.name}</strong>, residing at {p.address} (hereinafter referred to as "Founder {i + 1}"),</p>
                       </div>
                    ))}
                     <p>(Collectively referred to as the "Founders").</p>
                    
                    <h4 className="font-bold mt-4">RECITALS</h4>
                    <p>WHEREAS, the Founders have collectively developed the concept for <strong>{formData.projectName}</strong>, a business concerning: {formData.projectDescription} (the "Project" or "Company").</p>
                    <p>WHEREAS, the Founders desire to formalize their relationship and set forth their respective rights and obligations concerning the Project.</p>

                    <h4 className="font-bold mt-4">AGREEMENT</h4>
                    <p>NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Founders agree as follows:</p>
                    
                    <h4 className="font-bold mt-4">1. The Project</h4>
                    <p>The Founders agree to cooperate to develop the Project. The primary goal of the Project is to build a successful commercial venture based on the business description above.</p>

                    <h4 className="font-bold mt-4">2. Roles and Responsibilities</h4>
                    <p>The initial roles and primary responsibilities of each Founder are as follows:</p>
                     <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                        {formData.founders.map(p => (
                            <li key={p.name}><strong>{p.name} ({p.role}):</strong> {p.responsibilities}</li>
                        ))}
                    </ul>

                    <h4 className="font-bold mt-4">3. Equity Ownership</h4>
                    <p>Upon formation of a legal entity for the Project (the "Company"), the equity securities of the Company shall be allocated to the Founders as follows:</p>
                     <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                        {formData.founders.map(p => (
                            <li key={p.name}><strong>{p.name}:</strong> {p.equity}%</li>
                        ))}
                    </ul>

                    <h4 className="font-bold mt-4">4. Vesting</h4>
                     <p>The equity allocated to each Founder shall vest over a period of <strong>{formData.vestingYears} years</strong>, subject to a <strong>{formData.vestingCliffMonths}-month cliff</strong>. This means that if a Founder departs from the Project for any reason before {formData.vestingCliffMonths} months from the Effective Date, they shall forfeit all their equity. After the cliff, equity shall vest monthly in equal installments over the remainder of the vesting period. </p>

                    <h4 className="font-bold mt-4">5. Decision Making</h4>
                    <p>All major business decisions for the Project, including but not limited to, incurring significant debt, issuing new equity, selling the company, or changing the primary business focus, shall require the <strong>{formData.decisionMaking}</strong> approval of all Founders.</p>

                    <h4 className="font-bold mt-4">6. Intellectual Property</h4>
                    <p>{formData.ipAssignment}</p>

                    <h4 className="font-bold mt-4">7. Confidentiality</h4>
                    <p>{formData.confidentiality}</p>

                    <h4 className="font-bold mt-4">8. Founder Departure</h4>
                    <p>If a Founder ceases to be actively involved in the Project (a "Departing Founder"), the Company shall have the right, but not the obligation, to repurchase the Departing Founder's unvested shares at cost (i.e., for no consideration if not yet paid for). The Company may also have a right of first refusal to purchase the vested shares of the Departing Founder at fair market value.</p>
                    
                    <h4 className="font-bold mt-4">9. Dispute Resolution</h4>
                     <p>{formData.disputeResolution}</p>
                    
                    <h4 className="font-bold mt-4">10. Entire Agreement</h4>
                    <p>This Agreement constitutes the entire agreement between the Founders with respect to the Project and supersedes all prior agreements, understandings, and negotiations.</p>

                    <p className="mt-8">IN WITNESS WHEREOF, the Founders have executed this Agreement as of the Effective Date.</p>
                    
                     <div className="grid grid-cols-2 gap-16 mt-16">
                         {formData.founders.map(p => (
                            <div key={p.name} className="text-left">
                                <p className="mb-12">_________________________</p>
                                <p><strong>{p.name}</strong></p>
                            </div>
                         ))}
                    </div>
                </CardContent>
                <CardFooter className="justify-between mt-6"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={() => toast({title: "Download Started"})}><FileDown className="mr-2"/> Download Agreement</Button></CardFooter>
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
        <h1 className="text-3xl font-bold">Founders’ Agreement Generator</h1>
        <p className="text-muted-foreground">Follow the steps to create an essential legal document for your startup.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => processStep())} className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}

    