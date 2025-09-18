
"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "../ui/textarea";

const partySchema = z.object({
    name: z.string().min(2, "Name is required."),
    gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format.").optional().or(z.literal("")),
    email: z.string().email("Invalid email.").optional().or(z.literal("")),
    phone: z.string().optional(),
});

const itemSchema = z.object({
    name: z.string().min(2, "Item name is required."),
    description: z.string().optional(),
    hsn: z.string().optional(),
    stock: z.coerce.number().min(0).optional(),
    purchasePrice: z.coerce.number().min(0).optional(),
    sellingPrice: z.coerce.number().min(0).optional(),
});

export const PartyDialog = ({ open, onOpenChange, type }: { open: boolean, onOpenChange: (open: boolean) => void, type: 'Customer' | 'Vendor' }) => {
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    
    const form = useForm<z.infer<typeof partySchema>>({
        resolver: zodResolver(partySchema),
        defaultValues: { name: '', gstin: '', email: '', phone: '' },
    });

    const onSubmit = async (values: z.infer<typeof partySchema>) => {
         if (!user) {
            toast({ variant: "destructive", title: "Not Authenticated" });
            return;
        }
        const collectionName = type === 'Customer' ? 'customers' : 'vendors';
        try {
            await addDoc(collection(db, collectionName), { ...values, userId: user.uid });
            toast({ title: `${type} Added`, description: `${values.name} has been saved.` });
            onOpenChange(false);
            form.reset();
        } catch (e) {
            console.error("Error adding document: ", e);
            toast({ variant: "destructive", title: "Error", description: `Could not save ${type}.` });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add New {type}</DialogTitle>
                            <DialogDescription>Enter the details for your new {type.toLowerCase()}.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><Label>Name</Label><FormControl><Input placeholder={`${type}'s legal name`} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="gstin" render={({ field }) => ( <FormItem><Label>GSTIN</Label><FormControl><Input placeholder="15-digit GSTIN" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <Separator/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><Label>Email</Label><FormControl><Input placeholder="contact@example.com" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><Label>Phone</Label><FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save {type}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export const ItemDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    
    const form = useForm<z.infer<typeof itemSchema>>({
        resolver: zodResolver(itemSchema),
        defaultValues: { name: "", description: "", hsn: "", stock: 0, purchasePrice: 0, sellingPrice: 0 },
    });

    const onSubmit = async (values: z.infer<typeof itemSchema>) => {
        if (!user) {
           toast({ variant: "destructive", title: "Not authenticated" });
           return;
       }
       try {
           await addDoc(collection(db, 'items'), { ...values, userId: user.uid });
           toast({ title: "Item Added", description: `${values.name} has been added.` });
           onOpenChange(false);
           form.reset();
       } catch (e) {
           console.error("Error adding document: ", e);
           toast({ variant: "destructive", title: "Error", description: "Could not save the item." });
       }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                            <DialogDescription>Add a new product or service to your inventory.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><Label>Item Name</Label><FormControl><Input placeholder="e.g. Wireless Keyboard" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><Label>Description</Label><FormControl><Textarea placeholder="A short description of the item" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="hsn" render={({ field }) => ( <FormItem><Label>HSN/SAC Code</Label><FormControl><Input placeholder="e.g. 8471" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem><Label>Opening Stock</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem><Label>Purchase Price (₹)</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="sellingPrice" render={({ field }) => ( <FormItem><Label>Selling Price (₹)</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Item</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
