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
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, AlertCircle, CheckCircle, Edit, Copy, Trash2, Search } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Input } from "@/components/ui/input";

const initialPurchases = [
  {
    id: "PUR-001",
    vendor: "Supplier Alpha",
    date: "2024-05-18",
    dueDate: "2024-06-17",
    amount: 8500.00,
    status: "Paid",
  },
  {
    id: "PUR-002",
    vendor: "Vendor Beta",
    date: "2024-05-22",
    dueDate: "2024-06-21",
    amount: 12000.00,
    status: "Pending",
  },
  {
    id: "PUR-003",
    vendor: "Supplier Gamma",
    date: "2024-04-12",
    dueDate: "2024-05-12",
    amount: 7500.00,
    status: "Overdue",
  },
  {
    id: "PUR-004",
    vendor: "Vendor Delta",
    date: "2024-05-28",
    dueDate: "2024-06-27",
    amount: 21000.00,
    status: "Pending",
  },
];

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPurchases = useMemo(() => {
    if (!searchTerm) return purchases;
    return purchases.filter(purchase =>
        purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">
            Manage your purchase bills and payments.
          </p>
        </div>
        <Link href="/purchases/new" passHref>
          <Button>
            <PlusCircle className="mr-2"/>
            Add Purchase Bill
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Payables"
          value="₹33,000.00"
          icon={IndianRupee}
          description="Amount to be paid"
        />
        <StatCard 
          title="Total Overdue"
          value="₹7,500.00"
          icon={AlertCircle}
          description="1 bill overdue"
          className="text-destructive"
        />
        <StatCard 
          title="Paid (Last 30 days)"
          value="₹8,500.00"
          icon={CheckCircle}
          description="From 1 bill"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Bill List</CardTitle>
          <CardDescription>
            Here is a list of your most recent purchase bills.
          </CardDescription>
          <div className="relative pt-4">
                <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by Bill # or Vendor..."
                  className="pl-8 sm:w-full md:w-1/3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{purchase.vendor}</TableCell>
                  <TableCell>{purchase.date}</TableCell>
                   <TableCell>{purchase.dueDate}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell className="text-right">₹{purchase.amount.toFixed(2)}</TableCell>
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
                          <FileText />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit />
                          Edit Bill
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy />
                          Duplicate Bill
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 />
                          Delete Bill
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
