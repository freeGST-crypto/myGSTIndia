
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
  clientName: z.string().min(3, "Client name is required."),
  clientAddress: z.string().min(10, "Client address is required."),
  certificateDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  subject: z.string().min(5, "Subject is required."),
  certificateBody: z.string().min(20, "Certificate body is required."),
});

type FormData = z.infer<typeof formSchema>;

export default function GeneralAttestationPage() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientAddress: "",
      certificateDate: new Date().toISOString().split("T")[0],
      subject: "",
      certificateBody: "This is to certify that based on the records produced before us and to the best of our knowledge and belief... ",
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
        <h1 className="text-3xl font-bold">General Attestation Certificate</h1>
        <p className="text-muted-foreground">Generate a custom certificate for general attestation purposes.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Certificate Details</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel>To (Client Name / Authority)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     <FormField control={form.control} name="clientAddress" render={({ field }) => (<FormItem><FormLabel>Client / Authority Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <div className="grid md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="certificateDate" render={({ field }) => (<FormItem><FormLabel>Date of Certificate</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                         <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject of Certificate</FormLabel><FormControl><Input placeholder="e.g., Certificate of Financial Solvency" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                     <FormField control={form.control} name="certificateBody" render={({ field }) => (<FormItem><FormLabel>Body of the Certificate</FormLabel><FormControl><Textarea className="min-h-48" {...field} /></FormControl><FormMessage /></FormItem>)}/>
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
