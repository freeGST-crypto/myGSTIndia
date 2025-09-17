
"use client";

import { useState } from "react";
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
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, Edit, Download, Trash2, FileWarning } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

const initialCreditNotes = [
  {
    id: "CN-001",
    customer: "Global Tech Inc.",
    date: "2024-05-25",
    originalInvoice: "INV-001",
    amount: 2500.00,
    status: "Applied",
  },
  {
    id: "CN-002",
    customer: "Innovate Solutions",
    date: "2024-05-28",
    originalInvoice: "INV-002",
    amount: 1500.00,
    status: "Open",
  },
  {
    id: "CN-003",
    customer: "Quantum Leap",
    date: "2024-05-15",
    originalInvoice: "INV-003",
    amount: 5000.00,
    status: "Applied",
  },
];

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState(initialCreditNotes);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return <Badge className="bg-green-600 hover:bg-green-700">Applied</Badge>;
      case "open":
        return <Badge variant="secondary">Open</Badge>;
      case "void":
        return <Badge variant="destructive">Void</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Notes</h1>
          <p className="text-muted-foreground">
            Issue and manage credit notes for sales returns or adjustments.
          </p>
        </div>
        <Button disabled>
            <PlusCircle className="mr-2"/>
            New Credit Note
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Credited (30d)"
          value="₹9,000.00"
          icon={IndianRupee}
          description="Total amount for credit notes issued in the last 30 days."
        />
        <StatCard 
          title="Open Credit Notes"
          value="₹1,500.00"
          icon={FileWarning}
          description="Total value of unapplied credit notes."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit Note List</CardTitle>
          <CardDescription>
            A list of recently issued credit notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credit Note #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Original Invoice</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.id}</TableCell>
                  <TableCell>{note.customer}</TableCell>
                  <TableCell>{note.date}</TableCell>
                  <TableCell>{note.originalInvoice}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(note.status)}</TableCell>
                  <TableCell className="text-right">₹{note.amount.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Void Credit Note
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
