
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MoreHorizontal, Edit, Trash2, ChevronDown, Upload, Download, FileSpreadsheet, Search, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, query, where } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { PartyDialog } from "@/components/billing/add-new-dialogs";

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

type Party = z.infer<typeof partySchema> & { id: string; };

export default function PartiesPage() {
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [vendorSearchTerm, setVendorSearchTerm] = useState("");
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
    const [customersSnapshot, customersLoading] = useCollection(customersQuery);
    const customers: Party[] = customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party)) || [];

    const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
    const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
    const vendors: Party[] = vendorsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Party)) || [];


    const handleDownloadTemplate = (type: 'Customer' | 'Vendor') => {
        const headers = "Name,Email,Phone,GSTIN,Address Line 1,City,State,Pincode";
        const exampleData = "Sample Company,sample@email.com,9876543210,27ABCDE1234F1Z5,123 Sample St,Sample City,Sample State,123456";
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleData}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type.toLowerCase()}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Template Downloaded", description: `${type} CSV template has been downloaded.` });
    };

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

    const handleAction = (action: string, partyName: string) => {
        if (action === 'Delete') {
            toast({
                variant: 'destructive',
                title: 'Action Disabled',
                description: `Deleting '${partyName}' is disabled to maintain data integrity. An archival feature will be added in the future.`,
            });
        } else {
             toast({
                title: 'Action Incomplete',
                description: `This would ${action.toLowerCase()} the party '${partyName}'. This feature is a placeholder.`,
            });
        }
    };

    const PartyTable = ({ parties, loading }: { parties: Party[], loading: boolean }) => (
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
                                    <DropdownMenuItem onSelect={() => handleAction('Edit', party.name)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleAction('Delete', party.name)}>
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
    
    const ImportExportMenu = ({ type }: { type: 'Customer' | 'Vendor' }) => (
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
                    Import {type}s
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleDownloadTemplate(type)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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
                            <ImportExportMenu type="Customer" />
                            <Button onClick={() => setIsCustomerDialogOpen(true)}>
                                <PlusCircle className="mr-2"/>
                                Add Customer
                            </Button>
                            <PartyDialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen} type="Customer" />
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
                    <PartyTable parties={filteredCustomers} loading={customersLoading}/>
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
                            <ImportExportMenu type="Vendor" />
                            <Button onClick={() => setIsVendorDialogOpen(true)}>
                                <PlusCircle className="mr-2"/>
                                Add Vendor
                            </Button>
                            <PartyDialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen} type="Vendor" />
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
                    <PartyTable parties={filteredVendors} loading={vendorsLoading}/>
                </CardContent>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
