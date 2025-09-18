
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
    amount: 15000.00,
    status: "Ordered",
  },
  {
    id: "PO-002",
    vendor: "Vendor Beta",
    date: "2024-06-03",
    expectedDate: "2024-06-20",
    amount: 25000.00,
    status: "Partial",
  },
  {
    id: "PO-003",
    vendor: "Supplier Gamma",
    date: "2024-05-20",
    expectedDate: "2024-06-05",
    amount: 8000.00,
    status: "Billed",
  },
];

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleDownloadPdf = (po: typeof initialPurchaseOrders[0]) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Purchase Order", 14, 22);

    doc.setFontSize(12);
    doc.text(`PO #: ${po.id}`, 14, 32);
    doc.text(`Date: ${po.date}`, 14, 38);
    doc.text(`Expected: ${po.expectedDate}`, 14, 44);

    doc.text(`Vendor: ${po.vendor}`, 150, 32);

    doc.autoTable({
        startY: 60,
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: [
            ['Sample Item 1', '2', '5000', '10000'],
            ['Sample Item 2', '1', '5000', '5000'],
        ],
        foot: [['', '', 'Total', po.amount.toFixed(2)]],
        theme: 'striped',
    });

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
