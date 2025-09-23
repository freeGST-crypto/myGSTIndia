
"use client";

import { useState, useContext, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  PlusCircle,
  Save,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AccountingContext } from "@/context/accounting-context";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { Separator } from "@/components/ui/separator";

const rapidInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required."),
  invoiceNumber: z.string().min(1, "Invoice number is required."),
  invoiceDate: z.string().min(1, "Date is required."),
  description: z.string().min(3, "Description is required."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
});

type RapidInvoiceForm = z.infer<typeof rapidInvoiceSchema>;

export default function RapidInvoiceEntryPage() {
  const accountingContext = useContext(AccountingContext);
  const { toast } = useToast();
  const router = useRouter();
  const [user] = useAuthState(auth);
  
  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [customersSnapshot]);

  const form = useForm<RapidInvoiceForm>({
    resolver: zodResolver(rapidInvoiceSchema),
    defaultValues: {
      customerId: "",
      invoiceNumber: "",
      invoiceDate: format(new Date(), "yyyy-MM-dd"),
      description: "Consultancy Services",
      amount: 0,
    },
  });

  const handleSave = useCallback(async (values: RapidInvoiceForm, closeOnSave: boolean) => {
    if (!accountingContext) return;
    const { addJournalVoucher } = accountingContext;

    const selectedCustomer = customers.find(c => c.id === values.customerId);
    if (!selectedCustomer) {
        toast({ variant: "destructive", title: "Customer not found." });
        return;
    }
    
    const invoiceId = `INV-${values.invoiceNumber}`;
    const subtotal = values.amount;
    const taxAmount = subtotal * 0.18; // Assuming 18% GST
    const totalAmount = subtotal + taxAmount;

    const journalLines = [
        { account: values.customerId, debit: totalAmount.toFixed(2), credit: '0' },
        { account: '4010', debit: '0', credit: subtotal.toFixed(2) },
        { account: '2110', debit: '0', credit: taxAmount.toFixed(2) }
    ];

    try {
        await addJournalVoucher({
            id: invoiceId,
            date: values.invoiceDate,
            narration: `${values.description} to ${selectedCustomer.name}`,
            lines: journalLines,
            amount: totalAmount,
            customerId: values.customerId,
        });

        toast({ title: "Invoice Saved", description: `Invoice #${values.invoiceNumber} has been created.` });

        if (closeOnSave) {
            router.push("/billing/invoices");
        } else {
            // "Save & New" - Reset the form for the next entry
            const currentInvNumber = parseInt(values.invoiceNumber, 10);
            form.reset({
                ...values,
                invoiceNumber: isNaN(currentInvNumber) ? "" : String(currentInvNumber + 1),
                description: "Consultancy Services",
                amount: 0,
            });
            form.setFocus("description");
        }
    } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to save invoice", description: e.message });
    }
  }, [accountingContext, customers, form, router, toast]);

  const onSaveAndNew = form.handleSubmit(values => handleSave(values, false));
  const onSaveAndClose = form.handleSubmit(values => handleSave(values, true));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/billing/invoices" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-primary"/> Rapid Invoice Entry</h1>
            <p className="text-muted-foreground">Quickly create multiple invoices without leaving the page.</p>
        </div>
      </div>
      <Form {...form}>
        <form>
            <Card>
                <CardHeader>
                <CardTitle>New Invoice</CardTitle>
                <CardDescription>
                    Fill details and click "Save &amp; New" to quickly add another.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="customerId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder={customersLoading ? "Loading..." : "Select Customer"} /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                            <FormItem><FormLabel>Invoice Number</FormLabel><FormControl><Input placeholder="001" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="invoiceDate" render={({ field }) => (
                            <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <Separator/>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Description of service/product" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem><FormLabel>Taxable Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50000" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onSaveAndClose}>
                        Save & Close
                    </Button>
                    <Button type="button" onClick={onSaveAndNew}>
                        <Save className="mr-2"/>
                        Save & New
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
    </div>
  );
}
