
"use client";

import { useState, useMemo } from "react";
import { PlaceholderPage } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wand2, ArrowRight, PlusCircle, MoreHorizontal, Edit, Trash2, ChevronDown, Upload, Download, FileSpreadsheet, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";


const itemSchema = z.object({
    name: z.string().min(2, "Item name is required."),
    description: z.string().optional(),
    hsn: z.string().optional(),
    stock: z.coerce.number().min(0).optional(),
    purchasePrice: z.coerce.number().min(0).optional(),
    sellingPrice: z.coerce.number().min(0).optional(),
});


export default function ItemsPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
    const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
    const items = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

    const form = useForm<z.infer<typeof itemSchema>>({
        resolver: zodResolver(itemSchema),
        defaultValues: { name: "", description: "", hsn: "", stock: 0, purchasePrice: 0, sellingPrice: 0 },
    });

    const handleDownloadTemplate = () => {
        const headers = "Name,Description,HSN,Stock,Purchase Price,Selling Price";
        const exampleData = "Sample Product,A sample description,12345678,10,100,150";
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleData}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "items_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Template Downloaded", description: "Items CSV template has been downloaded." });
    }

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.hsn?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const onAddItemSubmit = async (values: z.infer<typeof itemSchema>) => {
        if (!user) {
            toast({ variant: "destructive", title: "Not authenticated" });
            return;
        }
        try {
            await addDoc(collection(db, 'items'), { ...values, userId: user.uid });
            toast({ title: "Item Added", description: `${values.name} has been added to your inventory.` });
            form.reset();
            setIsAddDialogOpen(false);
        } catch (e) {
            console.error("Error adding document: ", e);
            toast({ variant: "destructive", title: "Error", description: "Could not save the item." });
        }
    };
    
    const handleAction = (action: string, itemName: string) => {
        if (action === 'Delete') {
            toast({
                variant: 'destructive',
                title: 'Action Disabled',
                description: `Deleting '${itemName}' is disabled to maintain data integrity. An archival feature will be added in the future.`,
            });
        } else {
             toast({
                title: 'Action Incomplete',
                description: `This would ${action.toLowerCase()} the item '${itemName}'. This feature is a placeholder.`,
            });
        }
    };


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="text-primary"/> 
                        AI-Powered HSN Code Suggestion
                    </CardTitle>
                    <CardDescription>
                        Not sure about the HSN code for your product or service? Use our AI tool to get an accurate suggestion.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Properly classifying your goods and services with the correct HSN/SAC code is crucial for GST compliance. Our intelligent assistant analyzes your item's description to recommend the most suitable code, helping you avoid errors in your tax filings.
                    </p>
                    <Link href="/items/suggest-hsn" passHref>
                        <Button>
                            <span>Launch HSN Suggester</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Products &amp; Services</CardTitle>
                            <CardDescription>Manage your items, including products and services.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Import/Export
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Import Items
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Export to CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleDownloadTemplate}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Template
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2"/>
                                        Add Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[525px]">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onAddItemSubmit)}>
                                            <DialogHeader>
                                                <DialogTitle>Add New Item</DialogTitle>
                                                <DialogDescription>
                                                    Add a new product or service to your inventory.
                                                </DialogDescription>
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
                        </div>
                    </div>
                     <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search by item name or HSN code..."
                        className="pl-8 sm:w-full md:w-1/3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-right">Purchase Price</TableHead>
                                <TableHead className="text-right">Selling Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {itemsLoading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto animate-spin text-primary"/></TableCell></TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No items found.</TableCell></TableRow>
                            ) : filteredItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">{item.hsn}</div>
                                    </TableCell>
                                    <TableCell className="text-right">{item.stock > 0 ? item.stock : "-"}</TableCell>
                                    <TableCell className="text-right">₹{item.purchasePrice?.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₹{item.sellingPrice?.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleAction('Edit', item.name)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onSelect={() => handleAction('Delete', item.name)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );

    
}
