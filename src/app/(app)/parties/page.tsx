
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MoreHorizontal, Edit, Trash2, ChevronDown, Upload, Download, FileSpreadsheet, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, deleteDoc, doc } from 'firebase/firestore';
import { z } from "zod";
import { PartyDialog } from "@/components/billing/add-new-dialogs";
import { useRouter } from "next/navigation";

const partySchema = z.object({
    name: z.string().min(2, "Name is required."),
    gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format.").optional().or(z.literal("")),
    email: z.string().email("Invalid email.").optional().or(z.literal("")),
    phone: z.string().optional(),
    address1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
});

export type Party = z.infer<typeof partySchema> & { id: string; };

export default function PartiesPage() {
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<Party | null>(null);

    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [vendorSearchTerm, setVendorSearchTerm] = useState("");
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const router = useRouter();

    const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
    const [customersSnapshot, customersLoading] = useCollection(customersQuery);
    const customers: Party[] = customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party)) || [];

    const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
    const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
    const vendors: Party[] = vendorsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party)) || [];


    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return customers;
        return customers.filter(c => 
            c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
            c.gstin?.toLowerCase().includes(customerSearchTerm.toLowerCase())
        );
    }, [customers, customerSearchTerm]);

    const filteredVendors = useMemo(() => {
        if (!vendorSearchTerm) return vendors;
        return vendors.filter(v => 
            v.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
            v.gstin?.toLowerCase().includes(vendorSearchTerm.toLowerCase())
        );
    }, [vendors, vendorSearchTerm]);

    const handleEdit = (party: Party, type: 'Customer' | 'Vendor') => {
      setEditingParty(party);
      if (type === 'Customer') {
        setIsCustomerDialogOpen(true);
      } else {
        setIsVendorDialogOpen(true);
      }
    };
    
    const handleDelete = async (party: Party, type: 'Customer' | 'Vendor') => {
        try {
            const collectionName = type === 'Customer' ? 'customers' : 'vendors';
            await deleteDoc(doc(db, collectionName, party.id));
            toast({ title: `${type} Deleted`, description: `${party.name} has been removed.` });
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: `Could not delete ${party.name}.`,
            });
        }
    };

    const closeDialogs = () => {
        setIsCustomerDialogOpen(false);
        setIsVendorDialogOpen(false);
        setEditingParty(null);
    }


    const PartyTable = ({ parties, loading, type }: { parties: Party[], loading: boolean, type: 'Customer' | 'Vendor' }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-primary"/></TableCell></TableRow>
                ) : parties.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No parties found.</TableCell></TableRow>
                ) : parties.map((party) => (
                    <TableRow key={party.id}>
                        <TableCell className="font-medium">{party.name}</TableCell>
                        <TableCell>
                            <div className="text-sm">{party.email}</div>
                            <div className="text-xs text-muted-foreground">{party.phone}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{party.gstin}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleEdit(party, type)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(party, type)}>
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
    );

  return (
    <div className="space-y-8">
      <div>
          <h1 className="text-3xl font-bold">Parties</h1>
          <p className="text-muted-foreground">
            Manage your customers and vendors from one place.
          </p>
      </div>

       <Tabs defaultValue="customers">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Customers</CardTitle>
                            <CardDescription>A list of all your customers.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" onClick={() => router.push('/import-export')}><Upload className="mr-2"/> Import</Button>
                            <Button onClick={() => { setEditingParty(null); setIsCustomerDialogOpen(true); }}>
                                <PlusCircle className="mr-2"/>
                                Add Customer
                            </Button>
                            <PartyDialog open={isCustomerDialogOpen} onOpenChange={closeDialogs} type="Customer" party={editingParty} />
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search customers by name or GSTIN..."
                            className="pl-8 sm:w-full md:w-1/2"
                            value={customerSearchTerm}
                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <PartyTable parties={filteredCustomers} loading={customersLoading} type="Customer"/>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="vendors">
            <Card>
                <CardHeader className="space-y-4">
                     <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Vendors</CardTitle>
                            <CardDescription>A list of all your vendors/suppliers.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" onClick={() => router.push('/import-export')}><Upload className="mr-2"/> Import</Button>
                            <Button onClick={() => { setEditingParty(null); setIsVendorDialogOpen(true); }}>
                                <PlusCircle className="mr-2"/>
                                Add Vendor
                            </Button>
                            <PartyDialog open={isVendorDialogOpen} onOpenChange={closeDialogs} type="Vendor" party={editingParty} />
                        </div>
                    </div>
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search vendors by name or GSTIN..."
                            className="pl-8 sm:w-full md:w-1/2"
                            value={vendorSearchTerm}
                            onChange={(e) => setVendorSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <PartyTable parties={filteredVendors} loading={vendorsLoading} type="Vendor"/>
                </CardContent>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
