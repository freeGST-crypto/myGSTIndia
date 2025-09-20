
"use client";

import { useState, useMemo, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, AlertCircle, CheckCircle, Edit, Download, Copy, Trash2, Zap, Search, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isPast, subDays } from 'date-fns';
import { AccountingContext, type JournalVoucher } from "@/context/accounting-context";
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

type Invoice = {
  id: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  raw: JournalVoucher;
}

const numberToWords = (num: number): string => {
    const a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    const b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if (!num) return 'Zero';
    if ((num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (parseInt(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (parseInt(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (parseInt(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (parseInt(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (parseInt(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim().charAt(0).toUpperCase() + str.trim().slice(1) + " Only";
}

export default function InvoicesPage() {
  const { journalVouchers, addJournalVoucher, loading: journalLoading } = useContext(AccountingContext)!;
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // State for the quick invoice form
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState(false);
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

  const invoices: Invoice[] = useMemo(() => {
    const salesInvoices = journalVouchers.filter(v => v && v.id && v.id.startsWith("JV-INV-"));
    const cancelledInvoiceIds = new Set(
        journalVouchers
            .filter(v => v && v.reverses && v.reverses.startsWith("JV-INV-"))
            .map(v => v.reverses)
    );

    return salesInvoices
        .map(v => {
            if (!v) return null;
            const isCancelled = cancelledInvoiceIds.has(v.id);
            const dueDate = addDays(new Date(v.date), 30);
            const isOverdue = !isCancelled && isPast(dueDate);
            
            let status = "Pending";
            if (isCancelled) {
                status = "Cancelled";
            } else if (isOverdue) {
                status = "Overdue";
            }
            
            return {
                id: v.id.replace("JV-", ""),
                customer: v.narration.replace("Sale to ", "").split(" via")[0],
                date: v.date,
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                amount: v.amount,
                status: status,
                raw: v,
            }
        })
        .filter((v): v is Invoice => v !== null)
        .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());
  }, [journalVouchers]);


  const handleQuickInvoiceCreate = async () => {
    const selectedCustomer = customers.find((c: any) => c.id === quickCustomer);
    if (!quickInvNum || !selectedCustomer || !quickItem || quickRate <= 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields for the quick invoice.",
      });
      return;
    }
    
    const subtotal = quickQty * quickRate;
    const tax = subtotal * 0.18; // Assuming 18% tax for simplicity
    const totalAmount = subtotal + tax;

    const journalLines = [
        { account: selectedCustomer.id, debit: totalAmount.toFixed(2), credit: '0' },
        { account: '4010', debit: '0', credit: subtotal.toFixed(2) },
        { account: '2110', debit: '0', credit: tax.toFixed(2) }
    ];

    try {
      await addJournalVoucher({
            id: `JV-INV-${quickInvNum}`,
            date: new Date().toISOString().split('T')[0],
            narration: `Sale to ${selectedCustomer.name} via Invoice #${quickInvNum}`,
            lines: journalLines,
            amount: totalAmount,
            customerId: quickCustomer,
        });

        toast({
            title: "Quick Invoice Created!",
            description: `Invoice ${quickInvNum} has been created and recorded.`
        });

        // Reset form
        setQuickInvNum("");
        setQuickCustomer("");
        setQuickItem(null);
        setQuickQty(1);
        setQuickRate(0);
        setIsQuickInvoiceOpen(false);

    } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to save invoice", description: e.message });
    }
  }

  const handleQuickItemChange = (itemId: string) => {
    const selectedItem = items.find((i: any) => i.id === itemId);
    if(selectedItem) {
        setQuickItem(selectedItem as any);
        setQuickRate((selectedItem as any).sellingPrice);
    }
  }

    const handleCancelInvoice = async (invoiceId: string) => {
        const originalVoucherId = `JV-${invoiceId}`;
        const originalVoucher = journalVouchers.find(v => v.id === originalVoucherId);

        if (!originalVoucher) {
            toast({ variant: "destructive", title: "Error", description: "Original invoice transaction not found." });
            return false;
        }

        // Create the reversal entry
        const reversalLines = originalVoucher.lines.map(line => ({
            account: line.account,
            debit: line.credit, // Swap debit and credit
            credit: line.debit,
        }));

        const cancellationVoucher = {
            id: `JV-CNL-${Date.now()}`,
            reverses: originalVoucherId,
            date: new Date().toISOString().split('T')[0],
            narration: `Cancellation of Invoice #${invoiceId}`,
            lines: reversalLines,
            amount: originalVoucher.amount,
            customerId: originalVoucher.customerId,
        };

        try {
            await addJournalVoucher(cancellationVoucher);
            toast({ title: "Invoice Cancelled", description: `Invoice #${invoiceId} has been successfully cancelled.` });
            return true;
        } catch (e: any) {
            toast({ variant: "destructive", title: "Cancellation Failed", description: e.message });
            return false;
        }
    };
    
    const handleShare = async (invoice: Invoice) => {
        const pdfBlob = handleDownloadPdf(invoice, true); // Get PDF as Blob
        if (!pdfBlob) {
            toast({ variant: 'destructive', title: 'Failed to generate PDF' });
            return;
        }

        const message = `Dear ${invoice.customer},\n\nPlease find attached the invoice for your reference:\n\nInvoice No: ${invoice.id}\nAmount: ₹${invoice.amount.toFixed(2)}\nDue Date: ${format(new Date(invoice.dueDate), "dd MMM, yyyy")}\n\nThank you,\n${companyInfo.name}`;
        const pdfFile = new File([pdfBlob], `Invoice_${invoice.id}.pdf`, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share({
                    title: `Invoice ${invoice.id}`,
                    text: message,
                    files: [pdfFile],
                });
                toast({ title: 'Shared Successfully!' });
            } catch (error) {
                console.error('Share failed:', error);
                toast({ variant: 'destructive', title: 'Share Failed', description: 'Could not share the invoice. Please try downloading it instead.' });
            }
        } else {
            // Fallback for browsers that don't support file sharing
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            toast({
                title: "PDF Downloaded",
                description: "Your PDF has been downloaded. Please attach it to your WhatsApp message manually.",
                duration: 8000,
            });
            handleDownloadPdf(invoice, false); // Trigger direct download as fallback
        }
    }
    
    const companyInfo = {
        name: "GSTEase Solutions Pvt. Ltd.",
    };
    
    const handleAction = async (action: string, invoice: Invoice) => {
        if (action === 'View') {
            setSelectedInvoice(invoice);
        } else if (action === 'Cancel') {
            await handleCancelInvoice(invoice.id);
        } else if (action === 'Download') {
            handleDownloadPdf(invoice, false);
        } else if (action === 'Share') {
            await handleShare(invoice);
        } else if (action === 'Duplicate') {
            const queryParams = new URLSearchParams({
                duplicate: invoice.id
            }).toString();
            router.push(`/billing/invoices/new?${queryParams}`);
        } else if (action === 'Edit') {
            toast({ title: 'Editing Invoice...', description: `Cancelling ${invoice.id} and creating a new draft.` });
            const cancelled = await handleCancelInvoice(invoice.id);
            if (cancelled) {
                const queryParams = new URLSearchParams({
                    edit: invoice.id
                }).toString();
                router.push(`/billing/invoices/new?${queryParams}`);
            } else {
                 toast({ variant: 'destructive', title: 'Edit Failed', description: `Could not cancel the original invoice.` });
            }
        } else {
            toast({
                title: `Action: ${action}`,
                description: `This would ${action.toLowerCase()} invoice ${invoice.id}. This is a placeholder.`
            });
        }
    }

  const handleDownloadPdf = (invoice: Invoice, silent: boolean = false): Blob | null => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let finalY = 15;

    const customerDetails = customers.find((c: any) => c.id === invoice.raw.customerId) as any;
    const companyDetails = { name: "GSTEase Solutions Pvt. Ltd.", address: "123 Business Avenue, Commerce City, Maharashtra - 400001", gstin: "27ABCDE1234F1Z5", pan: "ABCDE1234F" }; // Mock data

    // --- Header ---
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(65, 0, 135); // Dark Purple from theme
    doc.text("TAX INVOICE", pageWidth / 2, finalY, { align: "center" });
    doc.setTextColor(0, 0, 0); // Reset color
    finalY += 10;
    
    // --- Seller/Buyer Details ---
    doc.autoTable({
        body: [
            [
                { content: companyDetails.name, styles: { font: 'helvetica', fontStyle: 'bold', fontSize: 10 } },
                { content: customerDetails?.name || invoice.customer, styles: { font: 'helvetica', fontStyle: 'bold', fontSize: 10, halign: 'right' } }
            ],
            [
                { content: companyDetails.address, styles: { fontSize: 9 } },
                { content: customerDetails?.address1 || 'N/A', styles: { fontSize: 9, halign: 'right' } }
            ],
             [
                { content: `GSTIN: ${companyDetails.gstin}`, styles: { fontSize: 9 } },
                { content: `GSTIN: ${customerDetails?.gstin || "Unregistered"}`, styles: { fontSize: 9, halign: 'right' } }
            ],
        ],
        startY: finalY,
        theme: 'plain',
        styles: { cellPadding: 1 },
    });
    finalY = (doc as any).lastAutoTable.finalY + 5;
    
    // --- Bill To / Ship To and Invoice Meta ---
    const billToAddress = `${customerDetails?.name || invoice.customer}\n${customerDetails?.address1 || 'N/A'}\nGSTIN: ${customerDetails?.gstin || "Unregistered"}`;
    doc.autoTable({
        head: [['Bill To:', 'Ship To:']],
        body: [[billToAddress, billToAddress]],
        startY: finalY,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1, lineColor: [200, 200, 200] },
        tableWidth: 'auto',
        margin: { right: pageWidth - 105 } // Limit width
    });
    
    doc.autoTable({
        body: [
            [{ content: 'Invoice No:', styles: { fontStyle: 'bold' } }, invoice.id],
            [{ content: 'Invoice Date:', styles: { fontStyle: 'bold' } }, format(new Date(invoice.date), "dd-MMM-yyyy")],
            [{ content: 'Due Date:', styles: { fontStyle: 'bold' } }, format(new Date(invoice.dueDate), "dd-MMM-yyyy")],
        ],
        startY: finalY,
        theme: 'plain',
        tableWidth: 'auto',
        styles: { fontSize: 9, cellPadding: 1.5, halign: 'right' },
        margin: { left: 110 }
    });
    finalY = (doc as any).lastAutoTable.finalY + 8;
    
    // --- Items Table ---
    const salesLine = invoice.raw.lines.find(l => l.account === '4010');
    const taxLine = invoice.raw.lines.find(l => l.account === '2110');
    const subtotal = parseFloat(salesLine?.credit || '0');
    const taxAmount = parseFloat(taxLine?.credit || '0');
    const taxRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;
    
    const tableBody = [[
        1,
        "Service as per narration",
        "9983",
        1,
        subtotal.toFixed(2),
        subtotal.toFixed(2),
        taxRate.toFixed(2) + '%',
        taxAmount.toFixed(2),
        invoice.amount.toFixed(2),
    ]];

    doc.autoTable({
        head: [['#', 'Item & Description', 'HSN', 'Qty', 'Rate', 'Taxable Value', 'Tax Rate', 'Tax Amt', 'Total']],
        body: tableBody,
        startY: finalY,
        theme: 'striped',
        headStyles: { fillColor: [65, 0, 135], textColor: 255 }, // Dark purple
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 10, halign: 'right' },
            4: { cellWidth: 20, halign: 'right' },
            5: { cellWidth: 22, halign: 'right' },
            6: { cellWidth: 15, halign: 'right' },
            7: { cellWidth: 20, halign: 'right' },
            8: { cellWidth: 22, halign: 'right' },
        }
    });
    finalY = (doc as any).lastAutoTable.finalY;

    // --- Totals Section ---
    const totalsBody = [
        ['Subtotal', subtotal.toFixed(2)],
        [`IGST @ ${taxRate.toFixed(2)}%`, taxAmount.toFixed(2)],
        [{ content: 'Grand Total', styles: { fontStyle: 'bold' } }, { content: `Rs. ${invoice.amount.toFixed(2)}`, styles: { fontStyle: 'bold' } }]
    ];
    
    doc.autoTable({
        body: totalsBody,
        startY: finalY + 5,
        margin: { left: pageWidth / 2 + 15 },
        theme: 'plain',
        tableWidth: 'auto',
        styles: { fontSize: 10, cellPadding: 2, halign: 'right' },
    });
    finalY = (doc as any).lastAutoTable.finalY;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Amount in words: ${numberToWords(invoice.amount)}`, 14, finalY + 10);
    
    // --- Signature section ---
    let signatureY = pageHeight - 50; // Position higher up
    if (finalY + 40 > signatureY) { // Check if content overlaps
        signatureY = finalY + 20;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`For ${companyDetails.name}`, pageWidth - 14, signatureY, { align: 'right' });
    doc.text("Authorised Signatory", pageWidth - 14, signatureY + 15, { align: 'right' });


    // --- Footer section ---
    const footerY = pageHeight - 20;
    doc.line(14, footerY, pageWidth - 14, footerY); // Line above footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Details:", 14, footerY + 8);
    doc.setFont("helvetica", "normal");
    doc.text("Bank: HDFC Bank | A/c No: 1234567890 | IFSC: HDFC0001234", 14, footerY + 13);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("This is a GSTEase Generated Invoice.", pageWidth / 2, pageHeight - 8, { align: 'center'});

    if (silent) {
        return doc.output('blob');
    } else {
        doc.save(`Invoice_${invoice.id}.pdf`);
        toast({ title: "Download Started", description: `Downloading PDF for invoice ${invoice.id}.`});
        return null;
    }
  };


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
  
  const totalOutstanding = useMemo(() => invoices.reduce((acc, inv) => (inv.status === 'Pending' || inv.status === 'Overdue') ? acc + inv.amount : acc, 0), [invoices]);
  const totalOverdue = useMemo(() => invoices.reduce((acc, inv) => inv.status === 'Overdue' ? acc + inv.amount : acc, 0), [invoices]);
  const overdueCount = useMemo(() => invoices.filter(inv => inv.status === 'Overdue').length, [invoices]);
  
  const paidLast30Days = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    // Placeholder logic since we don't track payments yet
    return 0;
  }, [journalVouchers]);


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
            <Button variant="outline" onClick={() => setIsQuickInvoiceOpen(true)}>
                <Zap className="mr-2"/>
                Quick Invoice
            </Button>
            <Link href="/billing/invoices/new" passHref>
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
          value={`₹${totalOutstanding.toFixed(2)}`}
          icon={IndianRupee}
          description="Amount yet to be received"
          loading={journalLoading}
        />
        <StatCard 
          title="Total Overdue"
          value={`₹${totalOverdue.toFixed(2)}`}
          icon={AlertCircle}
          description={`${overdueCount} invoice${overdueCount === 1 ? '' : 's'} overdue`}
          className="text-destructive"
          loading={journalLoading}
        />
        <StatCard 
          title="Paid (Last 30 days)"
          value={`₹${paidLast30Days.toFixed(2)}`}
          icon={CheckCircle}
          description="From 0 invoices"
          loading={journalLoading}
        />
      </div>

       <Dialog open={isQuickInvoiceOpen} onOpenChange={setIsQuickInvoiceOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Quick Invoice</DialogTitle>
                    <DialogDescription>Create a simple invoice with just the essentials.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="quick-inv-num">Invoice #</Label>
                        <Input id="quick-inv-num" placeholder="INV-005" value={quickInvNum} onChange={e => setQuickInvNum(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quick-customer">Customer</Label>
                        <Select value={quickCustomer} onValueChange={setQuickCustomer} disabled={customersLoading}>
                            <SelectTrigger id="quick-customer"><SelectValue placeholder={customersLoading ? "Loading..." : "Select customer"} /></SelectTrigger>
                            <SelectContent>{customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quick-item">Item</Label>
                        <Select value={quickItem?.id || ""} onValueChange={handleQuickItemChange} disabled={itemsLoading}>
                            <SelectTrigger id="quick-item"><SelectValue placeholder={itemsLoading ? "Loading..." : "Select item"} /></SelectTrigger>
                            <SelectContent>{items.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quick-qty">Qty</Label>
                            <Input id="quick-qty" type="number" placeholder="1" value={quickQty} onChange={e => setQuickQty(parseInt(e.target.value) || 1)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quick-rate">Rate (₹)</Label>
                            <Input id="quick-rate" type="number" placeholder="0.00" value={quickRate} onChange={e => setQuickRate(parseFloat(e.target.value) || 0)} />
                        </div>
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleQuickInvoiceCreate}>Create Quick Invoice</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

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
                            <DropdownMenuItem onSelect={() => handleAction('Share', invoice)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Share on WhatsApp
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleAction('Edit', invoice)} disabled={invoice.status === 'Cancelled'}>
                              <Edit className="mr-2" /> Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAction('Download', invoice)}>
                              <Download className="mr-2" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAction('Duplicate', invoice)}>
                              <Copy className="mr-2" /> Duplicate Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => handleAction('Cancel', invoice)} disabled={invoice.status === 'Cancelled'}>
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
