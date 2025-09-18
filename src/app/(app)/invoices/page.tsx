
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, AlertCircle, CheckCircle, Edit, Download, Copy, Trash2, FileJson, Zap, Search, FileCog } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from 'date-fns';
import { AccountingContext } from "@/context/accounting-context";
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import jsPDF from 'jspdf';

type Invoice = {
  id: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
}

export default function InvoicesPage() {
  const { journalVouchers, addJournalVoucher, loading: journalLoading } = useContext(AccountingContext)!;
  const [user] = useAuthState(auth);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // State for the quick invoice form
  const [quickInvNum, setQuickInvNum] = useState("");
  const [quickCustomer, setQuickCustomer] = useState("");
  const [quickItem, setQuickItem] = useState<{ id: string, name: string, sellingPrice: number} | null>(null);
  const [quickQty, setQuickQty] = useState(1);
  const [quickRate, setQuickRate] = useState(0);

  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
  const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
  const items = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const invoices = useMemo(() => {
    const salesInvoices = journalVouchers.filter(v => v.id.startsWith("JV-INV-"));
    const cancelledInvoiceIds = new Set(
        journalVouchers
            .filter(v => v.id.startsWith("JV-CNL-"))
            .map(v => v.id.replace("JV-CNL-", "INV-"))
    );

    return salesInvoices
        .map(v => {
            const invoiceId = v.id.replace("JV-", "");
            const isCancelled = cancelledInvoiceIds.has(invoiceId);
            return {
                id: invoiceId,
                customer: v.narration.replace("Sale to ", "").split(" via")[0],
                date: v.date,
                dueDate: format(addDays(new Date(v.date), 30), 'yyyy-MM-dd'),
                amount: v.amount,
                status: isCancelled ? "Cancelled" : "Pending", // Status logic now includes cancelled
            }
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalVouchers]);


  const handleQuickInvoiceCreate = () => {
    if (!quickInvNum || !quickCustomer || !quickItem || quickRate <= 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields for the quick invoice.",
      });
      return;
    }
    // In a real app, this would also call addJournalVoucher
    toast({
        title: "Quick Invoice Created! (Simulation)",
        description: `Invoice ${quickInvNum} has been created.`
    });

    // Reset form
    setQuickInvNum("");
    setQuickCustomer("");
    setQuickItem(null);
    setQuickQty(1);
    setQuickRate(0);
  }

  const handleQuickItemChange = (itemId: string) => {
    const selectedItem = items.find((i: any) => i.id === itemId);
    if(selectedItem) {
        setQuickItem(selectedItem);
        setQuickRate(selectedItem.sellingPrice);
    }
  }

    const handleCancelInvoice = async (invoiceId: string) => {
        const originalVoucherId = `JV-${invoiceId}`;
        const originalVoucher = journalVouchers.find(v => v.id === originalVoucherId);

        if (!originalVoucher) {
            toast({ variant: "destructive", title: "Error", description: "Original invoice transaction not found." });
            return;
        }

        // Create the reversal entry
        const reversalLines = originalVoucher.lines.map(line => ({
            account: line.account,
            debit: line.credit, // Swap debit and credit
            credit: line.debit,
        }));

        const cancellationVoucher = {
            id: `JV-CNL-${invoiceId.replace("INV-","")}`,
            date: new Date().toISOString().split('T')[0],
            narration: `Cancellation of Invoice #${invoiceId}`,
            lines: reversalLines,
            amount: originalVoucher.amount,
            customerId: originalVoucher.customerId,
        };

        try {
            await addJournalVoucher(cancellationVoucher);
            toast({ title: "Invoice Cancelled", description: `Invoice #${invoiceId} has been successfully cancelled.` });
        } catch (e: any) {
            toast({ variant: "destructive", title: "Cancellation Failed", description: e.message });
        }
    };
    
    const handleAction = (action: string, invoice: Invoice) => {
        if (action === 'View') {
            setSelectedInvoice(invoice);
        } else if (action === 'Cancel') {
            handleCancelInvoice(invoice.id);
        } else if (action === 'Download') {
            handleDownloadPdf(invoice);
        } else {
            toast({
                title: `Action: ${action}`,
                description: `This would ${action.toLowerCase()} invoice ${invoice.id}. This feature is a placeholder.`
            });
        }
    }

    const handleDownloadPdf = (invoice: any) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("INVOICE", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Invoice #: ${invoice.id}`, 14, 40);
        doc.text(`Date: ${format(new Date(invoice.date), "dd MMM, yyyy")}`, 14, 46);
        doc.text(`Customer: ${invoice.customer}`, 14, 60);
        doc.text(`Amount: Rs. ${invoice.amount.toFixed(2)}`, 14, 70);
        doc.save(`Invoice_${invoice.id}.pdf`);
        toast({ title: "Download Started", description: `Downloading PDF for invoice ${invoice.id}.`});
    }


  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
       case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(invoice =>
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage your sales invoices.
          </p>
        </div>
        <div className="flex gap-2">
            <Link href="/invoices/templates" passHref>
                <Button variant="outline">
                    <FileCog className="mr-2"/>
                    Templates
                </Button>
            </Link>
            <Link href="/invoices/new" passHref>
            <Button>
                <PlusCircle className="mr-2"/>
                Create Full Invoice
            </Button>
            </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Outstanding"
          value="₹60,000.00"
          icon={IndianRupee}
          description="Amount yet to be received"
        />
        <StatCard 
          title="Total Overdue"
          value="₹35,000.00"
          icon={AlertCircle}
          description="1 invoice overdue"
          className="text-destructive"
        />
        <StatCard 
          title="Paid (Last 30 days)"
          value="₹25,000.00"
          icon={CheckCircle}
          description="From 1 invoice"
        />
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Zap className="text-primary" />
                Quick Invoice
            </CardTitle>
            <CardDescription>
                Create a simple invoice with just the essentials.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                 <div className="space-y-2">
                    <Label htmlFor="quick-inv-num">Invoice #</Label>
                    <Input id="quick-inv-num" placeholder="INV-005" value={quickInvNum} onChange={e => setQuickInvNum(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="quick-customer">Customer</Label>
                    <Select value={quickCustomer} onValueChange={setQuickCustomer} disabled={customersLoading}>
                        <SelectTrigger id="quick-customer">
                            <SelectValue placeholder={customersLoading ? "Loading..." : "Select customer"} />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quick-item">Item</Label>
                    <Select value={quickItem?.id || ""} onValueChange={handleQuickItemChange} disabled={itemsLoading}>
                        <SelectTrigger id="quick-item">
                            <SelectValue placeholder={itemsLoading ? "Loading..." : "Select item"} />
                        </SelectTrigger>
                        <SelectContent>
                            {items.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quick-qty">Qty</Label>
                    <Input id="quick-qty" type="number" placeholder="1" value={quickQty} onChange={e => setQuickQty(parseInt(e.target.value) || 1)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="quick-rate">Rate (₹)</Label>
                    <Input id="quick-rate" type="number" placeholder="0.00" value={quickRate} onChange={e => setQuickRate(parseFloat(e.target.value) || 0)} />
                </div>
            </div>
        </CardContent>
        <CardContent className="flex justify-end">
             <Button onClick={handleQuickInvoiceCreate}>Create Quick Invoice</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            Here is a list of your most recent invoices.
          </CardDescription>
           <div className="relative pt-4">
                <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by Invoice # or Customer..."
                  className="pl-8 w-full md:w-1/3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{format(new Date(invoice.date), "dd MMM, yyyy")}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), "dd MMM, yyyy")}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">₹{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleAction('View', invoice)}>
                              <FileText className="mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAction('Edit', invoice)}>
                              <Edit className="mr-2" /> Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAction('Download', invoice)}>
                              <Download className="mr-2" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAction('Duplicate', invoice)}>
                              <Copy className="mr-2" /> Duplicate Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleAction('Generate E-Waybill JSON', invoice)}>
                              <FileJson className="mr-2" /> Generate E-Waybill JSON
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-destructive"
                                onSelect={() => handleAction('Cancel', invoice)}
                                disabled={invoice.status === 'Cancelled'}
                            >
                              <Trash2 className="mr-2" /> Cancel Invoice
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
      </Card>
      
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invoice Details: {selectedInvoice.id}</DialogTitle>
                    <DialogDescription>
                        Details for the invoice issued to {selectedInvoice.customer}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Customer:</span>
                        <span>{selectedInvoice.customer}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Invoice Date:</span>
                        <span>{format(new Date(selectedInvoice.date), "dd MMM, yyyy")}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{format(new Date(selectedInvoice.dueDate), "dd MMM, yyyy")}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Status:</span>
                        <div>{getStatusBadge(selectedInvoice.status)}</div>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">₹{selectedInvoice.amount.toFixed(2)}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
