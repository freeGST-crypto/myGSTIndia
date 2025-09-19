
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

type CreditNote = {
    id: string;
    customer: string;
    date: string;
    originalInvoice: string;
    amount: number;
    status: string;
}

export default function CreditNotesPage() {
  const { journalVouchers, addJournalVoucher, loading } = useContext(AccountingContext)!;
  const { toast } = useToast();
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null);
  
  const creditNotes: CreditNote[] = useMemo(() => {
    const allCreditNotes = journalVouchers.filter(v => v.id.startsWith("JV-CN-"));
    const voidedCreditNoteIds = new Set(
        journalVouchers
            .filter(v => v.reverses?.startsWith("JV-CN-"))
            .map(v => v.reverses)
    );
    
    return allCreditNotes
        .map(v => {
            const isVoided = voidedCreditNoteIds.has(v.id);
            const customer = v.narration.split(" issued to ")[1]?.split(" against ")[0] || "N/A";
            const originalInvoice = v.narration.split(" against Invoice #")[1] || "N/A";

            return {
                id: v.id.replace("JV-", ""),
                customer,
                date: v.date,
                originalInvoice,
                amount: v.amount,
                status: isVoided ? "Void" : "Applied",
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalVouchers]);

  const totalCredited30d = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return creditNotes.reduce((acc, note) => {
      if (new Date(note.date) >= thirtyDaysAgo && note.status === 'Applied') {
        return acc + note.amount;
      }
      return acc;
    }, 0);
  }, [creditNotes]);

  const handleVoidCreditNote = async (creditNoteId: string) => {
    const originalVoucherId = `JV-${creditNoteId}`;
    const originalVoucher = journalVouchers.find(v => v.id === originalVoucherId);

    if (!originalVoucher) {
        toast({ variant: "destructive", title: "Error", description: "Original credit note transaction not found." });
        return;
    }

    const reversalLines = originalVoucher.lines.map(line => ({
        account: line.account,
        debit: line.credit, // Swap debit and credit
        credit: line.debit,
    }));

    const voidVoucher = {
        id: `JV-VOID-CN-${Date.now()}`,
        reverses: originalVoucherId,
        date: new Date().toISOString().split('T')[0],
        narration: `Voiding of Credit Note #${creditNoteId}`,
        lines: reversalLines,
        amount: originalVoucher.amount,
        customerId: originalVoucher.customerId,
    };

    try {
        await addJournalVoucher(voidVoucher);
        toast({ title: "Credit Note Voided", description: `Credit Note #${creditNoteId} has been successfully voided.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Voiding Failed", description: e.message });
    }
  };

  const handleDownloadPdf = (note: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("CREDIT NOTE", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Credit Note #: ${note.id}`, 14, 40);
    doc.text(`Date: ${format(new Date(note.date), "dd MMM, yyyy")}`, 14, 46);
    doc.text(`Original Invoice: ${note.originalInvoice}`, 14, 52);
    doc.text(`Customer: ${note.customer}`, 14, 60);
    doc.text(`Amount: Rs. ${note.amount.toFixed(2)}`, 14, 70);
    doc.save(`CreditNote_${note.id}.pdf`);
    toast({ title: "Download Started", description: `Downloading PDF for credit note ${note.id}.` });
  };
  
  const handleAction = (action: string, note: CreditNote) => {
      if (action === 'View') {
        setSelectedNote(note);
      } else if (action === 'Void') {
        handleVoidCreditNote(note.id);
      } else if (action === 'Download') {
        handleDownloadPdf(note);
      } else {
        toast({
            title: `Action: ${action}`,
            description: `This would ${action.toLowerCase()} Credit Note ${note.id}. This is a placeholder.`
        });
      }
  };

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
        <Link href="/billing/credit-notes/new" passHref>
          <Button>
              <PlusCircle className="mr-2"/>
              New Credit Note
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Credited (30d)"
          value={`₹${totalCredited30d.toFixed(2)}`}
          icon={IndianRupee}
          description="Total amount for credit notes issued in the last 30 days."
          loading={loading}
        />
        <StatCard 
          title="Open Credit Notes"
          value="₹0.00"
          icon={FileWarning}
          description="Total value of unapplied credit notes."
          loading={loading}
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
                  <TableCell>{format(new Date(note.date), "dd MMM, yyyy")}</TableCell>
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
                        <DropdownMenuItem onSelect={() => handleAction('View', note)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction('Edit', note)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => handleAction('Download', note)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onSelect={() => handleAction('Void', note)}
                            disabled={note.status === 'Void'}
                        >
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
      
      {selectedNote && (
        <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Credit Note Details: {selectedNote.id}</DialogTitle>
                    <DialogDescription>
                        Details for the credit note issued to {selectedNote.customer}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Customer:</span>
                        <span>{selectedNote.customer}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{format(new Date(selectedNote.date), "dd MMM, yyyy")}</span>
                    </div>
                    <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Original Invoice:</span>
                        <span>{selectedNote.originalInvoice}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Status:</span>
                        <div>{getStatusBadge(selectedNote.status)}</div>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">₹{selectedNote.amount.toFixed(2)}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
