
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ArrowLeft, FileSignature, ArrowRight, Printer } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

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
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

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
  
  const handlePreview = async () => {
    const isValid = await form.trigger();
    if(isValid) {
        setStep(2);
        toast({ title: "Draft Ready", description: "Review the certificate before printing." });
    } else {
        toast({ variant: "destructive", title: "Validation Error", description: "Please fill all required fields."});
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Certificate_${form.getValues("subject")}`,
  });
  
  const handleCertificationRequest = () => {
      toast({
          title: "Request Sent",
          description: "Draft sent to admin for certification."
      });
  }

  const renderContent = () => {
    if (step === 1) {
      return (
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
           <CardFooter>
              <Button type="button" onClick={handlePreview}>
                 <ArrowRight className="mr-2" /> Preview Certificate
              </Button>
          </CardFooter>
        </Card>
      );
    }

    if (step === 2) {
      const formData = form.getValues();
      const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      return (
        <Card>
          <CardHeader>
              <CardTitle>Final Preview</CardTitle>
              <CardDescription>Review the generated certificate. You can print it or send it for certification.</CardDescription>
          </CardHeader>
          <CardContent>
               <div ref={printRef} className="prose dark:prose-invert max-w-none border rounded-lg p-8">
                 <header className="text-center border-b-2 border-primary pb-4 mb-8">
                      <h1 className="text-2xl font-bold text-primary m-0">S. KRANTHI KUMAR & Co.</h1>
                      <p className="text-sm m-0">Chartered Accountants</p>
                      <p className="text-xs m-0">H.No. 2-2-1130/2/A, G-1, Amberpet, Hyderabad-500013</p>
                 </header>
                  <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="font-bold text-sm">To,</p>
                        <p>{formData.clientName}</p>
                        <p>{formData.clientAddress}</p>
                      </div>
                      <div className="text-right">
                          <p className="font-semibold">UDIN: [UDIN GOES HERE]</p>
                          <p className="text-sm">Date: {new Date(formData.certificateDate).toLocaleDateString('en-GB', dateOptions)}</p>
                      </div>
                  </div>
                  <h4 className="font-bold text-center underline my-6">{formData.subject.toUpperCase()}</h4>
                  <p>{formData.certificateBody}</p>
                  <div className="mt-24 text-right">
                      <p className="font-bold">For S. KRANTHI KUMAR & Co.</p>
                      <p>Chartered Accountants</p>
                      <div className="h-20"></div>
                      <p>(S. Kranthi Kumar)</p><p>Proprietor</p><p>Membership No: 224983</p>
                  </div>
              </div>
          </CardContent>
          <CardFooter className="justify-between">
               <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2"/> Back to Edit</Button>
               <div>
                  <Button type="button" onClick={handlePrint}><Printer className="mr-2"/> Print / Save PDF</Button>
                  <Button type="button" className="ml-2" onClick={handleCertificationRequest}>
                      <FileSignature className="mr-2"/> Request Certification
                  </Button>
               </div>
          </CardFooter>
      </Card>
      );
    }
  };

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
          {renderContent()}
        </form>
      </Form>
    </div>
  );
}

    