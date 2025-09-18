
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

const memberSchema = z.object({
  name: z.string().min(2, "Member's name is required."),
  address: z.string().min(10, "Address is required."),
  occupation: z.string().min(2, "Occupation is required."),
  designation: z.string().min(2, "Designation is required (e.g., President, Member)."),
});

const formSchema = z.object({
  societyName: z.string().min(3, "Society name is required."),
  societyAddress: z.string().min(10, "Registered address is required."),
  areaOfOperation: z.string().min(3, "Area of operation is required."),
  aimsAndObjects: z.string().min(20, "Please provide a detailed description of the society's aims."),
  
  members: z.array(memberSchema).min(7, "A minimum of 7 members are required for registration."),
  
  membershipFee: z.coerce.number().min(0).default(500),
  membershipPeriod: z.enum(["monthly", "annually", "lifetime"]).default("annually"),

  quorum: z.string().default("2/3rd of the total members of the governing body."),
  governingBodyTerm: z.coerce.number().positive().default(3),
});

type FormData = z.infer<typeof formSchema>;

export default function SocietyRegistrationDeedPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      societyName: "",
      societyAddress: "",
      areaOfOperation: "the State of [Your State]",
      aimsAndObjects: "To promote education and literacy.\nTo organize health and environmental awareness camps.\nTo work for the social and economic upliftment of the underprivileged.",
      members: Array(7).fill({ name: "", address: "", occupation: "", designation: "Member" }),
      membershipFee: 500,
      membershipPeriod: "annually",
      quorum: "2/3rd of the total members of the governing body",
      governingBodyTerm: 3,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  const processStep = async () => {
    let fieldsToValidate: (keyof FormData | `members.${number}.${keyof z.infer<typeof memberSchema>}` | "members")[] = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["societyName", "societyAddress", "areaOfOperation"];
        break;
      case 2:
        fieldsToValidate = ["aimsAndObjects"];
        break;
      case 3:
        fieldsToValidate = ["members"];
        break;
      case 4:
        fieldsToValidate = ["membershipFee", "membershipPeriod", "quorum", "governingBodyTerm"];
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
      if (step < 5) {
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
            <CardHeader><CardTitle>Step 1: Society Details</CardTitle><CardDescription>Enter the name, address, and operational area of the society.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="societyName" render={({ field }) => ( <FormItem><FormLabel>Name of the Society</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="societyAddress" render={({ field }) => ( <FormItem><FormLabel>Registered Office Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="areaOfOperation" render={({ field }) => ( <FormItem><FormLabel>Area of Operation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Aims & Objects</CardTitle><CardDescription>Describe the main objectives for which the society is being formed.</CardDescription></CardHeader>
            <CardContent>
              <FormField control={form.control} name="aimsAndObjects" render={({ field }) => ( <FormItem><FormLabel>Aims and Objects of the Society</FormLabel><FormControl><Textarea className="min-h-48" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Founding Members</CardTitle><CardDescription>Enter details of the initial governing body. A minimum of 7 members are required.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <h3 className="font-medium">Member {index + 1}</h3>
                  {fields.length > 7 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name={`members.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name={`members.${index}.occupation`} render={({ field }) => ( <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                   <FormField control={form.control} name={`members.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  <FormField control={form.control} name={`members.${index}.designation`} render={({ field }) => ( <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="President, Secretary, Treasurer, Member..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", address: "", occupation: "", designation: "Member" })}><PlusCircle className="mr-2"/> Add Member</Button>
              {form.formState.errors.members?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.members.root.message}</p>}
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader><CardTitle>Step 4: Governance Rules</CardTitle><CardDescription>Define rules for membership, meetings, and the governing body.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="membershipFee" render={({ field }) => ( <FormItem><FormLabel>Membership Fee (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="membershipPeriod" render={({ field }) => ( <FormItem><FormLabel>Fee Period</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
              </div>
               <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="governingBodyTerm" render={({ field }) => ( <FormItem><FormLabel>Governing Body Term (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="quorum" render={({ field }) => ( <FormItem><FormLabel>Quorum for Meetings</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
              </div>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Preview Document <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 5:
        const formData = form.getValues();
        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated Memorandum of Association and Bye-Laws.</CardDescription></CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h2 className="text-center font-bold">MEMORANDUM OF ASSOCIATION OF {formData.societyName.toUpperCase()}</h2>
                    <ol className="list-decimal list-inside space-y-2 font-semibold">
                      <li>Name of the Society: {formData.societyName}</li>
                      <li>Registered Office: {formData.societyAddress}</li>
                      <li>Area of Operation: {formData.areaOfOperation}</li>
                      <li>Aims and Objects:
                        <ul className="list-disc list-inside pl-6 font-normal">
                          {formData.aimsAndObjects.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                        </ul>
                      </li>
                      <li>Governing Body: The names, addresses, occupations and designations of the present members of the governing body to whom the management of the society is entrusted are as follows:
                        <table className="w-full my-2 border-collapse border border-black">
                          <thead><tr className="bg-muted/50"><th className="border border-black p-1">S.No.</th><th className="border border-black p-1">Name</th><th className="border border-black p-1">Address</th><th className="border border-black p-1">Occupation</th><th className="border border-black p-1">Designation</th></tr></thead>
                          <tbody>{formData.members.map((m, i) => <tr key={i}><td className="border border-black p-1">{i+1}</td><td className="border border-black p-1">{m.name}</td><td className="border border-black p-1">{m.address}</td><td className="border border-black p-1">{m.occupation}</td><td className="border border-black p-1">{m.designation}</td></tr>)}</tbody>
                        </table>
                      </li>
                      <li>We, the undersigned, are desirous of forming a society under the Societies Registration Act and have signed our names to this memorandum.</li>
                    </ol>
                    <div className="mt-8">
                       <table className="w-full border-collapse border border-black">
                          <thead><tr className="bg-muted/50"><th className="border border-black p-1">S.No.</th><th className="border border-black p-1">Name of Member</th><th className="border border-black p-1">Address</th><th className="border border-black p-1">Signature</th></tr></thead>
                          <tbody>{formData.members.map((m, i) => <tr key={i}><td className="border border-black p-1">{i+1}</td><td className="border border-black p-1">{m.name}</td><td className="border border-black p-1">{m.address}</td><td className="border border-black h-12"></td></tr>)}</tbody>
                        </table>
                    </div>

                    <h2 className="text-center font-bold break-before-page">RULES AND REGULATIONS (BYE-LAWS)</h2>
                    <ol className="list-decimal list-inside space-y-3">
                      <li><strong>Membership:</strong> Any person who agrees with the aims and objects of the society can become a member by paying a {formData.membershipPeriod} fee of ₹{formData.membershipFee}.</li>
                      <li><strong>General Body:</strong> All members of the society will constitute the General Body.</li>
                      <li><strong>Governing Body:</strong> The affairs of the society shall be managed by a Governing Body consisting of the office bearers and executive members. The term of the Governing Body shall be {formData.governingBodyTerm} years.</li>
                      <li><strong>Meetings:</strong> A General Body meeting shall be held at least once a year. The quorum for any meeting shall be {formData.quorum}.</li>
                      <li><strong>Bank Account:</strong> The society shall maintain a bank account which shall be operated by the President and Treasurer jointly.</li>
                      <li><strong>Audit:</strong> The accounts of the society shall be audited annually by a qualified auditor.</li>
                      <li><strong>Dissolution:</strong> If upon dissolution of the society there remains any property after satisfaction of all debts, the same shall not be paid to the members but shall be given to some other society with similar objects, as determined by the members.</li>
                    </ol>

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
        <h1 className="text-3xl font-bold">Society Registration Deed Generator</h1>
        <p className="text-muted-foreground">Follow the steps to create the Memorandum of Association and Bye-Laws for your society.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => processStep())} className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}

    