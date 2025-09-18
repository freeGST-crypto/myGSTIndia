
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
import { Form } from "@/components/ui/form";
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
              <div><Label>Firm Name</Label><Input {...form.register("firmName")} />{form.formState.errors.firmName && <p className="text-sm text-destructive">{form.formState.errors.firmName.message}</p>}</div>
              <div><Label>Principal Place of Business</Label><Textarea {...form.register("firmAddress")} />{form.formState.errors.firmAddress && <p className="text-sm text-destructive">{form.formState.errors.firmAddress.message}</p>}</div>
              <div><Label>Business Activity</Label><Textarea {...form.register("businessActivity")} placeholder="e.g., Trading of textiles, providing software services, etc." />{form.formState.errors.businessActivity && <p className="text-sm text-destructive">{form.formState.errors.businessActivity.message}</p>}</div>
              <div><Label>Date of Commencement</Label><Input type="date" {...form.register("commencementDate")} />{form.formState.errors.commencementDate && <p className="text-sm text-destructive">{form.formState.errors.commencementDate.message}</p>}</div>
            </CardContent>
            <CardFooter className="justify-end"><Button onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
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
                  {fields.length > 2 && <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  <div><Label>Partner Name</Label><Input {...form.register(`partners.${index}.name`)} />{form.formState.errors.partners?.[index]?.name && <p className="text-sm text-destructive">{form.formState.errors.partners[index]?.name?.message}</p>}</div>
                  <div><Label>Address</Label><Textarea {...form.register(`partners.${index}.address`)} />{form.formState.errors.partners?.[index]?.address && <p className="text-sm text-destructive">{form.formState.errors.partners[index]?.address?.message}</p>}</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Capital Contribution (₹)</Label><Input type="number" {...form.register(`partners.${index}.capitalContribution`)} />{form.formState.errors.partners?.[index]?.capitalContribution && <p className="text-sm text-destructive">{form.formState.errors.partners[index]?.capitalContribution?.message}</p>}</div>
                    <div><Label>Profit Share (%)</Label><Input type="number" {...form.register(`partners.${index}.profitShare`)} />{form.formState.errors.partners?.[index]?.profitShare && <p className="text-sm text-destructive">{form.formState.errors.partners[index]?.profitShare?.message}</p>}</div>
                  </div>
                  <div className="flex items-center gap-2"><Input type="checkbox" {...form.register(`partners.${index}.isWorkingPartner`)} className="size-4" /> <Label>This is a working partner</Label></div>
                </div>
              ))}
              <Button variant="outline" onClick={() => append({ name: "", address: "", capitalContribution: 0, profitShare: 0, isWorkingPartner: false })}><PlusCircle className="mr-2"/> Add Partner</Button>
               {form.formState.errors.partners?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.partners.root.message}</p>}
               {totalProfitShare !== 100 && <p className="text-sm font-medium text-destructive">Total profit share must equal 100%. Current total: {totalProfitShare}%</p>}
            </CardContent>
            <CardFooter className="justify-between"><Button variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Banking & Operations</CardTitle><CardDescription>Define how the firm's bank account will be operated.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
               <div>
                   <Label>Bank Account Authority</Label>
                    <Select onValueChange={(value) => form.setValue("bankAuthority", value as "joint" | "single" | "specific")} defaultValue={form.getValues("bankAuthority")}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="joint">Jointly by all partners</SelectItem>
                            <SelectItem value="single">Singly by any partner</SelectItem>
                            <SelectItem value="specific">By a specific partner</SelectItem>
                        </SelectContent>
                    </Select>
               </div>
               {form.watch("bankAuthority") === "specific" && (
                   <div>
                        <Label>Select Specific Partner</Label>
                        <Select onValueChange={(value) => form.setValue("specificPartner", value)} defaultValue={form.getValues("specificPartner")}>
                            <SelectTrigger><SelectValue placeholder="Select a partner"/></SelectTrigger>
                            <SelectContent>
                                {form.getValues("partners").map((p, i) => p.name && <SelectItem key={i} value={p.name}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.specificPartner && <p className="text-sm text-destructive">{form.formState.errors.specificPartner.message}</p>}
                   </div>
               )}
            </CardContent>
             <CardFooter className="justify-between"><Button variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 4:
         return (
          <Card>
            <CardHeader><CardTitle>Step 4: Additional Clauses</CardTitle><CardDescription>Add any custom clauses to the deed.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Custom Clauses / Special Conditions</Label>
                    <Textarea {...form.register("extraClauses")} className="min-h-48" placeholder="e.g., 'In case of a dispute, arbitration shall be held in Mumbai.'"/>
                </div>
                 <Button type="button" disabled>
                    <Loader2 className="mr-2 animate-spin"/>
                    Suggest Clauses with AI (Coming Soon)
                </Button>
            </CardContent>
            <CardFooter className="justify-between"><Button variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button onClick={processStep}>Preview Draft <ArrowRight className="ml-2"/></Button></CardFooter>
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
                <CardFooter className="justify-between"><Button variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button onClick={() => toast({title: "Download Started", description: "Your document is being prepared for download."})}><FileDown className="mr-2"/> Download</Button></CardFooter>
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
        <form>
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}

    