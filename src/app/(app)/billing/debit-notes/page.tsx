
"use client";

import { useState, useMemo, useContext } from "react";
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
import { AccountingContext } from "@/context/accounting-context";
import { format } from "date-fns";

export default function DebitNotesPage() {
  const { journalVouchers } = useContext(AccountingContext)!;
  
  const debitNotes = useMemo(() => {
    return journalVouchers
        .filter(v => v.id.startsWith("JV-DN-"))
        .map(v => {
            const narrationParts = v.narration.split(" issued to ");
            const vendor = narrationParts.length > 1 ? narrationParts[1].split(" against Bill #")[0] : "N/A";
            const originalPurchase = v.id.replace("JV-DN-", "BILL-");

            return {
                id: v.id.replace("JV-", ""),
                vendor,
                date: v.date,
                originalPurchase,
                amount: v.amount,
                status: "Applied", // Logic to be implemented
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalVouchers]);


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
          <h1 className="text-3xl font-bold">Debit Notes</h1>
          <p className="text-muted-foreground">
            Issue and manage debit notes for purchase returns or adjustments.
          </p>
        </div>
        <Link href="/billing/debit-notes/new" passHref>
          <Button>
              <PlusCircle className="mr-2"/>
              New Debit Note
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Debited (30d)"
          value="₹2,000.00"
          icon={IndianRupee}
          description="Total amount for debit notes issued in the last 30 days."
        />
        <StatCard 
          title="Open Debit Notes"
          value="₹800.00"
          icon={FileWarning}
          description="Total value of unapplied debit notes."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debit Note List</CardTitle>
          <CardDescription>
            A list of recently issued debit notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Debit Note #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Original Purchase</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debitNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.id}</TableCell>
                  <TableCell>{note.vendor}</TableCell>
                  <TableCell>{format(new Date(note.date), "dd MMM, yyyy")}</TableCell>
                  <TableCell>{note.originalPurchase}</TableCell>
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
                          Void Debit Note
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

    