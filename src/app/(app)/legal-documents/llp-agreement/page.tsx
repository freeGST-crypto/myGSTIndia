
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  FileDown,
  Wand2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { suggestClausesAction } from "./actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const partnerSchema = z.object({
    name: z.string().min(2, "Partner name is required."),
    parentage: z.string().min(3, "S/o, W/o, or D/o is required."),
    address: z.string().min(10, "Address is required."),
    isDesignated: z.boolean().default(false),
    capitalContribution: z.coerce.number().positive("Must be a positive number."),
    profitShare: z.coerce.number().min(0).max(100, "Must be between 0 and 100."),
});

const formSchema = z.object({
  llpName: z.string().min(3, "LLP name is required."),
  state: z.string().min(2, "State of registration is required."),
  registeredAddress: z.string().min(10, "Registered address is required."),
  businessActivity: z.string().min(10, "Business activity description is required."),
  commencementDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  
  partners: z.array(partnerSchema).min(2, "At least two partners are required.")
    .refine(partners => partners.filter(p => p.isDesignated).length >= 2, {
        message: "At least two partners must be designated partners.",
    }),
  
  totalCapital: z.coerce.number().positive(),

  admissionClause: z.string().optional(),
  cessationClause: z.string().optional(),
  disputeResolutionClause: z.string().optional(),

  extraClauses: z.string().optional(),
}).refine(data => {
    const totalContribution = data.partners.reduce((acc, p) => acc + p.capitalContribution, 0);
    return totalContribution === data.totalCapital;
}, {
    message: "Total capital contribution from partners must match the LLP's total capital.",
    path: ["totalCapital"],
}).refine(data => {
    const totalProfitShare = data.partners.reduce((acc, p) => acc + p.profitShare, 0);
    return totalProfitShare === 100;
}, {
    message: "Total profit share must equal 100%.",
    path: ["partners"],
});

type FormData = z.infer<typeof formSchema>;

export default function LlpAgreementPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSuggestingClauses, setIsSuggestingClauses] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      llpName: "",
      state: "Maharashtra",
      registeredAddress: "",
      businessActivity: "",
      commencementDate: new Date().toISOString().split("T")[0],
      partners: [
        { name: "", parentage: "", address: "", isDesignated: true, capitalContribution: 50000, profitShare: 50 },
        { name: "", parentage: "", address: "", isDesignated: true, capitalContribution: 50000, profitShare: 50 },
      ],
      totalCapital: 100000,
      admissionClause: "A new partner may be admitted with the consent of all existing partners.",
      cessationClause: "A partner may cease to be a partner by giving a written notice of 30 days.",
      disputeResolutionClause: "All disputes shall be referred to arbitration as per the Arbitration and Conciliation Act, 1996.",
      extraClauses: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partners",
  });

  const handleSuggestClauses = async () => {
    const businessActivity = form.getValues("businessActivity");
    if (!businessActivity) {
      form.setError("businessActivity", {type: "manual", message: "Business activity is required to suggest clauses."});
      return;
    }
    setIsSuggestingClauses(true);
    try {
        const existingClauses = form.getValues("extraClauses");
        const result = await suggestClausesAction({
            documentType: "LLP Agreement",
            businessActivity,
            existingClauses: existingClauses || ""
        });
        if(result?.suggestedClauses && result.suggestedClauses.length > 0) {
            const newClausesText = result.suggestedClauses.map(c => `\n\n${c.title.toUpperCase()}\n${c.clauseText}`).join('');
            form.setValue("extraClauses", (existingClauses || "") + newClausesText);
            toast({ title: "AI Clauses Added", description: "Suggested clauses have been appended." });
        } else {
             toast({ variant: "destructive", title: "Suggestion Failed", description: "Could not generate clauses." });
        }
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: "An error occurred while generating clauses." });
    } finally {
        setIsSuggestingClauses(false);
    }
  }

  const processStep = async () => {
    let fieldsToValidate: (keyof FormData | "partners")[] = [];
    switch (step) {
        case 1:
            fieldsToValidate = ["llpName", "state", "registeredAddress", "businessActivity", "commencementDate"];
            break;
        case 2:
            fieldsToValidate = ["partners", "totalCapital"];
            break;
        case 3:
            fieldsToValidate = ["admissionClause", "cessationClause", "disputeResolutionClause"];
            break;
        case 4:
            fieldsToValidate = ["extraClauses"];
            break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
       if (step < 5) {
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
            <CardHeader><CardTitle>Step 1: LLP Details</CardTitle><CardDescription>Enter the basic details of your Limited Liability Partnership.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="llpName" render={({ field }) => ( <FormItem><FormLabel>LLP Name</FormLabel><FormControl><Input placeholder="e.g., Acme Innovations LLP" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="registeredAddress" render={({ field }) => ( <FormItem><FormLabel>Registered Office Address</FormLabel><FormControl><Textarea placeholder="Full registered address of the LLP" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="businessActivity" render={({ field }) => ( <FormItem><FormLabel>Proposed Business Activity</FormLabel><FormControl><Textarea placeholder="e.g., To provide software development and consultancy services." {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="state" render={({ field }) => ( <FormItem><FormLabel>State of Registration</FormLabel><FormControl><Input placeholder="e.g., Maharashtra" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  <FormField control={form.control} name="commencementDate" render={({ field }) => ( <FormItem><FormLabel>Date of Commencement</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
               </div>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Partner & Contribution Details</CardTitle><CardDescription>Add details for each partner and their contribution.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="totalCapital" render={({ field }) => (<FormItem><FormLabel>Total Capital Contribution of LLP (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              {form.formState.errors.totalCapital && <p className="text-sm font-medium text-destructive">{form.formState.errors.totalCapital.message}</p>}
              <Separator />
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h3 className="font-medium">Partner {index + 1}</h3>
                  {fields.length > 2 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name={`partners.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name={`partners.${index}.parentage`} render={({ field }) => ( <FormItem><FormLabel>S/o, W/o, D/o</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                   <FormField control={form.control} name={`partners.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`partners.${index}.capitalContribution`} render={({ field }) => ( <FormItem><FormLabel>Capital Contribution (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name={`partners.${index}.profitShare`} render={({ field }) => ( <FormItem><FormLabel>Profit Share (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                   <FormField control={form.control} name={`partners.${index}.isDesignated`} render={({ field }) => ( <FormItem className="flex flex-row items-center gap-2 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label className="font-normal">Designated Partner</Label></FormItem> )}/>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", parentage: "", address: "", isDesignated: false, capitalContribution: 0, profitShare: 0 })}><PlusCircle className="mr-2"/> Add Partner</Button>
              {form.formState.errors.partners?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.partners.root.message}</p>}
               {form.formState.errors.partners && !form.formState.errors.partners.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.partners.message}</p>}
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Governance Clauses</CardTitle><CardDescription>Define rules for partner admission, cessation, and disputes.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="admissionClause" render={({ field }) => ( <FormItem><FormLabel>Admission of New Partner</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="cessationClause" render={({ field }) => ( <FormItem><FormLabel>Cessation of Existing Partner</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField control={form.control} name="disputeResolutionClause" render={({ field }) => ( <FormItem><FormLabel>Dispute Resolution</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 4:
         return (
          <Card>
            <CardHeader><CardTitle>Step 4: Additional Clauses</CardTitle><CardDescription>Add custom clauses or use AI to suggest them based on your business.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="extraClauses" render={({ field }) => ( <FormItem><FormLabel>Custom Clauses / Special Conditions</FormLabel><FormControl><Textarea className="min-h-48" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <Button type="button" onClick={handleSuggestClauses} disabled={isSuggestingClauses}>
                    {isSuggestingClauses ? <Loader2 className="animate-spin mr-2"/> : <Wand2 className="mr-2"/>}
                    Suggest Clauses with AI
                </Button>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Draft <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 5:
        const formData = form.getValues();
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
        const formattedDate = new Date().toLocaleDateString('en-GB', dateOptions);
        const commencementDateFormatted = new Date(formData.commencementDate).toLocaleDateString('en-GB', dateOptions);

        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated LLP Agreement.</CardDescription></CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h2 className="text-center font-bold">LIMITED LIABILITY PARTNERSHIP AGREEMENT</h2>
                    <h3 className="text-center font-bold">OF</h3>
                    <h3 className="text-center font-bold">{formData.llpName.toUpperCase()}</h3>
                    
                    <p>This Limited Liability Partnership Agreement is made on this <strong>{formattedDate}</strong> at <strong>{formData.state}</strong>.</p>
                    
                    <p className="font-bold">BY AND BETWEEN</p>
                    
                    {formData.partners.map((p, i) => (
                       <div key={p.name} className="my-4">
                           <p><strong>{p.name}</strong>, {p.parentage}, aged about {new Date().getFullYear() - 1990} years, residing at {p.address} (hereinafter referred to as the “{i === 0 ? 'First' : i === 1 ? 'Second' : 'Third'} Partner”),</p>
                           {i < formData.partners.length -1 && <p className="font-bold text-center">AND</p>}
                       </div>
                    ))}
                    
                    <p>(Collectively referred to as “Partners” and individually as a “Partner”).</p>
                    
                    <h4 className="font-bold mt-4">1. Name</h4>
                    <p>The name of the LLP shall be <strong>{formData.llpName}</strong>.</p>

                    <h4 className="font-bold mt-4">2. Registered Office</h4>
                    <p>The registered office of the LLP shall be situated at <strong>{formData.registeredAddress}</strong>, or such other place as may be mutually decided by the Partners.</p>
                    
                    <h4 className="font-bold mt-4">3. Business of LLP</h4>
                    <p>The LLP shall carry on the business of <strong>{formData.businessActivity}</strong> and such other activities as may be decided by the Partners from time to time.</p>
                    
                    <h4 className="font-bold mt-4">4. Duration</h4>
                    <p>The LLP shall come into existence from the date of its incorporation, which is <strong>{commencementDateFormatted}</strong>, and shall have perpetual succession until it is wound up in accordance with the provisions of the LLP Act, 2008.</p>

                    <h4 className="font-bold mt-4">5. Capital Contribution</h4>
                    <p>The initial capital of the LLP shall be <strong>₹{formData.totalCapital.toLocaleString('en-IN')}</strong>, which shall be contributed by the Partners in the following proportions:</p>
                    <ul className="list-disc list-inside pl-4 mt-2">
                        {formData.partners.map(p => (
                            <li key={p.name}><strong>{p.name}:</strong> ₹{p.capitalContribution.toLocaleString('en-IN')}</li>
                        ))}
                    </ul>
                    <p>Any further capital contribution required by the LLP shall be brought by the partners in their profit-sharing ratio or as may be mutually decided by all the partners.</p>

                    <h4 className="font-bold mt-4">6. Profit Sharing Ratio</h4>
                    <p>The net profits and losses of the business of the LLP shall be shared and borne by the Partners in the following ratio:</p>
                     <ul className="list-disc list-inside pl-4 mt-2">
                        {formData.partners.map(p => (
                            <li key={p.name}><strong>{p.name}:</strong> {p.profitShare}%</li>
                        ))}
                    </ul>

                    <h4 className="font-bold mt-4">7. Management & Duties</h4>
                    <p>All partners shall have the right to participate in the business of the LLP. Each Partner shall act in good faith and to the best interest of the LLP. However, the day-to-day management shall be conducted by the Designated Partners.</p>
                    <p>The following matters shall require the consent of all Partners:</p>
                    <ul className="list-disc list-inside pl-4 mt-2">
                        <li>Change in the nature of business of the LLP.</li>
                        <li>Admission of a new Partner.</li>
                        <li>Retirement or expulsion of a Partner.</li>
                        <li>Dissolution of the LLP.</li>
                        <li>Amendment to this LLP Agreement.</li>
                    </ul>

                    <h4 className="font-bold mt-4">8. Accounts & Audit</h4>
                    <p>Proper books of account shall be maintained at the registered office of the LLP. The accounts shall be closed on 31st March every year. If required under the LLP Act, 2008, or any other applicable law, an audit shall be conducted by a qualified Chartered Accountant.</p>

                    <h4 className="font-bold mt-4">9. Bank Accounts</h4>
                    <p>The LLP shall open one or more bank account(s) in its name with any scheduled bank. Such account(s) shall be operated by such Partner(s) as may be decided by a majority of the Partners from time to time.</p>

                    <h4 className="font-bold mt-4">10. Admission / Retirement of Partner</h4>
                    <p>{formData.admissionClause}</p>
                    <p>{formData.cessationClause}</p>

                    <h4 className="font-bold mt-4">11. Resignation / Expulsion</h4>
                    <p>A Partner may resign from the LLP by giving prior notice as agreed upon. A Partner may be expelled for acts of fraud, willful misconduct, or a material breach of this agreement, with the consent of the remaining Partners.</p>
                    
                    <h4 className="font-bold mt-4">12. Transfer of Rights</h4>
                    <p>No Partner shall transfer or assign their share or interest in the LLP to any third party without the unanimous prior written consent of the other Partners.</p>

                    <h4 className="font-bold mt-4">13. Dispute Resolution</h4>
                    <p>{formData.disputeResolutionClause}</p>

                    <h4 className="font-bold mt-4">14. Winding Up</h4>
                    <p>The LLP may be wound up voluntarily with the unanimous consent of all Partners or compulsorily as per the provisions of the LLP Act, 2008.</p>

                    <h4 className="font-bold mt-4">15. Miscellaneous</h4>
                    <p>All matters not expressly covered in this Agreement shall be governed by the provisions of the Limited Liability Partnership Act, 2008, and the rules made thereunder. This Agreement may be amended only by a written instrument executed by all the Partners.</p>
                    {formData.extraClauses && <div className="mt-4"><h4 className="font-bold">16. Additional Clauses</h4><p>{formData.extraClauses}</p></div>}

                    <p className="mt-8">IN WITNESS WHEREOF, the Partners hereto have signed this Agreement on the day, month and year first above written.</p>
                    
                    <div className="grid grid-cols-2 gap-16 mt-16">
                         {formData.partners.map(p => (
                            <div key={p.name} className="text-center">
                                <p>_________________________</p>
                                <p>({p.name})</p>
                            </div>
                         ))}
                    </div>
                     <div className="mt-16">
                        <p className="font-bold">Witnesses:</p>
                        <ol className="list-decimal list-inside mt-8 space-y-8">
                            <li>
                                <p>Name & Signature: _________________________</p>
                                <p>Address: _______________________</p>
                            </li>
                             <li>
                                <p>Name & Signature: _________________________</p>
                                <p>Address: _______________________</p>
                            </li>
                        </ol>
                    </div>

                </CardContent>
                <CardFooter className="justify-between mt-6"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={() => toast({title: "Download Started"})}><FileDown className="mr-2"/> Download Final Agreement</Button></CardFooter>
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
        <h1 className="text-3xl font-bold">LLP Agreement Generator</h1>
        <p className="text-muted-foreground">Follow the steps to create your Limited Liability Partnership agreement.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}
