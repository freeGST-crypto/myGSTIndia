
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
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
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

const trusteeSchema = z.object({
  name: z.string().min(2, "Trustee's name is required."),
  parentage: z.string().min(3, "Parentage is required (e.g., S/o, W/o, D/o)."),
  address: z.string().min(10, "Address is required."),
  occupation: z.string().min(2, "Occupation is required."),
});

const formSchema = z.object({
  trustName: z.string().min(3, "Trust name is required."),
  trustAddress: z.string().min(10, "Registered address is required."),
  deedDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  
  settlorName: z.string().min(3, "Settlor's name is required."),
  settlorParentage: z.string().min(3, "Parentage is required."),
  settlorAddress: z.string().min(10, "Settlor's address is required."),
  initialContribution: z.coerce.number().positive("Initial contribution must be a positive number."),
  
  trustees: z.array(trusteeSchema).min(1, "At least one trustee is required."),
  
  aimsAndObjects: z.string().min(20, "Please provide a detailed description of the trust's aims."),
});

type FormData = z.infer<typeof formSchema>;

export default function TrustDeedPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trustName: "",
      trustAddress: "",
      deedDate: new Date().toISOString().split("T")[0],
      settlorName: "",
      settlorParentage: "",
      settlorAddress: "",
      initialContribution: 1001,
      trustees: [{ name: "", parentage: "", address: "", occupation: "" }],
      aimsAndObjects: "To promote education for underprivileged children.\nTo provide medical relief to the poor and needy.\nTo work for environmental protection and awareness.",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "trustees",
  });
  
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

  const processStep = async () => {
    let fieldsToValidate: (keyof FormData | `trustees.${number}.${keyof z.infer<typeof trusteeSchema>}` | "trustees")[] = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["trustName", "trustAddress", "deedDate", "aimsAndObjects"];
        break;
      case 2:
        fieldsToValidate = ["settlorName", "settlorParentage", "settlorAddress", "initialContribution"];
        break;
      case 3:
        fieldsToValidate = ["trustees"];
        if (form.getValues("trustees").length < 1) {
          form.setError("trustees", { type: "manual", message: "At least one trustee is required." });
          return;
        }
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
      if (step < 4) {
        toast({ title: `Step ${step} Saved`, description: `Proceeding to the next step.` });
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
            <CardHeader><CardTitle>Step 1: Trust Details</CardTitle><CardDescription>Enter the name, address, and objectives of the trust.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="trustName" render={({ field }) => ( <FormItem><FormLabel>Name of the Trust</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="trustAddress" render={({ field }) => ( <FormItem><FormLabel>Registered Office Address of the Trust</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="deedDate" render={({ field }) => ( <FormItem><FormLabel>Date of Deed Execution</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="aimsAndObjects" render={({ field }) => ( <FormItem><FormLabel>Aims and Objects of the Trust</FormLabel><FormControl><Textarea className="min-h-32" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Settlor Details</CardTitle><CardDescription>Enter the details of the person creating the trust and their initial contribution.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="settlorName" render={({ field }) => ( <FormItem><FormLabel>Full Name of Settlor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="settlorParentage" render={({ field }) => ( <FormItem><FormLabel>Parentage (S/o, W/o, D/o)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="settlorAddress" render={({ field }) => ( <FormItem><FormLabel>Residential Address of Settlor</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="initialContribution" render={({ field }) => ( <FormItem><FormLabel>Initial Contribution to Trust (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Trustee Details</CardTitle><CardDescription>Add details for each trustee who will manage the trust.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h3 className="font-medium">Trustee {index + 1}</h3>
                  {fields.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name={`trustees.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name={`trustees.${index}.parentage`} render={({ field }) => ( <FormItem><FormLabel>S/o, W/o, D/o</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                   <FormField control={form.control} name={`trustees.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                   <FormField control={form.control} name={`trustees.${index}.occupation`} render={({ field }) => ( <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", parentage: "", address: "", occupation: "" })}><PlusCircle className="mr-2"/> Add Trustee</Button>
              {form.formState.errors.trustees?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.trustees.root.message}</p>}
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Document <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 4:
        const formData = form.getValues();
        const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const deedDate = new Date(formData.deedDate).toLocaleDateString('en-GB', dateOptions);

        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated Trust Deed.</CardDescription></CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h2 className="text-center font-bold">TRUST DEED</h2>
                    
                    <p>This DEED OF TRUST executed on this <strong>{deedDate}</strong>,</p>

                    <p className="font-bold">BY:</p>
                    <p><strong>{formData.settlorName}</strong>, {formData.settlorParentage}, resident of {formData.settlorAddress}. (Hereinafter referred to as "THE SETTLOR / AUTHOR OF THE TRUST").</p>

                    <p className="font-bold">IN FAVOUR OF:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        {formData.trustees.map((t, i) => (
                           <li key={i}>
                               <strong>{t.name}</strong>, {t.parentage}, R/o {t.address}, Occupation: {t.occupation}.
                           </li>
                        ))}
                    </ol>
                     <p>(Hereinafter collectively called "THE TRUSTEES" which expression unless repugnant to the context shall mean and include the Trustee/s for the time being, their successors and assigns) of the OTHER PART.</p>
                    
                    <p>WHEREAS the SETTLOR is desirous of settling a Public Charitable Trust for the benefit of the general public for charitable purposes.</p>
                    <p>AND WHEREAS the Settlor has contributed a sum of <strong>₹{formData.initialContribution.toLocaleString('en-IN')}</strong>/- (Rupees {numberToWords(formData.initialContribution)} only) as the initial corpus of the Trust.</p>
                    
                    <h4 className="font-bold mt-4">NOW THIS DEED WITNESSETH AS FOLLOWS:</h4>
                    
                    <ol className="list-decimal list-inside space-y-3">
                        <li><strong>NAME OF THE TRUST:</strong> The name of the Trust shall be "<strong>{formData.trustName}</strong>".</li>
                        <li><strong>REGISTERED OFFICE:</strong> The registered office of the Trust shall be at <strong>{formData.trustAddress}</strong>.</li>
                        <li><strong>AIMS AND OBJECTS:</strong> The aims and objects of the Trust are as follows:
                           <ul className="list-[lower-alpha] list-inside pl-6">
                                {formData.aimsAndObjects.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                                <li>To accept donations, grants, and contributions from any person or entity for the furtherance of the objects of the Trust.</li>
                           </ul>
                        </li>
                        <li><strong>BENEFICIARIES:</strong> The Trust is established for the benefit of the general public without any discrimination of caste, creed, religion, or sex.</li>
                        <li><strong>TRUSTEES:</strong> The total number of trustees shall not be less than 2 and not more than 7. The board of trustees shall be responsible for the management and administration of the Trust. The first trustees shall be the persons named as Trustees in this deed.</li>
                        <li><strong>POWERS OF THE TRUSTEES:</strong> The Trustees shall have the power to invest the funds, acquire or dispose of property, appoint staff, open bank accounts, and do all such acts as are necessary for the attainment of the Trust's objects.</li>
                        <li><strong>MEETINGS:</strong> The Board of Trustees shall meet at least twice a year to transact business. The quorum for the meeting shall be one-third of the total number of trustees.</li>
                        <li><strong>ACCOUNTS:</strong> The Trustees shall maintain proper books of account of all assets, liabilities, income, and expenditure of the Trust and shall get the same audited by a Chartered Accountant annually.</li>
                        <li><strong>IRREVOCABLE:</strong> This Trust is irrevocable.</li>
                        <li><strong>APPLICATION OF THE INDIAN TRUSTS ACT:</strong> The provisions of the Indian Trusts Act, 1882, shall apply to all matters not otherwise specifically provided for in this Deed.</li>
                    </ol>

                    <p className="mt-8">IN WITNESS WHEREOF, the Settlor and the Trustees have set their hands to this Deed on the date first above written.</p>
                    
                    <div className="mt-16">
                        <p className="mb-12">_________________________</p>
                        <p><strong>({formData.settlorName})</strong></p>
                        <p>SETTLOR</p>
                    </div>

                    <div className="mt-16">
                        <p className="font-bold">WITNESSES:</p>
                        <ol className="list-decimal list-inside mt-8 space-y-8">
                            <li>
                                <p>Name: _________________________</p>
                                <p>Address: _______________________</p>
                                <p>Signature: ______________________</p>
                            </li>
                            <li>
                                <p>Name: _________________________</p>
                                <p>Address: _______________________</p>
                                <p>Signature: ______________________</p>
                            </li>
                        </ol>
                    </div>
                     <div className="mt-16 text-right">
                        <p className="font-bold">TRUSTEES:</p>
                         {formData.trustees.map((t, i) => (
                            <div key={i} className="mt-12">
                                <p>_________________________</p>
                                <p><strong>({t.name})</strong></p>
                            </div>
                        ))}
                    </div>

                </CardContent>
                <CardFooter className="justify-between mt-6"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={() => toast({title: "Download Started"})}><FileDown className="mr-2"/> Download Deed</Button></CardFooter>
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
        <h1 className="text-3xl font-bold">Trust Deed Generator</h1>
        <p className="text-muted-foreground">Follow the steps to create a deed for a charitable or private trust.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => processStep())} className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}

    