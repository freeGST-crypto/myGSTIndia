
"use client";

import { useState, useRef } from 'react';
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
import { Loader2, Wand2, Upload, Building, FileSignature, Trash2, PlusCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const expertiseSchema = z.object({
  value: z.string().min(2, "Expertise cannot be empty."),
});

const formSchema = z.object({
  firmName: z.string().min(2, { message: "Firm name is required." }),
  about: z.string().min(20, { message: "Please provide a brief description of at least 20 characters." }),
  experience: z.coerce.number().min(0, "Experience must be a positive number."),
  staffCount: z.coerce.number().int().min(1, "Staff count must be at least 1."),
  proCount: z.coerce.number().int().min(1, "Professional count must be at least 1."),
  expertise: z.array(expertiseSchema).max(5, "You can add a maximum of 5 areas of expertise."),
});

export default function ProfessionalProfilePage() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const { toast } = useToast();

    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firmName: "Sharma & Associates",
            about: "A leading CA firm based in Mumbai, specializing in startup consultation, GST compliance, and audit services for over 10 years.",
            experience: 10,
            staffCount: 25,
            proCount: 5,
            expertise: [
                { value: "Startup Advisory" },
                { value: "GST Compliance" },
                { value: "Audit & Assurance" },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "expertise",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({ title: "Profile Updated!", description: "Your professional profile has been saved successfully." });
    }

    return (
        <div className="space-y-8">
             <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to Settings
            </Link>
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                    <Building className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Manage Your Professional Profile</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    This is the information potential clients will see. Keep it updated to showcase your firm's strengths.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Firm Details</CardTitle>
                            <CardDescription>Update your firm's core information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={form.control} name="firmName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Firm Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="about" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>About Your Firm</FormLabel>
                                    <FormControl><Textarea className="min-h-24" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid md:grid-cols-3 gap-4">
                               <FormField control={form.control} name="experience" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Years of Experience</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="staffCount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Staff Count</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                  <FormField control={form.control} name="proCount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No. of Professionals</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Areas of Expertise</CardTitle>
                            <CardDescription>Highlight your key services. You can add up to 5 specializations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2">
                                     <FormField
                                        control={form.control}
                                        name={`expertise.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className={index > 0 ? 'sr-only' : ''}>Specialization</FormLabel>
                                                <FormControl><Input placeholder="e.g., GST Litigation" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fields.length < 5 && append({ value: "" })}
                                disabled={fields.length >= 5}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Expertise
                            </Button>
                            {form.formState.errors.expertise?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.expertise.root.message}</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Branding Assets</CardTitle>
                            <CardDescription>Upload your profile picture and firm logo.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <FormLabel>Your Profile Picture</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-full border flex items-center justify-center bg-muted/50 overflow-hidden">
                                        {signaturePreview ? <Image src={signaturePreview} alt="Signature Preview" fill className="object-cover" /> : <Upload className="size-8 text-muted-foreground" />}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => signatureInputRef.current?.click()}>
                                        <Upload className="mr-2" /> Upload Photo
                                    </Button>
                                    <input type="file" ref={signatureInputRef} onChange={(e) => handleFileChange(e, setSignaturePreview)} className="hidden" accept="image/*" />
                                </div>
                            </div>
                             <div className="space-y-4">
                                <FormLabel>Firm Logo</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-md border flex items-center justify-center bg-muted/50 overflow-hidden">
                                        {logoPreview ? <Image src={logoPreview} alt="Logo Preview" fill className="object-contain p-2" /> : <Upload className="size-8 text-muted-foreground" />}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                                        <Upload className="mr-2" /> Upload Logo
                                    </Button>
                                    <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, setLogoPreview)} className="hidden" accept="image/*" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit">Save Profile</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
