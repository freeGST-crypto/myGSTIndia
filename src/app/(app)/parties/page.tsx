
"use client";

import { useState } from "react";
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, ChevronDown, Upload, Download, FileCsv } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const initialCustomers = [
  {
    id: "CUST-001",
    name: "Global Tech Inc.",
    email: "contact@globaltech.com",
    phone: "+91 9876543210",
    gstin: "27AACCG1234F1Z5",
  },
  {
    id: "CUST-002",
    name: "Innovate Solutions",
    email: "accounts@innovate.co.in",
    phone: "+91 9123456789",
    gstin: "29AABCI5678G1Z4",
  },
];

const initialVendors = [
  {
    id: "VEND-001",
    name: "Supplier Alpha",
    email: "sales@supplieralpha.com",
    phone: "+91 8765432109",
    gstin: "24AAACS4321H1Z2",
  },
  {
    id: "VEND-002",
    name: "Vendor Beta",
    email: "info@vendorbeta.net",
    phone: "+91 7654321098",
    gstin: "33AACCV9876J1Z1",
  },
];

export default function PartiesPage() {
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);

    const PartyDialog = ({ open, onOpenChange, type }: { open: boolean, onOpenChange: (open: boolean) => void, type: 'Customer' | 'Vendor' }) => (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2"/>
                    Add {type}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                 <DialogHeader>
                    <DialogTitle>Add New {type}</DialogTitle>
                    <DialogDescription>
                       Enter the details for your new {type.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" placeholder={`${type}'s legal name`} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gstin" className="text-right">GSTIN</Label>
                        <Input id="gstin" placeholder="15-digit GSTIN" className="col-span-3" />
                    </div>
                    <Separator/>
                     <h3 className="font-medium col-span-4">Contact Details</h3>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" placeholder="contact@example.com" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input id="phone" placeholder="+91 98765 43210" className="col-span-3" />
                    </div>
                    <Separator />
                     <h3 className="font-medium col-span-4">Billing Address</h3>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address1" className="text-right">Address Line 1</Label>
                        <Input id="address1" placeholder="Street, Building No." className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">City</Label>
                        <Input id="city" placeholder="e.g. Mumbai" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="state" className="text-right">State</Label>
                        <Input id="state" placeholder="e.g. Maharashtra" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pincode" className="text-right">Pincode</Label>
                        <Input id="pincode" placeholder="e.g. 400001" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Save {type}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    const PartyTable = ({ parties, type }: { parties: any[], type: 'Customer' | 'Vendor' }) => (
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
                {parties.map((party) => (
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
                    <FileCsv className="mr-2 h-4 w-4" />
                    Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>A list of all your customers.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <ImportExportMenu type="Customer" />
                        <PartyDialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen} type="Customer" />
                    </div>
                </CardHeader>
                <CardContent>
                    <PartyTable parties={initialCustomers} type="Customer"/>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="vendors">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Vendors</CardTitle>
                        <CardDescription>A list of all your vendors/suppliers.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <ImportExportMenu type="Vendor" />
                        <PartyDialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen} type="Vendor" />
                    </div>
                </CardHeader>
                <CardContent>
                    <PartyTable parties={initialVendors} type="Vendor"/>
                </CardContent>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
