
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Save, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { generateTermsAction, analyzeLogoAction } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  companyName: z.string().min(3, "Company name is required."),
  address: z.string().min(10, "A full address is required."),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  logo: z.custom<File | null>(() => true).optional(),
  invoiceTerms: z.string().optional(),
});

export default function BrandingPage() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const { toast } = useToast();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingTerms, setIsGeneratingTerms] = useState(false);
    const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);
    const [logoAnalysis, setLogoAnalysis] = useState<string | null>(null);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "GSTEase Solutions Pvt. Ltd.",
            address: "123 Business Avenue, Commerce City, Maharashtra - 400001",
            gstin: "27ABCDE1234F1Z5",
            pan: "ABCDE1234F",
            invoiceTerms: "1. All payments to be made via cheque or NEFT. 2. Goods once sold will not be taken back. 3. Interest @18% p.a. will be charged on overdue bills.",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("logo", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                setLogoAnalysis(null); // Clear previous analysis
            };
            reader.readAsDataURL(file);
        }
    };
    
    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSaving(true);
        console.log(values);
        // Simulate API call to save branding settings
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Branding Settings Saved!",
                description: "Your company details have been updated.",
            });
        }, 1500);
    }
    
    const handleGenerateTerms = async () => {
        const companyName = form.getValues("companyName");
        if (!companyName) {
            form.setError("companyName", { type: "manual", message: "Company name is required to generate terms." });
            return;
        }
        setIsGeneratingTerms(true);
        try {
            const result = await generateTermsAction({ companyName });
            if (result?.terms) {
                form.setValue("invoiceTerms", result.terms);
                toast({ title: "Terms & Conditions Generated!" });
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to generate terms." });
        } finally {
            setIsGeneratingTerms(false);
        }
    };
    
    const handleAnalyzeLogo = async () => {
        const logoFile = form.getValues("logo");
        if (!logoFile) {
            toast({ variant: "destructive", title: "No Logo", description: "Please upload a logo to analyze."});
            return;
        }
        setIsAnalyzingLogo(true);
        setLogoAnalysis(null);
        try {
             const reader = new FileReader();
             reader.readAsDataURL(logoFile);
             reader.onloadend = async () => {
                const base64data = reader.result as string;
                const result = await analyzeLogoAction({ logoDataUri: base64data });
                if (result?.analysis) {
                    setLogoAnalysis(result.analysis);
                    toast({ title: "Logo Analysis Complete" });
                }
             }
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to analyze logo." });
        } finally {
            setIsAnalyzingLogo(false);
        }
    }


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Company Branding</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    Manage your company details, logo, and other branding assets that appear on invoices and documents.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Company Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="gstin" render={({ field }) => ( <FormItem><FormLabel>GSTIN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="pan" render={({ field }) => ( <FormItem><FormLabel>PAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>
                        </CardContent>
                    </Card>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle>Company Logo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                <div 
                                    className="relative flex flex-col items-center justify-center w-full sm:w-48 h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 shrink-0"
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    {logoPreview ? (
                                        <Image src={logoPreview} alt="Logo Preview" fill className="object-contain p-4 rounded-lg" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            <Upload className="mx-auto h-8 w-8" />
                                            <p className="mt-2 text-sm">Click to upload logo</p>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full space-y-4">
                                    <Button type="button" variant="secondary" onClick={handleAnalyzeLogo} disabled={isAnalyzingLogo || !form.getValues('logo')}>
                                        {isAnalyzingLogo ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 className="mr-2"/>}
                                        Analyze Logo with AI
                                    </Button>
                                    {logoAnalysis && (
                                         <Alert>
                                            <Wand2 className="h-4 w-4" />
                                            <AlertTitle>AI Logo Analysis</AlertTitle>
                                            <AlertDescription>
                                                {logoAnalysis}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>
                             <Input 
                                ref={logoInputRef}
                                type="file" 
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Invoice Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="invoiceTerms"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Terms & Conditions</FormLabel>
                                    <FormControl>
                                    <Textarea
                                        placeholder="Enter your standard terms for invoices..."
                                        className="min-h-24"
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="button" variant="secondary" onClick={handleGenerateTerms} disabled={isGeneratingTerms} className="mt-4">
                                {isGeneratingTerms ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 className="mr-2"/>}
                                Generate with AI
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardFooter className="justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2"/>}
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
