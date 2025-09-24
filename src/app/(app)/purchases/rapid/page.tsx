
"use client";

import { useState, useContext, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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

const rapidPurchaseSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required."),
  billNumber: z.string().min(1, "Bill number is required."),
  billDate: z.string().min(1, "Date is required."),
  itemId: z.string().min(1, "An item selection is required."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
});

type RapidPurchaseForm = z.infer<typeof rapidPurchaseSchema>;

export default function RapidPurchaseEntryPage() {
  const accountingContext = useContext(AccountingContext);
  const { toast } = useToast();
  const router = useRouter();
  const [user] = useAuthState(auth);
  
  const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
  const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
  const vendors = useMemo(() => vendorsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [vendorsSnapshot]);

  const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
  const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
  const items = useMemo(() => itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [itemsSnapshot]);

  const form = useForm<RapidPurchaseForm>({
    resolver: zodResolver(rapidPurchaseSchema),
    defaultValues: {
      vendorId: "",
      billNumber: "",
      billDate: format(new Date(), "yyyy-MM-dd"),
      itemId: "",
      amount: 0,
    },
  });
  
  const watchedAmount = Number(form.watch("amount")) || 0;
  const taxAmount = watchedAmount * 0.18; // Assuming 18% GST
  const totalAmount = watchedAmount + taxAmount;

  const handleSave = useCallback(async (values: RapidPurchaseForm, closeOnSave: boolean) => {
    if (!accountingContext) return;
    const { addJournalVoucher, journalVouchers } = accountingContext;

    const selectedVendor = vendors.find(v => v.id === values.vendorId);
    const selectedItem = items.find((i:any) => i.id === values.itemId);

    if (!selectedVendor || !selectedItem) {
        toast({ variant: "destructive", title: "Invalid Selection", description: "Please ensure vendor and item are selected." });
        return;
    }
    
    const billId = `BILL-${values.billNumber}`;
    const isDuplicate = journalVouchers.some(voucher => voucher.id === billId);

    if (isDuplicate) {
        toast({ variant: "destructive", title: "Duplicate Bill Number", description: `A bill with the number ${billId} already exists.` });
        return;
    }

    const subtotal = values.amount;
    const currentTaxAmount = subtotal * 0.18; // Recalculate for safety
    const currentTotalAmount = subtotal + currentTaxAmount;

    const journalLines = [
        { account: '5050', debit: subtotal.toFixed(2), credit: '0' }, // Purchases
        { account: '2110', debit: currentTaxAmount.toFixed(2), credit: '0' }, // GST Payable (as ITC)
        { account: values.vendorId, debit: '0', credit: currentTotalAmount.toFixed(2) }
    ];

    try {
        await addJournalVoucher({
            id: billId,
            date: values.billDate,
            narration: `Purchase of ${selectedItem.name} from ${selectedVendor.name}`,
            lines: journalLines,
            amount: currentTotalAmount,
            vendorId: values.vendorId,
        });

        toast({ title: "Purchase Bill Saved", description: `Bill #${values.billNumber} has been created.` });

        if (closeOnSave) {
            router.push("/purchases");
        } else {
            const currentBillNumber = parseInt(values.billNumber.replace(/[^0-9]/g, ''), 10);
            const nextBillNumber = isNaN(currentBillNumber) ? "" : String(currentBillNumber + 1).padStart(3, '0');

            form.reset({
                ...values,
                billNumber: nextBillNumber,
                itemId: "",
                amount: 0,
            });
            form.setFocus("itemId");
        }
    } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to save purchase bill", description: e.message });
    }
  }, [accountingContext, vendors, items, form, router, toast]);
  
  const handleItemChange = (itemId: string) => {
      const selectedItem: any = items.find((i:any) => i.id === itemId);
      if (selectedItem) {
          form.setValue('itemId', itemId);
          form.setValue('amount', selectedItem.purchasePrice || 0, { shouldValidate: true });
      }
  }

  const onSaveAndNew = form.handleSubmit(values => handleSave(values, false));
  const onSaveAndClose = form.handleSubmit(values => handleSave(values, true));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/purchases" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2"><Sparkles className="text-primary"/> Rapid Purchase Entry</h1>
        <p className="text-muted-foreground">Quickly create multiple purchase bills without leaving the page.</p>
      </div>
      <Form {...form}>
        <form>
            <Card>
                <CardHeader>
                <CardTitle>New Purchase Bill</CardTitle>
                <CardDescription>
                    Fill details and click "Save &amp; New" to quickly add another.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="vendorId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vendor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder={vendorsLoading ? "Loading..." : "Select Vendor"} /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {vendors.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="billNumber" render={({ field }) => (
                            <FormItem><FormLabel>Bill Number</FormLabel><FormControl><Input placeholder="001" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="billDate" render={({ field }) => (
                            <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <Separator/>
                    <div className="grid md:grid-cols-2 gap-4">
                       <FormField control={form.control} name="itemId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product / Service</FormLabel>
                                <Select onValueChange={handleItemChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder={itemsLoading ? "Loading..." : "Select an item"} /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {items.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem><FormLabel>Taxable Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50000" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                     <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2 border-t pt-4 mt-4">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxable Amount</span><span>₹{watchedAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">IGST @ 18%</span><span>₹{taxAmount.toFixed(2)}</span></div>
                            <Separator/>
                            <div className="flex justify-between font-bold text-md"><span>Total Amount</span><span>₹{totalAmount.toFixed(2)}</span></div>
                        </div>
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

    