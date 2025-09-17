
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUp, GitCompareArrows, Loader2, Wand2, ArrowRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { reconcileItcAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

// Helper to convert file to Data URI
const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const itcSchema = z.object({
    gstr2b: z.custom<File>(val => val instanceof File, "GSTR-2B file is required."),
    // We are simulating purchase bills being fetched from the DB in the action
});

export default function ReconciliationPage() {
    const { toast } = useToast();
    const [itcResult, setItcResult] = useState<string | null>(null);
    const [isItcLoading, setIsItcLoading] = useState(false);

    const itcForm = useForm<z.infer<typeof itcSchema>>({
        resolver: zodResolver(itcSchema),
    });

    async function onItcSubmit(values: z.infer<typeof itcSchema>) {
        setIsItcLoading(true);
        setItcResult(null);
        try {
            const gstr2bDataUri = await fileToDataUri(values.gstr2b);
            const result = await reconcileItcAction({ gstr2bDataUri, purchaseBills: "" }); // purchaseBills is handled server-side
            if (result?.reconciliationResults) {
                setItcResult(result.reconciliationResults);
                 toast({ title: "ITC Reconciliation Complete" });
            } else {
                toast({ variant: 'destructive', title: 'Reconciliation Failed', description: 'Could not get ITC reconciliation results.' });
            }
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'An Error Occurred', description: error.message || 'An unexpected error occurred during ITC reconciliation.' });
        } finally {
            setIsItcLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
                    <Wand2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">AI-Powered Reconciliation</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    Leverage AI to compare documents, identify discrepancies, and ensure compliance. Upload your files below to get started. Note: For demo purposes, purchase bills are simulated.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileUp className="text-primary"/> AI-Powered ITC Reconciliation</CardTitle>
                        <CardDescription>Upload your GSTR-2B CSV. The AI will compare it against your existing purchase bills to identify discrepancies.</CardDescription>
                    </CardHeader>
                    <Form {...itcForm}>
                        <form onSubmit={itcForm.handleSubmit(onItcSubmit)}>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={itcForm.control}
                                    name="gstr2b"
                                    render={({ field: { onChange, value, ...rest } }) => (
                                        <FormItem>
                                            <FormLabel>GSTR-2B (.csv)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="file" 
                                                    accept=".csv"
                                                    onChange={(e) => onChange(e.target.files?.[0])}
                                                    {...rest}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isItcLoading}>
                                    {isItcLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                                    Reconcile ITC
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                    {itcResult && (
                        <CardContent>
                             <Alert>
                                <Wand2 className="h-4 w-4" />
                                <AlertTitle>ITC Reconciliation Report</AlertTitle>
                                <AlertDescription className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                                    <pre><code>{itcResult}</code></pre>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    )}
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GitCompareArrows className="text-primary"/> GSTR-1 vs GSTR-3B Comparison</CardTitle>
                        <CardDescription>Compare GSTR-1 and GSTR-3B filings to find variances and get AI-driven suggestions for resolution.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/reconciliation/gstr-comparison" passHref>
                           <Button>
                                <span>Launch GSTR Comparison Tool</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Next Steps
                    </CardTitle>
                    <CardDescription>
                        Explore other features of GSTEase.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Now that you've seen how AI can help with reconciliation, why not explore how it can assist with HSN code lookups for your products and services?
                    </p>
                    <Link href="/items" passHref>
                        <Button variant="outline">
                            <span>Go to Items</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
