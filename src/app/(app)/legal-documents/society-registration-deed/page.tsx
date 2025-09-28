
"use client";

import { useState, useEffect } from "react";
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
  parentage: z.string().min(3, "Parentage is required (e.g., S/o, W/o, D/o)."),
  age: z.coerce.number().positive("Age must be a positive number.").default(30),
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
      members: Array(7).fill({ name: "", parentage: "", age: 30, address: "", occupation: "", designation: "Member" }),
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
        if (form.getValues("members").length < 7) {
            form.setError("members", { type: "manual", message: "A society requires at least 7 members." });
            return;
        }
        break;
      case 4:
        fieldsToValidate = ["membershipFee", "membershipPeriod", "quorum", "governingBodyTerm"];
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
                     <FormField control={form.control} name={`members.${index}.parentage`} render={({ field }) => ( <FormItem><FormLabel>S/o, W/o, D/o</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                   <FormField control={form.control} name={`members.${index}.address`} render={({ field }) => ( <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField control={form.control} name={`members.${index}.age`} render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name={`members.${index}.occupation`} render={({ field }) => ( <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name={`members.${index}.designation`} render={({ field }) => ( <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="President, Secretary..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ name: "", parentage: "", age: 30, address: "", occupation: "", designation: "Member" })}><PlusCircle className="mr-2"/> Add Member</Button>
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
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
        const formattedDate = new Date().toLocaleDateString('en-GB', dateOptions);

        return (
             <Card>
                <CardHeader><CardTitle>Final Step: Preview & Download</CardTitle><CardDescription>Review the generated Memorandum of Association and Bye-Laws.</CardDescription></CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-6 bg-muted/20 leading-relaxed">
                    <h3 className="font-bold text-center">DOCUMENT NO. I</h3>
                    <br/>
                    <p><strong>1. NAME OF THE SOCIETY:</strong> {formData.societyName}</p>
                    <p><strong>2. LOCATION OF THE OFFICE:</strong> {formData.societyAddress}</p>
                    <p><strong>3. AIMS AND OBJECTS:</strong></p>
                    <ul className="list-[lower-alpha] list-inside pl-6">
                        {formData.aimsAndObjects.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                    </ul>
                    <br/>
                    <hr/>
                    <ol className="list-decimal list-inside my-4">
                        <li>“Certified that the Association is formed with no profit motive and commercial activities involved in its working”</li>
                        <li>“Certified that the Office Bearers are not paid from the funds of the Association”.</li>
                        <li>“Certified that the Association would not engage in agitational activities to ventilate grievances”</li>
                        <li>“Certified that the Office Bearers signatures are genuine”.</li>
                    </ol>
                    <hr/>
                    <br/>
                    <h4 className="font-bold text-center">D E C L A R A T I O N</h4>
                    <p>We the undersigned persons in the memo have formed into an association and responsible to run the affairs of the Association and are desirous of getting the Society registered under Public Society.</p>
                    <p className="text-right mt-8">Signature of the President/Secretary.</p>
                    
                    <br/>
                    <table className="w-full my-2 border-collapse border border-black">
                        <thead className="text-center">
                            <tr>
                                <th className="border border-black p-1">Name of the office Bearers & S/O. W/O.D/O</th>
                                <th className="border border-black p-1">Age</th>
                                <th className="border border-black p-1">Designation</th>
                                <th className="border border-black p-1">Residential Address</th>
                                <th className="border border-black p-1">signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.members.map((m, i) => (
                                <tr key={i}>
                                    <td className="border border-black p-1">{m.name}<br/>{m.parentage}</td>
                                    <td className="border border-black p-1">{m.age}</td>
                                    <td className="border border-black p-1">{m.designation}</td>
                                    <td className="border border-black p-1">{m.address}</td>
                                    <td className="border border-black h-12"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <br/>
                    <p><strong>WITNESSES:</strong></p>
                     <table className="w-full my-2 border-collapse border border-black">
                        <thead className="text-center">
                            <tr>
                                <th className="border border-black p-1">Name in Block Letters S/o, W/o, D/o</th>
                                <th className="border border-black p-1">Age</th>
                                <th className="border border-black p-1">Residential Address</th>
                                <th className="border border-black p-1">Signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td className="border border-black h-12"></td><td className="border border-black h-12"></td><td className="border border-black h-12"></td><td className="border border-black h-12"></td></tr>
                             <tr><td className="border border-black h-12"></td><td className="border border-black h-12"></td><td className="border border-black h-12"></td><td className="border border-black h-12"></td></tr>
                        </tbody>
                     </table>
                     <p className="text-right mt-8">Signature of the President / Secretary.</p>

                    <div className="break-before-page"></div>

                    <h3 className="font-bold text-center">DOCUMENT NO. II</h3>
                    <h4 className="font-bold text-center">RULES AND REGULATIONS</h4>

                    <ol className="list-decimal list-inside space-y-3">
                      <li><strong>Name of the Society:</strong> {formData.societyName}</li>
                      <li><strong>Location of the Office:</strong> {formData.societyAddress}</li>
                      <li>
                        <strong>Membership:</strong>
                        <ul className="list-[lower-roman] list-inside pl-6">
                            <li>Any person who agrees with the aims and objects of the society can become a member.</li>
                            <li>Category of Members: General Members.</li>
                            <li>Admission Fee and Subscription: A {formData.membershipPeriod} fee of ₹{formData.membershipFee}.</li>
                        </ul>
                      </li>
                      <li><strong>General Body:</strong>
                          <ul className="list-[lower-roman] list-inside pl-6">
                            <li>Annual General body will meet once in a year.</li>
                            <li>Functions:
                                <ol className="list-[lower-alpha] list-inside pl-4">
                                    <li>To pass the budget for the ensuing year and approve expenditure statement of previous year.</li>
                                    <li>To approve the reports of the activities of the Society.</li>
                                    <li>To elect the Executive Committee.</li>
                                    <li>To appoint an Auditor.</li>
                                </ol>
                            </li>
                         </ul>
                      </li>
                      <li>
                        <strong>Executive Committee (Governing Body):</strong>
                         <ul className="list-[lower-roman] list-inside pl-6">
                            <li>The Executive Committee shall consist of {formData.members.length} members, including a President, General Secretary, Joint Secretary, and Treasurer.</li>
                            <li>The members of the Executive Committee shall be duty bound to attend the meetings and manage the affairs of the society.</li>
                         </ul>
                      </li>
                       <li><strong>Functions of the Executive Committee and Office Bearers:</strong>
                            <ol className="list-[decimal] list-inside pl-4">
                                <li><strong>PRESIDENT:</strong> He presides over all the meeting of the General Body and Executive Committee. He can cast his vote in the case of tie in decision making. He can supervise all branches of the society.</li>
                                <li><strong>VICE-PRESIDENT:</strong> He shall assist the president in discharge his functions. In the absence of the president he will perform the duty of the President as entrusted by the President.</li>
                                <li><strong>SECRETARY:</strong> He is the chief executive Officer of the Society and Custodian of all records to the society and correspondent on behalf of the Society. He has to take on record all minutes of the society and would convene both the Executive Committee and General Body of the Society with the permission of the President. He guides the Treasurer in preparing the Budget and places the expenditure statement before the General Body for its approval.</li>
                                <li><strong>JOINT SECRETARY:</strong> He has to do the work entrusted by the executive Committee. He has to assist the Secretary in discharging his duties. In the absence of the Secretary, he can perform the duties of the Secretary.</li>
                                <li><strong>TREASURER:</strong> He is responsible for all Financial Transactions of the Society. He has to maintain accounts properly along with the vouchers. He has to prepare the accounts of the Society jointly with the Secretary or President.</li>
                                <li><strong>OFFICE BEARERS:</strong> They are the responsible persons to attend to such activities of the Society which the Executive Committee entrusts to them.</li>
                            </ol>
                        </li>
                         <li><strong>QUORUM:</strong> {formData.quorum} for General Body meeting and 1/4 for Executive Committee meeting.</li>
                        <li><strong>FUNDS:</strong> The Funds shall be spent only for the attainment of the objects of the Society and no portion thereof shall be paid or transferred directly or indirectly to any of the members through any means.</li>
                        <li><strong>AMENDMENTS:</strong> No Amendments or alteration shall be made in the purpose of the Association unless it is voted by 2/3 of its members present at a special meeting convened for the purpose and confirmed by 2/3 of the members present at a second special meeting.</li>
                        <li><strong>WINDING UP:</strong> In case the Society has to be wound up, property and funds of the Society that remain after discharging the liabilities, if any, shall be transferred or paid to some other Institutions with similar aims and objects.</li>
                    </ol>
                     <p className="text-right mt-16">Signature of the President / Secretary.</p>

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
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}
