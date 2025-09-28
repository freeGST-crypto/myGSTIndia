
"use client";

import { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  Wand2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { suggestClausesAction } from "./actions";
import { Checkbox } from "@/components/ui/checkbox";
import { ShareButtons } from "@/components/documents/share-buttons";

const partnerSchema = z.object({
    name: z.string().min(2, "Partner name is required."),
    parentage: z.string().min(3, "S/o, W/o, or D/o is required."),
    age: z.coerce.number().positive("Age must be a positive number.").default(30),
    address: z.string().min(10, "Address is required."),
    capitalContribution: z.coerce.number().positive("Must be a positive number."),
    profitShare: z.coerce.number().min(0, { message: "Cannot be negative" }).max(100, { message: "Cannot exceed 100" }),
    isWorkingPartner: z.boolean().default(false),
});

const formSchema = z.object({
  firmName: z.string().min(3, "Firm name is required."),
  firmAddress: z.string().min(10, "Firm address is required."),
  businessActivity: z.string().min(10, "Business activity description is required."),
  commencementDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  partnershipDuration: z.enum(["at-will", "fixed-term"]),
  termYears: z.coerce.number().optional(),
  
  partners: z.array(partnerSchema).min(2, "At least two partners are required.")
    .refine(partners => partners.filter(p => p.isDesignated).length >= 2, {
        message: "At least two partners must be designated partners.",
    }),
  
  totalCapital: z.coerce.number().positive(),

  interestOnCapital: z.coerce.number().min(0).max(12, "As per IT Act, max 12% is allowed.").optional(),
  partnerRemuneration: z.coerce.number().min(0).optional(),
  
  bankAuthority: z.enum(["joint", "single", "specific"]),
  specificPartner: z.string().optional(),

  admissionProcedure: z.string().optional(),
  retirementProcedure: z.string().optional(),
  dissolutionGrounds: z.string().optional(),

  arbitration: z.boolean().default(true),
  arbitrationCity: z.string().optional(),
  
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

export default function PartnershipDeedPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSuggestingClauses, setIsSuggestingClauses] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmName: "",
      firmAddress: "",
      businessActivity: "",
      commencementDate: new Date().toISOString().split("T")[0],
      partnershipDuration: "at-will",
      partners: [
        { name: "", parentage: "", age: 30, address: "", capitalContribution: 50000, profitShare: 50, isWorkingPartner: true },
        { name: "", parentage: "", address: "", capitalContribution: 50000, profitShare: 50, isWorkingPartner: false },
      ],
      totalCapital: 100000,
      interestOnCapital: 12,
      partnerRemuneration: 0,
      bankAuthority: "joint",
      admissionProcedure: "A new partner may be admitted with the mutual consent of all existing partners.",
      retirementProcedure: "A partner may retire by giving a written notice of at least 90 days to other partners.",
      dissolutionGrounds: "The firm shall be dissolved by mutual consent of all partners.",
      arbitration: true,
      arbitrationCity: "Mumbai",
      extraClauses: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partners",
  });
  
  const formData = form.watch();
  const partnersWatch = form.watch("partners");
  const totalProfitShare = partnersWatch.reduce((acc, partner) => acc + (Number(partner.profitShare) || 0), 0);


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
            documentType: "Partnership Deed",
            businessActivity,
            existingClauses: existingClauses || ""
        });
        if(result?.suggestedClauses && result.suggestedClauses.length > 0) {
            const newClausesText = result.suggestedClauses.map(c => `\n\n${c.title.toUpperCase()}\n${c.clauseText}`).join('');
            form.setValue("extraClauses", (existingClauses || "") + newClausesText);
            toast({ title: "AI Clauses Added", description: "Suggested clauses have been appended to the text box." });
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
    let fieldsToValidate: (keyof FormData | `partners.${number}.${keyof z.infer<typeof partnerSchema>}` | "partners")[] = [];
    switch (step) {
        case 1:
            fieldsToValidate = ["firmName", "firmAddress", "businessActivity", "commencementDate", "partnershipDuration"];
            break;
        case 2:
            fieldsToValidate = ["partners", "totalCapital"];
            break;
        case 3:
            fieldsToValidate = ["interestOnCapital", "partnerRemuneration"];
            break;
        case 4:
            fieldsToValidate = ["bankAuthority"];
            if (form.getValues("bankAuthority") === 'specific' && !form.getValues("specificPartner")) {
                form.setError("specificPartner", { type: 'manual', message: "Please select a partner."});
                return;
            }
            break;
        case 5:
            fieldsToValidate = ["admissionProcedure", "retirementProcedure", "dissolutionGrounds"];
            break;
        case 6:
            fieldsToValidate = ["arbitration", "arbitrationCity"];
            break;
        case 7:
            fieldsToValidate = ["extraClauses"];
            break;
    }
    
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(prev => prev + 1);
       if (step < 8) {
        toast({
            title: `Step ${step} Saved`,
            description: `Proceeding to step ${step + 1}.`,
        });
      }
    } else {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please correct the errors on this page before proceeding.",
        });
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader><CardTitle>Step 1: Firm Details</CardTitle><CardDescription>Enter the basic details of your partnership firm.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="firmName" render={({ field }) => (
                <FormItem><FormLabel>Firm Name</FormLabel><FormControl><Input placeholder="e.g., Acme Innovations" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="firmAddress" render={({ field }) => (
                <FormItem><FormLabel>Principal Place of Business</FormLabel><FormControl><Textarea placeholder="Full registered address of the firm" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="businessActivity" render={({ field }) => (
                <FormItem><FormLabel>Nature of Business</FormLabel><FormControl><Textarea placeholder="e.g., Trading of textiles, providing software consultancy services, etc." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="commencementDate" render={({ field }) => (
                    <FormItem><FormLabel>Date of Commencement</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                   <FormField control={form.control} name="partnershipDuration" render={({ field }) => (
                    <FormItem><FormLabel>Duration of Partnership</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="at-will">Partnership at Will</SelectItem>
                                <SelectItem value="fixed-term">Fixed Term Partnership</SelectItem>
                            </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                  )}/>
               </div>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Partner & Contribution Details</CardTitle><CardDescription>Add details for each partner in the firm.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="totalCapital" render={({ field }) => (<FormItem><FormLabel>Total Capital Contribution of LLP (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              {form.formState.errors.totalCapital && <p className="text-sm font-medium text-destructive">{form.formState.errors.totalCapital.message}</p>}
              <Separator />
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h3 className="font-medium">Partner {index + 1}</h3>
                  {fields.length > 2 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  
                  <div className="grid md:grid-cols-3 gap-4">
                     <FormField control={form.control} name={`partners.${index}.name`} render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name={`partners.${index}.parentage`} render={({ field }) => (
                        <FormItem><FormLabel>S/o, W/o, D/o</FormLabel><FormControl><Input placeholder="e.g., S/o John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name={`partners.${index}.age`} render={({ field }) => (
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                  </div>
                   <FormField control={form.control} name={`partners.${index}.address`} render={({ field }) => (
                    <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`partners.${index}.capitalContribution`} render={({ field }) => (
                        <FormItem><FormLabel>Capital Contribution (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`partners.${index}.profitShare`} render={({ field }) => (
                        <FormItem><FormLabel>Profit/Loss Share (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                   <FormField control={form.control} name={`partners.${index}.isWorkingPartner`} render={({ field }) => (
                     <FormItem className="flex flex-row items-center justify-start gap-2 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id={`isWorking-${index}`} /></FormControl><Label className="font-normal" htmlFor={`isWorking-${index}`}>This is a working/active partner</Label></FormItem>
                  )}/>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", parentage: "", age: 30, address: "", capitalContribution: 0, profitShare: 0, isWorkingPartner: false })}><PlusCircle className="mr-2"/> Add Another Partner</Button>
              {form.formState.errors.partners?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.partners.root.message}</p>}
               {form.formState.errors.partners && !form.formState.errors.root && totalProfitShare !== 100 && <p className="text-sm font-medium text-destructive">Total profit share must be 100%. Current total: {totalProfitShare}%</p>}
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
          return (
            <Card>
                <CardHeader><CardTitle>Step 3: Capital & Remuneration</CardTitle><CardDescription>Define interest on capital and remuneration for working partners.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="interestOnCapital" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Interest on Capital (% p.a.)</FormLabel>
                            <FormControl><Input type="number" placeholder="12" {...field} /></FormControl>
                            <FormDescription>As per the Income Tax Act, the maximum deductible interest is 12% p.a. Enter 0 for no interest.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="partnerRemuneration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Remuneration to Working Partners (₹ per month, per partner)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                             <FormDescription>This will be payable to partners marked as 'working partner'. Enter 0 for no remuneration.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
                <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
            </Card>
          );
      case 4:
        return (
          <Card>
            <CardHeader><CardTitle>Step 4: Banking & Operations</CardTitle><CardDescription>Define how the firm's bank account will be operated.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="bankAuthority" render={({ field }) => (
                <FormItem>
                    <FormLabel>Bank Account Operation Authority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="joint">Jointly by all partners</SelectItem>
                            <SelectItem value="single">Singly by any partner</SelectItem>
                            <SelectItem value="specific">By a specific designated partner</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
               )}/>
               {form.watch("bankAuthority") === "specific" && (
                   <FormField control={form.control} name="specificPartner" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Specific Partner</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a partner"/></SelectTrigger></FormControl>
                            <SelectContent>
                                {form.getValues("partners").map((p, i) => p.name && <SelectItem key={i} value={p.name}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                   )}/>
               )}
            </CardContent>
             <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 5:
        return (
            <Card>
                <CardHeader><CardTitle>Step 5: Partner Lifecycle</CardTitle><CardDescription>Define procedures for admission, retirement, and dissolution.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="admissionProcedure" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Admission of a New Partner</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="retirementProcedure" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Retirement of a Partner</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="dissolutionGrounds" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dissolution of the Firm</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
                 <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
            </Card>
        );
       case 6:
        return (
            <Card>
                <CardHeader><CardTitle>Step 6: Dispute Resolution</CardTitle><CardDescription>Define how disputes among partners will be handled.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="arbitration" render={({ field }) => (
                        <FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <Label>Include Arbitration Clause</Label></FormItem>
                    )}/>
                    {form.watch("arbitration") && (
                        <FormField control={form.control} name="arbitrationCity" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jurisdiction / City for Arbitration</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormDescription>This will be the city where legal proceedings, if any, will take place.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    )}
                </CardContent>
                <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
            </Card>
        );
     case 7:
         return (
          <Card>
            <CardHeader><CardTitle>Step 7: Additional Clauses</CardTitle><CardDescription>Add any custom clauses or use AI to suggest them based on your business.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="extraClauses" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Custom Clauses / Special Conditions</FormLabel>
                        <FormControl><Textarea className="min-h-48" placeholder="e.g., 'No partner shall engage in any competing business without the written consent of all other partners.'" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <Button type="button" onClick={handleSuggestClauses} disabled={isSuggestingClauses}>
                    {isSuggestingClauses ? <Loader2 className="animate-spin mr-2"/> : <Wand2 className="mr-2"/>}
                    Suggest Clauses with AI
                </Button>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Draft <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
     case 8:
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
        const formattedDate = new Date().toLocaleDateString('en-GB', dateOptions);
        const commencementDateFormatted = new Date(formData.commencementDate).toLocaleDateString('en-GB', dateOptions);
        const whatsappMessage = `Hi, please find the attached draft Partnership Deed for ${formData.firmName || "[Firm Name]"}. Kindly review and let me know if any changes are required.`;

        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated Partnership Deed.</CardDescription></CardHeader>
                <CardContent>
                    <div ref={printRef} className="print-section">
                        <div id="printable-area" className="prose prose-sm dark:prose-invert max-w-none bg-white p-8 text-black leading-relaxed">
                            {/* Form No. 1 */}
                            <div className="text-center space-y-2 mb-12">
                                <h4 className="font-bold">Form No. 1</h4>
                                <p className="text-xs">Rule 4 (II)</p>
                                <h5 className="font-bold">THE INDIAN PARTNERSHIP ACT, 1932</h5>
                                <h5 className="font-bold">Application for Registration of Firm by the Name</h5>
                            </div>
                            <p>Presented or forward to the registrar of Firm and for filing by M/s {formData.firmName || "[Firm Name]"}</p>
                            <p>We, the undersigned being the partners of the *Firm M/s {formData.firmName || "[Firm Name]"} hereby apply for registration of the said firm and for that purpose supply the following particulars in pursuance of section 58 of the Indian Partnership Act, 1932.</p>
                            <table className="w-full my-4">
                                <tbody>
                                    <tr><td className="w-1/3 align-top">Name of the Firm :</td><td>M/s {formData.firmName || "[Firm Name]"}</td></tr>
                                    <tr className="h-4"></tr>
                                    <tr><td className="w-1/3 align-top">Place of Business: <br/> (a) Principal <br/> (b) Other Place</td><td>(a) {formData.firmAddress || "[Firm Address]"} <br/> (b) NIL</td></tr>
                                </tbody>
                            </table>
                            <table className="w-full my-4 border-collapse border border-black">
                                <thead><tr className="bg-gray-200"><th className="border border-black p-1">Name of the Partner</th><th className="border border-black p-1">Address of the Partner</th><th className="border border-black p-1">Date of Joining</th></tr></thead>
                                <tbody>
                                    {formData.partners.map((p, i) => (
                                        <tr key={i}><td className="border border-black p-1">{p.name}</td><td className="border border-black p-1">{p.address}</td><td className="border border-black p-1">{formData.commencementDate ? new Date(formData.commencementDate).toLocaleDateString('en-IN') : ''}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex justify-between mt-16">
                                <div>
                                    <p>Place:</p>
                                    <p>Date:</p>
                                </div>
                                <div>
                                    <p>Signatures</p>
                                    {formData.partners.map((p, i) => <p key={i} className="mt-8">({i+1})</p>)}
                                </div>
                            </div>
                            <div className="mt-16 space-y-8">
                                <h5 className="font-bold text-center">DECLARATION BY PARTNERS</h5>
                                {formData.partners.map((p, i) => (
                                    <div key={i}>
                                        <p>I {p.name} {p.parentage}, {p.age} Years of age HINDU religion do hereby declare that the above statement is true and correct to the best of my knowledge and belief.</p>
                                        <div className="flex justify-between mt-8"><span>Date:</span><span>Signature .........</span></div>
                                        <p>Witness</p>
                                    </div>
                                ))}
                            </div>

                            {/* Main Deed */}
                            <div className="break-before-page">
                                <h2 className="text-center font-bold">PARTNERSHIP DEED</h2>
                                <h3 className="text-center font-bold">{(formData.firmName || "[Firm Name]").toUpperCase()}</h3>
                                
                                <p>This Deed of Partnership is executed on this the <strong>{formattedDate}</strong>, by and between:-</p>
                                
                                <ol className="list-decimal list-inside space-y-2">
                                    {formData.partners.map((p, i) => (
                                    <li key={i}>
                                        <strong>{p.name}</strong>, {p.parentage}, aged about {p.age} years, Occ: Business, R/o {p.address}. Hereinafter called the {i+1 === 1 ? '1st' : i+1 === 2 ? '2nd' : `${i+1}th`} Partner.
                                    </li>
                                    ))}
                                </ol>
                                
                                <p>(Collectively referred to as “Partners” and individually as a “Partner”).</p>
                                <p>WHEREAS both the Partners hereinabove mentioned have mutually agreed to enter into partnership to do business in "<strong>{formData.businessActivity || '[Business Activity]'}</strong>" under the name & style of "<strong>{formData.firmName || '[Firm Name]'}</strong>", with effect from today, i.e. the {formattedDate}.</p>
                                <p>AND WHEREAS both the Partners hereto have decided to reduce the terms and conditions of this instrument into writing so as to avoid misunderstandings, which may arise in future.</p>
                                
                                <h4 className="font-bold mt-4">NOW THIS DEED OF PARTNERSHIP WITNESSETH AS UNDER:-</h4>
                                
                                <ol className="list-decimal list-inside space-y-3">
                                    <li>The Name of the partnership business shall be “<strong>{formData.firmName || '[Firm Name]'}</strong>” and such other names as the partners may decide from time to time.</li>
                                    <li>The Principal place of business shall be at “<strong>{formData.firmAddress || '[Firm Address]'}</strong>” and such other places may decide from time to time.</li>
                                    <li>The Partnership has come into existence with effect from today, i.e. the {commencementDateFormatted}, and the term of the partnership shall be “<strong>{formData.partnershipDuration === 'at-will' ? 'At Will' : `for a fixed term of ${formData.termYears || '...'} years`}</strong>”.</li>
                                    <li>The Objects of the Partnership shall be to do business in "<strong>{formData.businessActivity || '[Business Activity]'}</strong>” and such other business as the partners may decide from time to time.</li>
                                    <li>The capital required for the purpose of the partnership business shall be contributed and arranged by the partners from time to time as and when needed in such manner as may be mutually agreed upon.</li>
                                    <li className="font-bold italic text-center my-4">(Conti.........Page 2)</li>
                                    <h4 className="font-bold text-center break-before-page">Page 2</h4>
                                    <li>The Partners shall share the profits and bear the losses of the partnership business as under:
                                        <table className="w-full my-2 border border-black">
                                            <thead>
                                                <tr className="border-b border-black bg-gray-200">
                                                    <th className="p-1 border-r border-black">S.No.</th>
                                                    <th className="p-1 border-r border-black text-left">Name of the Partners</th>
                                                    <th className="p-1 text-right">Share of Profit/Loss</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.partners.map((p, i) => (
                                                    <tr key={i} className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">{i+1}.</td>
                                                        <td className="p-1 border-r border-black">{p.name}</td>
                                                        <td className="p-1 text-right">{p.profitShare}%</td>
                                                    </tr>
                                                ))}
                                                <tr className="font-bold bg-gray-200">
                                                    <td colSpan={2} className="p-1 border-r border-black text-right">Total</td>
                                                    <td className="p-1 text-right">100%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        The divisible profits and losses shall be arrived at after providing for the interest on the accounts of the partners and remuneration to working partners as hereinafter provided for as per the terms of this partnership deed.
                                    </li>
                                    <li>The Partners shall be entitled for interest at the rate of <strong>{formData.interestOnCapital}% per annum</strong> or such other higher rate as may be prescribed under the Income Tax Act on the amount outstanding to their respective capital accounts. In case of Loss or lower income, the interest can be NIL or lower than aforementioned rate, as the partners may decide from time to time.</li>
                                    <li>The firm shall not be dissolved on death or retirement of any one or more of the partners unless the remaining partners with mutual consent decide otherwise.</li>
                                    {formData.extraClauses && <li><strong>ADDITIONAL CLAUSES:</strong> {formData.extraClauses}</li>}
                                </ol>

                                <p className="mt-8">This Deed of Partnership is executed with free will and true consent of the partners above said and in witness whereof set their signatures hereunder on the day, month and year aforementioned.</p>

                                <div className="grid grid-cols-2 gap-16 mt-16">
                                    {formData.partners.map(p => (
                                        <div key={p.name} className="text-center">
                                            <p className="mb-12">_________________________</p>
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
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-between mt-6">
                    <Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button>
                    <ShareButtons 
                        contentRef={printRef}
                        fileName={`Partnership_Deed_${formData.firmName}`}
                        whatsappMessage={whatsappMessage}
                    />
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
        <h1 className="text-3xl font-bold">Partnership Deed Generator</h1>
        <p className="text-muted-foreground">Follow the steps to create your legal document.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}
