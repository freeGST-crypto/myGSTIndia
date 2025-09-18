
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, AlertCircle, CheckCircle, Edit, Download, Copy, Trash2, Search, FileCog, Truck } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

const initialPurchaseOrders = [
  {
    id: "PO-001",
    vendor: "Supplier Alpha",
    date: "2024-06-01",
    expectedDate: "2024-06-15",
    amount: 17700.00,
    status: "Ordered",
  },
  {
    id: "PO-002",
    vendor: "Vendor Beta",
    date: "2024-06-03",
    expectedDate: "2024-06-20",
    amount: 29500.00,
    status: "Partial",
  },
  {
    id: "PO-003",
    vendor: "Supplier Gamma",
    date: "2024-05-20",
    expectedDate: "2024-06-05",
    amount: 9440.00,
    status: "Billed",
  },
];

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

 const handleDownloadPdf = (po: typeof initialPurchaseOrders[0]) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PURCHASE ORDER", 105, 20, { align: "center" });

    // Company Details (Buyer)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("GSTEase Solutions Pvt. Ltd.", 14, 30);
    doc.setFont("helvetica", "normal");
    doc.text("123 Business Avenue, Commerce City, Maharashtra - 400001", 14, 36);
    doc.text("GSTIN: 27ABCDE1234F1Z5", 14, 42);

    // PO Details
    doc.setFontSize(11);
    doc.text(`PO Number: ${po.id}`, 200, 30, { align: "right" });
    doc.text(`Date: ${po.date}`, 200, 36, { align: "right" });
    doc.text(`Expected: ${po.expectedDate}`, 200, 42, { align: "right" });

    // Vendor and Shipping Details
    doc.rect(14, 50, 182, 30); // Box around details
    doc.setFont("helvetica", "bold");
    doc.text("VENDOR:", 20, 56);
    doc.setFont("helvetica", "normal");
    doc.text(po.vendor, 20, 62);
    doc.text("123 Industrial Estate, Supplier City", 20, 68);

    doc.line(105, 50, 105, 80); // Vertical line separator

    doc.setFont("helvetica", "bold");
    doc.text("SHIP TO:", 110, 56);
    doc.setFont("helvetica", "normal");
    doc.text("GSTEase Solutions - Warehouse", 110, 62);
    doc.text("456 Logistics Hub, Commerce City", 110, 68);

    // Items Table
    const tableColumn = ["Sr.", "Item Description", "HSN/SAC", "Qty", "Rate (INR)", "Taxable Value (INR)", "GST Rate", "GST Amt (INR)", "Total (INR)"];
    // Mock Data for PDF
    const taxableValue1 = 10000;
    const gst1 = taxableValue1 * 0.18;
    const total1 = taxableValue1 + gst1;
    
    const taxableValue2 = 5000;
    const gst2 = taxableValue2 * 0.18;
    const total2 = taxableValue2 + gst2;

    const tableRows = [
        ["1", "Sample Item A", "9982", "2", "5,000.00", taxableValue1.toFixed(2), "18%", gst1.toFixed(2), total1.toFixed(2)],
        ["2", "Sample Component B", "8471", "5", "1,000.00", taxableValue2.toFixed(2), "18%", gst2.toFixed(2), total2.toFixed(2)],
    ];
    
    const subtotal = taxableValue1 + taxableValue2;
    const totalGst = gst1 + gst2;
    const total = subtotal + totalGst;

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    let finalY = (doc.autoTable as any).previous.finalY;
    
    if (finalY === undefined) {
        finalY = 85 + (tableRows.length + 1) * 10; // estimate if not available
    }

    doc.setFontSize(10);
    doc.text("Subtotal:", 140, finalY + 8);
    doc.text(subtotal.toFixed(2), 200, finalY + 8, { align: "right" });
    doc.text("Total GST:", 140, finalY + 14);
    doc.text(totalGst.toFixed(2), 200, finalY + 14, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 140, finalY + 20);
    doc.text(`Rs. ${total.toFixed(2)}`, 200, finalY + 20, { align: "right" });


    // Terms and Conditions
    finalY += 30; // space
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", 14, finalY);
    doc.setFont("helvetica", "normal");
    const terms = [
        "1. Delivery: Goods to be delivered to the 'SHIP TO' address by the expected date.",
        "2. Payment: Payment will be made within 30 days of receipt of a valid tax invoice.",
        "3. Quality: All goods are subject to inspection and approval by the Buyer.",
        "4. Cancellation: The Buyer reserves the right to cancel this PO for any undelivered goods.",
        "5. This is a computer-generated document and does not require a physical signature."
    ];
    doc.text(terms, 14, finalY + 6);
    
    // Footer
    finalY = doc.internal.pageSize.height - 30;
    doc.line(14, finalY, 200, finalY);
    doc.text("For GSTEase Solutions Pvt. Ltd.", 140, finalY + 8);
    doc.text("Authorised Signatory", 140, finalY + 20);

    doc.save(`PO_${po.id}.pdf`);
    toast({ title: "Download Started", description: `PO ${po.id}.pdf is downloading.` });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "billed":
        return <Badge className="bg-green-600 hover:bg-green-700">Billed</Badge>;
      case "ordered":
        return <Badge variant="secondary">Ordered</Badge>;
      case "partial":
        return <Badge variant="destructive">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPOs = useMemo(() => {
    if (!searchTerm) return purchaseOrders;
    return purchaseOrders.filter(po =>
        po.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchaseOrders, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Create and track orders placed with your vendors.
          </p>
        </div>
        <Link href="/purchases/purchase-orders/new" passHref>
          <Button>
            <PlusCircle className="mr-2"/>
            New Purchase Order
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Open POs"
          value="₹40,000.00"
          icon={Truck}
          description="Total value of open and partial orders"
        />
        <StatCard 
          title="POs Raised (30d)"
          value="₹48,000.00"
          icon={FileText}
          description="Total value of POs created this month"
        />
        <StatCard 
          title="Converted to Bills (30d)"
          value="₹8,000.00"
          icon={CheckCircle}
          description="POs that have been fully billed"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order List</CardTitle>
          <CardDescription>
            A list of all purchase orders you've created.
          </CardDescription>
           <div className="relative pt-4">
                <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by PO # or Vendor..."
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
                    <TableHead>PO #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expected On</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.id}</TableCell>
                    <TableCell>{po.vendor}</TableCell>
                    <TableCell>{po.date}</TableCell>
                    <TableCell>{po.expectedDate}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(po.status)}</TableCell>
                    <TableCell className="text-right">₹{po.amount.toFixed(2)}</TableCell>
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
                            <Edit />
                            Edit PO
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                            <FileText />
                            Convert to Bill
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDownloadPdf(po)}>
                            <Download />
                            Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                            <Trash2 />
                            Cancel PO
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
    </div>
  );
}
