
"use client";

import { useState, useMemo, useContext } from "react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2,
  Search,
  Users,
  Store,
  Upload,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AccountingContext } from "@/context/accounting-context";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, deleteDoc, doc } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartyDialog } from "@/components/billing/add-new-dialogs";
import { useRouter } from "next/navigation";

export default function PartiesPage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("customers");
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [customersSnapshot]);

  const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
  const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
  const vendors = useMemo(() => vendorsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [vendorsSnapshot]);
  
  const handleOpenDialog = (party: any | null = null) => {
    setSelectedParty(party);
    setIsPartyDialogOpen(true);
  }

  const handleDeleteParty = async (party: any) => {
    const collectionName = activeTab === 'customers' ? 'customers' : 'vendors';
    const partyDocRef = doc(db, collectionName, party.id);
    try {
        await deleteDoc(partyDocRef);
        toast({ title: "Party Deleted", description: `${party.name} has been removed.`})
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete the party."})
    }
  }
  
  const handleViewLedger = (party: any) => {
      router.push(`/accounting/ledgers?account=${party.id}`);
  }

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors;
    return vendors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendors, searchTerm]);
  
  const PartyTable = ({ parties, type, loading } : { parties: any[], type: 'Customer' | 'Vendor', loading: boolean}) => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
          ) : parties.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No {type.toLowerCase()}s found.</TableCell></TableRow>
          ) : (
            parties.map((party) => (
              <TableRow key={party.id}>
                <TableCell className="font-medium">{party.name}</TableCell>
                <TableCell className="font-mono text-xs">{party.gstin || 'N/A'}</TableCell>
                <TableCell>{party.email || 'N/A'}</TableCell>
                <TableCell>{party.phone || 'N/A'}</TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewLedger(party)}><FileText className="mr-2"/> View Ledger</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(party)}><Edit className="mr-2"/> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteParty(party)}><Trash2 className="mr-2"/> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parties</h1>
          <p className="text-muted-foreground">
            Manage your customers and vendors from one central place.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Download className="mr-2"/> Export</Button>
            <Button variant="outline"><Upload className="mr-2"/> Import</Button>
            <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2"/>Add New {activeTab === 'customers' ? 'Customer' : 'Vendor'}</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="customers"><Users className="mr-2"/>Customers</TabsTrigger>
            <TabsTrigger value="vendors"><Store className="mr-2"/>Vendors</TabsTrigger>
        </TabsList>
        <div className="relative pt-4 mt-4">
            <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or GSTIN..."
              className="pl-8 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <TabsContent value="customers" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Customer List</CardTitle>
                    <CardDescription>A list of all your customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PartyTable parties={filteredCustomers} type="Customer" loading={customersLoading}/>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="vendors" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Vendor List</CardTitle>
                    <CardDescription>A list of all your vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PartyTable parties={filteredVendors} type="Vendor" loading={vendorsLoading}/>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      <PartyDialog
        open={isPartyDialogOpen}
        onOpenChange={setIsPartyDialogOpen}
        type={activeTab === 'customers' ? 'Customer' : 'Vendor'}
        party={selectedParty}
      />
    </div>
  );
}

