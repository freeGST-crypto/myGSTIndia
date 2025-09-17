
"use client";

import { useState } from "react";
import { PlaceholderPage } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wand2, ArrowRight, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

const initialItems = [
    {
        id: "ITEM-001",
        name: "Standard Office Chair",
        description: "Ergonomic office chair with lumbar support.",
        hsn: "9401",
        stock: 50,
        purchasePrice: 4500,
        sellingPrice: 7500,
    },
    {
        id: "ITEM-002",
        name: "Accounting Services",
        description: "Monthly bookkeeping and GST filing services.",
        hsn: "9982",
        stock: 0, // Services typically have no stock
        purchasePrice: 0,
        sellingPrice: 15000,
    },
    {
        id: "ITEM-003",
        name: "Wireless Mouse",
        description: "Logitech MX Master 3S wireless mouse.",
        hsn: "8471",
        stock: 120,
        purchasePrice: 6000,
        sellingPrice: 8999,
    }
];


export default function ItemsPage() {
    const [items, setItems] = useState(initialItems);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Products & Services</CardTitle>
                        <CardDescription>Manage your items, including products and services.</CardDescription>
                    </div>
                     <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                             <Button>
                                <PlusCircle className="mr-2"/>
                                Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                <DialogTitle>Add New Item</DialogTitle>
                                <DialogDescription>
                                    Add a new product or service to your inventory.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="item-name" className="text-right">Item Name</Label>
                                    <Input id="item-name" placeholder="e.g. Wireless Keyboard" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="item-description" className="text-right pt-2">Description</Label>
                                    <Textarea id="item-description" placeholder="A short description of the item" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="hsn-sac" className="text-right">HSN/SAC Code</Label>
                                    <Input id="hsn-sac" placeholder="e.g. 8471" className="col-span-3" />
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="stock" className="text-right">Opening Stock</Label>
                                    <Input id="stock" type="number" placeholder="0" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 col-start-2">
                                     <div>
                                        <Label htmlFor="purchase-price">Purchase Price (₹)</Label>
                                        <Input id="purchase-price" type="number" placeholder="0.00"/>
                                    </div>
                                    <div>
                                        <Label htmlFor="selling-price">Selling Price (₹)</Label>
                                        <Input id="selling-price" type="number" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={() => setIsAddDialogOpen(false)}>Save Item</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">{item.hsn}</div>
                                    </TableCell>
                                    <TableCell className="text-right">{item.stock > 0 ? item.stock : "-"}</TableCell>
                                    <TableCell className="text-right">₹{item.purchasePrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₹{item.sellingPrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
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
