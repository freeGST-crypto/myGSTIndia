
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  entityName: z.string().min(3, "Entity name is required."),
  entityType: z.enum(["Company", "LLP"]),
  contributorName: z.string().min(3, "Contributor's name is required."),
  contributorType: z.enum(["Director", "Partner"]),
  contributionAmount: z.coerce.number().positive("Amount must be a positive number."),
  contributionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  contributionMode: z.enum(["Cash", "Cheque", "Bank Transfer"]),
  bankDetails: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CapitalContributionCertificatePage() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityName: "",
      entityType: "Company",
      contributorName: "",
      contributorType: "Director",
      contributionAmount: 100000,
      contributionDate: new Date().toISOString().split("T")[0],
      contributionMode: "Bank Transfer",
      bankDetails: "HDFC Bank, A/c No. XXXXXX1234, IFSC: HDFC0001234",
    },
  });

  const handleGenerateDraft = () => {
    toast({
        title: "Draft Certificate Generated",
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
        <h1 className="text-3xl font-bold">Capital Contribution Certificate</h1>
        <p className="text-muted-foreground">Generate a certificate for capital contributed by a director or partner.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Contribution Details</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="entityName" render={({ field }) => (<FormItem><FormLabel>Company / LLP Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="entityType" render={({ field }) => (<FormItem><FormLabel>Entity Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Company">Company</SelectItem><SelectItem value="LLP">LLP</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                     </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="contributorName" render={({ field }) => (<FormItem><FormLabel>Contributor's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="contributorType" render={({ field }) => (<FormItem><FormLabel>Contributor's Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Director">Director</SelectItem><SelectItem value="Partner">Partner</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="contributionAmount" render={({ field }) => (<FormItem><FormLabel>Contribution Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                         <FormField control={form.control} name="contributionDate" render={({ field }) => (<FormItem><FormLabel>Date of Contribution</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     </div>
                      <div className="grid md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="contributionMode" render={({ field }) => (<FormItem><FormLabel>Mode of Contribution</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Bank Transfer">Bank Transfer</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="Cash">Cash</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                         <FormField control={form.control} name="bankDetails" render={({ field }) => (<FormItem><FormLabel>Bank Details (if applicable)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     </div>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Generate & Certify</CardTitle>
                    <CardDescription>This will generate a draft certificate and send it to the admin panel for review and final DSC signature.</CardDescription>
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
