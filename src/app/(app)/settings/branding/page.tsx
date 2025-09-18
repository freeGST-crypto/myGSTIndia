
"use client";

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Upload, Building, FileSignature, Trash2, UserPlus, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { analyzeLogoAction, generateTermsAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const professionalSchema = z.object({
  name: z.string().min(2, "Name is required."),
  role: z.enum(["CA", "Auditor", "Consultant"]),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
});

const formSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: "Invalid GSTIN format." }).optional().or(z.literal("")),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Invalid PAN format." }).optional().or(z.literal("")),
  addressLine1: z.string().min(5, { message: "Address line 1 is required." }),
  addressLine2: z.string().optional(),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, { message: "Invalid pincode." }),
  invoicePrefix: z.string().optional(),
  invoiceNextNumber: z.coerce.number().int().positive({ message: "Must be a positive number."}).optional(),
  defaultPaymentTerms: z.string().optional(),
  terms: z.string().optional(),
  professionals: z.array(professionalSchema).optional(),
});

export default function BrandingPage() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [isGeneratingTerms, setIsGeneratingTerms] = useState(false);
    const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);
    const [logoAnalysis, setLogoAnalysis] = useState<string | null>(null);
    const { toast } = useToast();

    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            gstin: "",
            pan: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            pincode: "",
            invoicePrefix: "INV-",
            invoiceNextNumber: 1,
            defaultPaymentTerms: "net30",
            terms: "",
            professionals: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "professionals",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void, setFile: (file: File) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateTerms = async () => {
        const companyName = form.getValues("companyName");
        if (!companyName) {
            form.setError("companyName", { type: "manual", message: "Company name is required to generate terms." });
            return;
        }
        setIsGeneratingTerms(true);
        try {
            const result = await generateTermsAction({ companyName });
            if(result?.terms) {
                form.setValue("terms", result.terms);
                toast({ title: "Terms & Conditions Generated", description: "AI-powered T&C have been added to the form." });
            } else {
                 toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate terms." });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while generating terms." });
        } finally {
            setIsGeneratingTerms(false);
        }
    }

    const handleAnalyzeLogo = async () => {
        if (!logoFile) {
            toast({ variant: "destructive", title: "No Logo", description: "Please upload a logo to analyze." });
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
                } else {
                    toast({ variant: "destructive", title: "Analysis Failed", description: "Could not analyze the logo." });
                }
            }
        } catch (error) {
             console.error(error);
             toast({ variant: "destructive", title: "Error", description: "An error occurred during logo analysis." });
        } finally {
            setIsAnalyzingLogo(false);
        }
    }

    const watchInvoicePrefix = form.watch("invoicePrefix", "INV-");
    const watchInvoiceNextNumber = form.watch("invoiceNextNumber", 1);
    const nextInvoiceNumberFormatted = `${watchInvoicePrefix}${watchInvoiceNextNumber}`;

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({ title: "Settings Saved!", description: "Your branding information has been updated." });
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                    <Building className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Company Branding</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    Manage your company's branding assets and information. This will be used on invoices, reports, and other documents.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                            <CardDescription>Update your company's core information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="companyName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="gstin" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GSTIN</FormLabel>
                                        <FormControl><Input placeholder="22AAAAA0000A1Z5" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="pan" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PAN</FormLabel>
                                        <FormControl><Input placeholder="ABCDE1234F" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="addressLine1" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Line 1</FormLabel>
                                    <FormControl><Input placeholder="123 Business Rd, Industrial Area" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="addressLine2" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                                    <FormControl><Input placeholder="Suite 456, Near Landmark" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl><Input placeholder="Commerce City" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="state" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="pincode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pincode</FormLabel>
                                        <FormControl><Input placeholder="400001" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Branding Assets</CardTitle>
                            <CardDescription>Upload your company logo and a default signature for documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <FormLabel>Company Logo</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-md border flex items-center justify-center bg-muted/50">
                                        {logoPreview ? <Image src={logoPreview} alt="Logo Preview" fill className="object-contain" /> : <Upload className="size-8 text-muted-foreground" />}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                                        <Upload className="mr-2" /> Upload Logo
                                    </Button>
                                    <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, setLogoPreview, setLogoFile)} className="hidden" accept="image/*" />
                                </div>
                                <FormDescription>Recommended: .png with transparent background, 200x200px.</FormDescription>
                                {logoFile && (
                                    <div className='pt-4'>
                                        <Button type="button" onClick={handleAnalyzeLogo} disabled={isAnalyzingLogo}>
                                            {isAnalyzingLogo ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                                            Analyze Logo with AI
                                        </Button>
                                    </div>
                                )}
                                {logoAnalysis && (
                                     <Alert>
                                        <Wand2 className="h-4 w-4" />
                                        <AlertTitle>Logo Analysis Result</AlertTitle>
                                        <AlertDescription className="prose prose-sm dark:prose-invert">
                                            <p>{logoAnalysis}</p>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                             <div className="space-y-4">
                                <FormLabel>Digital Signature</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-md border flex items-center justify-center bg-muted/50">
                                        {signaturePreview ? <Image src={signaturePreview} alt="Signature Preview" fill className="object-contain" /> : <FileSignature className="size-8 text-muted-foreground" />}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => signatureInputRef.current?.click()}>
                                        <Upload className="mr-2" /> Upload Signature
                                    </Button>
                                    <input type="file" ref={signatureInputRef} onChange={(e) => handleFileChange(e, setSignaturePreview, setSignatureFile)} className="hidden" accept="image/*" />
                                </div>
                                <FormDescription>Upload an image of your authorized signatory's signature.</FormDescription>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice & Payment Settings</CardTitle>
                            <CardDescription>Set default numbering, payment terms, and conditions for your invoices.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-4">Invoice Numbering</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="invoicePrefix"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Invoice Prefix</FormLabel>
                                                <FormControl><Input placeholder="INV-" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="invoiceNextNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Next Number</FormLabel>
                                                <FormControl><Input type="number" min="1" placeholder="1" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Alert variant="default" className="mt-4">
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Next Invoice Number</AlertTitle>
                                    <AlertDescription>
                                        The next invoice you create will be numbered: <span className="font-semibold font-mono">{nextInvoiceNumberFormatted}</span>
                                    </AlertDescription>
                                </Alert>
                            </div>
                             <Separator/>
                            <FormField
                                control={form.control}
                                name="defaultPaymentTerms"
                                render={({ field }) => (
                                    <FormItem className="max-w-xs">
                                    <FormLabel>Default Payment Terms</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a due period" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="net15">Net 15 (15 days)</SelectItem>
                                            <SelectItem value="net30">Net 30 (30 days)</SelectItem>
                                            <SelectItem value="net60">Net 60 (60 days)</SelectItem>
                                            <SelectItem value="dueOnReceipt">Due on receipt</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        This will be the default due date for new invoices.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Separator/>
                             <FormField control={form.control} name="terms" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Terms & Conditions</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., 'Payment is due within 30 days...'" className="resize-y min-h-[150px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4">
                            <Button type="button" onClick={handleGenerateTerms} disabled={isGeneratingTerms}>
                                {isGeneratingTerms ? <Loader2 className="animate-spin mr-2"/> : <Wand2 className="mr-2" />}
                                Generate T&C with AI
                            </Button>
                            <FormDescription>
                                Our AI will generate standard terms and conditions based on your company name. You can edit them after generation.
                            </FormDescription>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Associated Professionals</CardTitle>
                            <CardDescription>Manage contacts for your CA, Auditor, or other consultants.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                     <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`professionals.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g. Anand Sharma" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`professionals.${index}.role`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Role</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="CA">Chartered Accountant (CA)</SelectItem>
                                                            <SelectItem value="Auditor">Auditor</SelectItem>
                                                            <SelectItem value="Consultant">GST Consultant</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                     <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`professionals.${index}.email`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl><Input type="email" placeholder="anand.sharma@example.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name={`professionals.${index}.phone`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone (Optional)</FormLabel>
                                                    <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                             <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ name: "", role: "CA", email: "" })}
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Professional
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

    