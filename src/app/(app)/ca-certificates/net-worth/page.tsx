
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ArrowLeft, FileSignature, Trash2, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const assetSchema = z.object({
  description: z.string().min(3, "Description is required."),
  value: z.coerce.number().positive("Value must be a positive number."),
});

const liabilitySchema = z.object({
  description: z.string().min(3, "Description is required."),
  value: z.coerce.number().positive("Value must be a positive number."),
});

const formSchema = z.object({
  clientName: z.string().min(3, "Client's name is required."),
  clientPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  asOnDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  assets: z.array(assetSchema),
  liabilities: z.array(liabilitySchema),
});

type FormData = z.infer<typeof formSchema>;

export default function NetWorthCertificatePage() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPan: "",
      asOnDate: new Date().toISOString().split("T")[0],
      assets: [{ description: "Immovable Property - Residential Flat", value: 5000000 }],
      liabilities: [{ description: "Housing Loan from HDFC Bank", value: 2000000 }],
    },
  });

  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({ control: form.control, name: "assets" });
  const { fields: liabilityFields, append: appendLiability, remove: removeLiability } = useFieldArray({ control: form.control, name: "liabilities" });

  const totalAssets = form.watch("assets").reduce((acc, asset) => acc + (asset.value || 0), 0);
  const totalLiabilities = form.watch("liabilities").reduce((acc, liability) => acc + (liability.value || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const handleGenerateDraft = () => {
    toast({
        title: "Draft Certificate Generated",
        description: "The draft has been sent to the admin panel for certification.",
    });
    // In a real app, this would trigger an action to save the draft and create a request.
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/ca-certificates" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Certificate Menu
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Net Worth Certificate</h1>
        <p className="text-muted-foreground">Generate a draft certificate of net worth for an individual or HUF.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Client and Date Information</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel>Client's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <div className="grid md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="clientPan" render={({ field }) => (<FormItem><FormLabel>Client's PAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                         <FormField control={form.control} name="asOnDate" render={({ field }) => (<FormItem><FormLabel>Net Worth as on Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                 <Card>
                    <CardHeader>
                        <CardTitle>Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assetFields.map((field, index) => (
                             <div key={field.id} className="flex gap-2 items-end">
                                <FormField control={form.control} name={`assets.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`assets.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeAsset(index)}><Trash2 className="size-4 text-destructive"/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendAsset({ description: "", value: 0 })}><PlusCircle className="mr-2"/> Add Asset</Button>
                    </CardContent>
                    <CardFooter className="font-bold text-lg flex justify-between">
                        <span>Total Assets</span>
                        <span>₹{totalAssets.toLocaleString('en-IN')}</span>
                    </CardFooter>
                 </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {liabilityFields.map((field, index) => (
                             <div key={field.id} className="flex gap-2 items-end">
                                <FormField control={form.control} name={`liabilities.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`liabilities.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeLiability(index)}><Trash2 className="size-4 text-destructive"/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendLiability({ description: "", value: 0 })}><PlusCircle className="mr-2"/> Add Liability</Button>
                    </CardContent>
                    <CardFooter className="font-bold text-lg flex justify-between">
                        <span>Total Liabilities</span>
                        <span>₹{totalLiabilities.toLocaleString('en-IN')}</span>
                    </CardFooter>
                 </Card>
            </div>
            
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-center">Calculated Net Worth</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-4xl font-bold">₹{netWorth.toLocaleString('en-IN')}</p>
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
