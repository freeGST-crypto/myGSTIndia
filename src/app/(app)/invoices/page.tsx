
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, AlertCircle, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

const initialInvoices = [
  {
    id: "INV-001",
    customer: "Global Tech Inc.",
    date: "2024-05-15",
    dueDate: "2024-06-14",
    amount: 25000.00,
    status: "Paid",
  },
  {
    id: "INV-002",
    customer: "Innovate Solutions",
    date: "2024-05-20",
    dueDate: "2024-06-19",
    amount: 15000.00,
    status: "Pending",
  },
  {
    id: "INV-003",
    customer: "Quantum Leap",
    date: "2024-04-10",
    dueDate: "2024-05-10",
    amount: 35000.00,
    status: "Overdue",
  },
    {
    id: "INV-004",
    customer: "Synergy Corp",
    date: "2024-05-25",
    dueDate: "2024-06-24",
    amount: 45000.00,
    status: "Pending",
  },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(initialInvoices);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage your sales invoices.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2"/>
          Create New Invoice
        </Button>
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
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            Here is a list of your most recent invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                   <TableCell>{invoice.dueDate}</TableCell>
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
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
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
