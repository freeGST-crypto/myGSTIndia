
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ArrowLeft, FileSignature } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  remitterName: z.string().min(3, "Remitter's name is required."),
  remitterPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  remitteeName: z.string().min(3, "Remittee's name is required."),
  remitteeCountry: z.string().min(2, "Country is required."),
  remittanceAmount: z.coerce.number().positive("Amount must be positive."),
  remittanceCurrency: z.string().min(3, "Currency code is required (e.g., USD, EUR)."),
  remittanceDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  natureOfRemittance: z.string().min(5, "Nature of remittance is required."),
  taxability: z.string().min(10, "Taxability analysis is required."),
  dtaaClause: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ForeignRemittancePage() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      remitterName: "",
      remitterPan: "",
      remitteeName: "",
      remitteeCountry: "",
      remittanceAmount: 10000,
      remittanceCurrency: "USD",
      remittanceDate: new Date().toISOString().split("T")[0],
      natureOfRemittance: "Technical Consultancy Services",
      taxability: "The remittance is in the nature of 'Fees for Technical Services' under Section 9(1)(vii) of the Income Tax Act, 1961 and is taxable in India.",
      dtaaClause: "As per Article 12 of the India-USA DTAA, the tax is to be withheld at the rate of 15%.",
    },
  });

  const handleGenerateDraft = () => {
    toast({
        title: "Form 15CB Draft Generated",
        description: "The draft has been sent to the admin panel for certification.",
    });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/ca-certificates" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Certificate Menu
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Form 15CB Preparation Utility</h1>
        <p className="text-muted-foreground">Generate a draft Form 15CB for remittances to a non-resident.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Remittance Details</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="remitterName" render={({ field }) => (<FormItem><FormLabel>Remitter's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="remitterPan" render={({ field }) => (<FormItem><FormLabel>Remitter's PAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="remitteeName" render={({ field }) => (<FormItem><FormLabel>Remittee's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="remitteeCountry" render={({ field }) => (<FormItem><FormLabel>Remittee's Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     </div>
                     <div className="grid md:grid-cols-3 gap-4">
                         <FormField control={form.control} name="remittanceAmount" render={({ field }) => (<FormItem><FormLabel>Amount of Remittance</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                         <FormField control={form.control} name="remittanceCurrency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                         <FormField control={form.control} name="remittanceDate" render={({ field }) => (<FormItem><FormLabel>Date of Remittance</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     </div>
                     <FormField control={form.control} name="natureOfRemittance" render={({ field }) => (<FormItem><FormLabel>Nature of Remittance</FormLabel><FormControl><Input placeholder="e.g., Software License Fee" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Taxability Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="taxability" render={({ field }) => (<FormItem><FormLabel>Taxability under Income Tax Act</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="dtaaClause" render={({ field }) => (<FormItem><FormLabel>Applicable DTAA Clause & Rate</FormLabel><FormControl><Textarea className="min-h-24" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Generate & Certify</CardTitle>
                    <CardDescription>This will generate a draft Form 15CB and send it to the admin panel for review and final signature.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button type="button" onClick={handleGenerateDraft}>
                       <FileSignature className="mr-2" /> Generate Draft & Request Certification
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
    </div>
  );
}
