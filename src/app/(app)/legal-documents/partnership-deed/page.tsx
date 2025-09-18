
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
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  FileDown,
  FileSignature,
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
  partners: z.array(partnerSchema).min(2, "At least two partners are required."),
  bankAuthority: z.enum(["joint", "single", "specific"]),
  specificPartner: z.string().optional(),
  extraClauses: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PartnershipDeedPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmName: "",
      firmAddress: "",
      businessActivity: "",
      commencementDate: new Date().toISOString().split("T")[0],
      partners: [
        { name: "", address: "", capitalContribution: 0, profitShare: 50, isWorkingPartner: true },
        { name: "", address: "", capitalContribution: 0, profitShare: 50, isWorkingPartner: false },
      ],
      bankAuthority: "joint",
      extraClauses: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partners",
  });

  const totalProfitShare = form.watch("partners").reduce((acc, partner) => acc + (partner.profitShare || 0), 0);

  const processStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    switch (step) {
        case 1:
            fieldsToValidate = ["firmName", "firmAddress", "businessActivity", "commencementDate"];
            break;
        case 2:
            fieldsToValidate = ["partners"];
            const partners = form.getValues("partners");
            if (partners.length < 2) {
                form.setError("partners", { type: "manual", message: "A partnership requires at least two partners." });
                return;
            }
            if (totalProfitShare !== 100) {
                 form.setError("partners", { type: "manual", message: `Total profit share must be 100%, but it is currently ${totalProfitShare}%.` });
                 return;
            }
            break;
        case 3:
            fieldsToValidate = ["bankAuthority"];
            if (form.getValues("bankAuthority") === 'specific' && !form.getValues("specificPartner")) {
                form.setError("specificPartner", { type: 'manual', message: "Please select a partner."});
                return;
            }
            break;
    }
    
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(prev => prev + 1);
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
            <CardHeader><CardTitle>Step 1: Firm Details</CardTitle><CardDescription>Enter the basic details of your partnership firm.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="firmName" render={({ field }) => (
                <FormItem><FormLabel>Firm Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="firmAddress" render={({ field }) => (
                <FormItem><FormLabel>Principal Place of Business</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="businessActivity" render={({ field }) => (
                <FormItem><FormLabel>Business Activity</FormLabel><FormControl><Textarea placeholder="e.g., Trading of textiles, providing software services, etc." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="commencementDate" render={({ field }) => (
                <FormItem><FormLabel>Date of Commencement</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
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
                    <FormItem><FormLabel>Partner Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                   <FormField control={form.control} name={`partners.${index}.address`} render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`partners.${index}.capitalContribution`} render={({ field }) => (
                        <FormItem><FormLabel>Capital Contribution (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`partners.${index}.profitShare`} render={({ field }) => (
                        <FormItem><FormLabel>Profit Share (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name={`partners.${index}.isWorkingPartner`} render={({ field }) => (
                    <FormItem className="flex items-center gap-2"><FormControl><Input type="checkbox" checked={field.value} onChange={field.onChange} className="size-4" /></FormControl> <Label>This is a working partner</Label></FormItem>
                  )}/>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", address: "", capitalContribution: 0, profitShare: 0, isWorkingPartner: false })}><PlusCircle className="mr-2"/> Add Partner</Button>
               {form.formState.errors.partners?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.partners.root.message}</p>}
               {totalProfitShare !== 100 && !form.formState.errors.partners?.root && <p className="text-sm font-medium text-destructive">Total profit share must equal 100%. Current total: {totalProfitShare}%</p>}
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Banking & Operations</CardTitle><CardDescription>Define how the firm's bank account will be operated.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="bankAuthority" render={({ field }) => (
                <FormItem>
                    <FormLabel>Bank Account Authority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="joint">Jointly by all partners</SelectItem>
                            <SelectItem value="single">Singly by any partner</SelectItem>
                            <SelectItem value="specific">By a specific partner</SelectItem>
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
      case 4:
         return (
          <Card>
            <CardHeader><CardTitle>Step 4: Additional Clauses</CardTitle><CardDescription>Add any custom clauses to the deed.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="extraClauses" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Custom Clauses / Special Conditions</FormLabel>
                        <FormControl><Textarea className="min-h-48" placeholder="e.g., 'In case of a dispute, arbitration shall be held in Mumbai.'" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <Button type="button" disabled>
                    <Loader2 className="mr-2 animate-spin"/>
                    Suggest Clauses with AI (Coming Soon)
                </Button>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Draft <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
     case 5:
        const formData = form.getValues();
        return (
             <Card>
                <CardHeader><CardTitle>Step 5: Preview Draft</CardTitle><CardDescription>Review the generated Partnership Deed. This is a simplified preview.</CardDescription></CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                    <h2>Partnership Deed</h2>
                    <p>This Deed of Partnership is made and entered into on this <strong>{new Date(formData.commencementDate).toLocaleDateString('en-GB')}</strong>.</p>
                    <p>Between the following partners:</p>
                    <ol>{formData.partners.map(p => <li key={p.name}><strong>{p.name}</strong>, residing at {p.address}.</li>)}</ol>
                    <p>The partners agree to carry on the business of <strong>{formData.businessActivity}</strong> under the firm name and style of <strong>M/s {formData.firmName}</strong> at {formData.firmAddress}.</p>
                    <h3>Capital & Profit/Loss Sharing:</h3>
                    <ul>
                        {formData.partners.map(p => (
                           <li key={p.name}>{p.name} shall contribute ₹{p.capitalContribution.toLocaleString('en-IN')} as capital and shall have a profit/loss sharing ratio of {p.profitShare}%.</li>
                        ))}
                    </ul>
                    <h3>Bank Operation:</h3>
                    <p>The bank account of the firm shall be operated {formData.bankAuthority === 'joint' ? 'jointly by all partners.' : formData.bankAuthority === 'single' ? 'singly by any of the partners.' : `by the specified partner: ${formData.specificPartner}.`}</p>
                    {formData.extraClauses && <><h3>Additional Clauses:</h3><p>{formData.extraClauses}</p></>}
                </CardContent>
                <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={() => toast({title: "Download Started", description: "Your document is being prepared for download."})}><FileDown className="mr-2"/> Download</Button></CardFooter>
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

    