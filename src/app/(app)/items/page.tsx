
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Wand2,
  ArrowRight,
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, deleteDoc, doc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { ItemDialog } from "@/components/billing/add-new-dialogs";

const itemSchema = z.object({
    name: z.string().min(2, "Item name is required."),
    description: z.string().optional(),
    hsn: z.string().optional(),
    stock: z.coerce.number().min(0).optional(),
    purchasePrice: z.coerce.number().min(0).optional(),
    sellingPrice: z.coerce.number().min(0).optional(),
});

export type Item = z.infer<typeof itemSchema> & { id: string; };

export default function ItemsPage() {
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
    const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
    const items: Item[] = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)) || [];

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
    
    const handleEdit = (item: Item) => {
      // In a real app, you would open a dialog with the item's data pre-filled.
      // For now, we'll just log it.
      toast({
        title: 'Editing Item (Placeholder)',
        description: `This would open an edit form for ${item.name}.`,
      });
    };
    
    const handleDelete = async (item: Item) => {
        try {
            await deleteDoc(doc(db, "items", item.id));
            toast({ title: `Item Deleted`, description: `${item.name} has been removed.` });
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: `Could not delete ${item.name}.`,
            });
        }
    };


    return (
        <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Products & Services</h1>
              <p className="text-muted-foreground">Manage your items, including products and services offered.</p>
            </div>
            
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Your Stock Items</CardTitle>
                        <CardDescription>A list of all products and services you buy and sell.</CardDescription>
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
                        <Button onClick={() => { setEditingItem(null); setIsItemDialogOpen(true); }}>
                            <PlusCircle className="mr-2"/>
                            Add Item
                        </Button>
                        <ItemDialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen} item={editingItem} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search by item name or HSN code..."
                        className="pl-8 sm:w-full md:w-1/2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="border rounded-md">
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
                                                    <DropdownMenuItem onSelect={() => handleEdit(item)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(item)}>
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
                    </div>
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Need help finding an HSN code? Use our <Link href="/items/suggest-hsn" className="underline font-semibold">AI HSN Suggester</Link>.
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
