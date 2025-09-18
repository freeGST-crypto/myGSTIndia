
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
  FileDown,
  Wand2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const partnerSchema = z.object({
    name: z.string().min(2, "Partner name is required."),
    address: z.string().min(10, "Address is required."),
    capitalContribution: z.coerce.number().positive("Must be a positive number."),
    profitShare: z.coerce.number().min(0).max(100, "Must be between 0 and 100."),
    isWorkingPartner: z.boolean().default(false)
});

const formSchema = z.object({
  firmName: z.string().min(3, "Firm name is required."),
  firmAddress: z.string().min(10, "Firm address is required."),
  businessActivity: z.string().min(10, "Business activity description is required."),
  commencementDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  partnershipDuration: z.enum(["at-will", "fixed-term"]),
  termYears: z.coerce.number().optional(),
  
  partners: z.array(partnerSchema).min(2, "At least two partners are required."),
  
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
});

type FormData = z.infer<typeof formSchema>;

export default function PartnershipDeedPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSuggestingClauses, setIsSuggestingClauses] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmName: "",
      firmAddress: "",
      businessActivity: "",
      commencementDate: new Date().toISOString().split("T")[0],
      partnershipDuration: "at-will",
      partners: [
        { name: "", address: "", capitalContribution: 50000, profitShare: 50, isWorkingPartner: true },
        { name: "", address: "", capitalContribution: 50000, profitShare: 50, isWorkingPartner: false },
      ],
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

  const totalProfitShare = form.watch("partners").reduce((acc, partner) => acc + (partner.profitShare || 0), 0);

  const processStep = async () => {
    let fieldsToValidate: (keyof FormData | `partners.${number}.${keyof typeof partnerSchema.shape}` | "partners")[] = [];
    switch (step) {
        case 1:
            fieldsToValidate = ["firmName", "firmAddress", "businessActivity", "commencementDate", "partnershipDuration"];
            break;
        case 2:
            fieldsToValidate = ["partners"];
             if (form.getValues("partners").length < 2) {
                form.setError("partners", { type: "manual", message: "A partnership requires at least two partners." });
                return;
            }
            if (totalProfitShare !== 100) {
                 form.setError("partners", { type: "manual", message: `Total profit share must be 100%, but it is currently ${totalProfitShare}%.` });
                 return;
            }
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
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
       if (step < 7) {
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
  
  const handleSuggestClauses = () => {
      setIsSuggestingClauses(true);
      toast({title: "AI Suggestion (Demo)", description: "This would call the AI to suggest clauses based on your inputs."});
      setTimeout(() => setIsSuggestingClauses(false), 1500);
  }

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
            <CardHeader><CardTitle>Step 2: Partner Details</CardTitle><CardDescription>Add details for each partner in the firm.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h3 className="font-medium">Partner {index + 1}</h3>
                  {fields.length > 2 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  
                  <FormField control={form.control} name={`partners.${index}.name`} render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
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
                     <FormItem className="flex flex-row items-center justify-start gap-2 pt-2">
                        <FormControl>
                            <Input type="checkbox" checked={field.value} onChange={field.onChange} className="size-4" />
                        </FormControl>
                        <Label className="font-normal" htmlFor={field.name}>This is a working/active partner</Label>
                    </FormItem>
                  )}/>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", address: "", capitalContribution: 0, profitShare: 0, isWorkingPartner: false })}><PlusCircle className="mr-2"/> Add Another Partner</Button>
               {form.formState.errors.partners?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.partners.root.message}</p>}
               {totalProfitShare !== 100 && !form.formState.errors.partners?.root && <p className="text-sm font-medium text-destructive">Total profit share must equal 100%. Current total: {totalProfitShare}%</p>}
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
                        <FormItem className="flex items-center gap-2"><FormControl><Input type="checkbox" checked={field.value} onChange={field.onChange} className="size-4" /></FormControl> <Label>Include Arbitration Clause</Label></FormItem>
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
            <CardHeader><CardTitle>Step 7: Additional Clauses</CardTitle><CardDescription>Add any custom clauses or use AI to suggest them.</CardDescription></CardHeader>
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
        const formData = form.getValues();
        const workingPartners = formData.partners.filter(p => p.isWorkingPartner).map(p => p.name).join(', ');

        return (
             <Card>
                <CardHeader>
                    <CardTitle>Final Step: Preview & Download</CardTitle>
                    <CardDescription>Review the generated Partnership Deed. This is a simplified preview. Download for the fully formatted document.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20">
                    <h2 className="text-center">DEED OF PARTNERSHIP</h2>
                    <p>This Deed of Partnership is made and entered into on this <strong>{new Date(formData.commencementDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
                    
                    <h4>BETWEEN:</h4>
                    <ol>{formData.partners.map((p, i) => <li key={p.name}><strong>{p.name}</strong>, son of/daughter of _______, residing at {p.address}, hereinafter referred to as "Partner {i+1}".</li>)}</ol>
                    <p>(Hereinafter collectively referred to as "the Partners")</p>
                    
                    <h4>WHEREAS:</h4>
                    <ol>
                        <li>The Partners are desirous of carrying on the business of <strong>{formData.businessActivity}</strong> in partnership under the name and style of <strong>M/s {formData.firmName}</strong>.</li>
                        <li>The principal place of business shall be at <strong>{formData.firmAddress}</strong>.</li>
                    </ol>

                    <h4>NOW, THIS DEED WITNESSETH AS FOLLOWS:</h4>
                    <p><strong>1. DURATION:</strong> The partnership shall be {formData.partnershipDuration === 'at-will' ? 'at WILL.' : `for a fixed period of ${formData.termYears || 'N/A'} years.`}</p>
                    <p><strong>2. CAPITAL CONTRIBUTION:</strong> The capital shall be contributed by the partners as follows:</p>
                    <ul>
                        {formData.partners.map(p => (
                           <li key={p.name}><strong>{p.name}:</strong> ₹ {p.capitalContribution.toLocaleString('en-IN')}</li>
                        ))}
                    </ul>
                    <p><strong>3. PROFIT & LOSS SHARING:</strong> The net profits and losses of the business shall be shared among the partners in the following ratio:</p>
                     <ul>
                        {formData.partners.map(p => (
                           <li key={p.name}><strong>{p.name}:</strong> {p.profitShare}%</li>
                        ))}
                    </ul>
                    <p><strong>4. INTEREST & REMUNERATION:</strong></p>
                    <ul>
                        <li>Interest at the rate of <strong>{formData.interestOnCapital || 0}% per annum</strong> shall be paid on the capital contributed by each partner.</li>
                        <li>A monthly remuneration of <strong>₹{formData.partnerRemuneration?.toLocaleString('en-IN') || 0}</strong> shall be payable to the working partners, namely: {workingPartners || 'None'}.</li>
                    </ul>
                    <p><strong>5. BANKING:</strong> The bank account of the firm shall be operated {formData.bankAuthority === 'joint' ? 'jointly by all partners.' : formData.bankAuthority === 'single' ? 'singly by any of the partners.' : `by the specified partner: ${formData.specificPartner}.`}</p>
                    <p><strong>6. ADMISSION & RETIREMENT:</strong></p>
                    <ul>
                        <li><strong>Admission:</strong> {formData.admissionProcedure}</li>
                        <li><strong>Retirement:</strong> {formData.retirementProcedure}</li>
                    </ul>
                     <p><strong>7. DISSOLUTION:</strong> {formData.dissolutionGrounds}</p>
                     {formData.arbitration && <p><strong>8. ARBITRATION:</strong> All disputes between the partners concerning the business of the firm shall be referred to arbitration as per the Arbitration and Conciliation Act, 1996. The venue for arbitration shall be <strong>{formData.arbitrationCity}</strong>.</p>}
                    {formData.extraClauses && <><h4>ADDITIONAL CLAUSES:</h4><p>{formData.extraClauses}</p></>}
                </CardContent>
                <CardFooter className="justify-between mt-6"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={() => toast({title: "Download Started", description: "Your document is being prepared for download."})}><FileDown className="mr-2"/> Download Final Deed</Button></CardFooter>
            </Card>
        )
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
        <form onSubmit={form.handleSubmit(() => processStep())} className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}

    