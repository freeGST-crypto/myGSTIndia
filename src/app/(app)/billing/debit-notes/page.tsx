
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

type DebitNote = {
    id: string;
    vendor: string;
    date: string;
    originalPurchase: string;
    amount: number;
    status: string;
}

export default function DebitNotesPage() {
  const { journalVouchers, addJournalVoucher, loading } = useContext(AccountingContext)!;
  const { toast } = useToast();
  const [selectedNote, setSelectedNote] = useState<DebitNote | null>(null);
  
  const debitNotes: DebitNote[] = useMemo(() => {
    const allDebitNotes = journalVouchers.filter(v => v && v.id && v.id.startsWith("DN-"));
    const voidedDebitNoteIds = new Set(
        journalVouchers
            .filter(v => v && v.reverses && v.reverses.startsWith("DN-"))
            .map(v => v.reverses)
    );

    return allDebitNotes
        .map(v => {
            const isVoided = voidedDebitNoteIds.has(v.id);
            const vendor = v.narration.split(" issued to ")[1]?.split(" against Bill #")[0] || "N/A";
            const originalPurchase = v.narration.split(" against Bill #")[1] || "N/A";

            return {
                id: v.id,
                vendor,
                date: v.date,
                originalPurchase,
                amount: v.amount,
                status: isVoided ? "Void" : "Applied",
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalVouchers]);

  const totalDebited30d = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return debitNotes.reduce((acc, note) => {
      if (new Date(note.date) >= thirtyDaysAgo && note.status === 'Applied') {
        return acc + note.amount;
      }
      return acc;
    }, 0);
  }, [debitNotes]);


  const handleVoidDebitNote = async (debitNoteId: string) => {
    const originalVoucher = journalVouchers.find(v => v.id === debitNoteId);

    if (!originalVoucher) {
        toast({ variant: "destructive", title: "Error", description: "Original debit note transaction not found." });
        return;
    }

    const reversalLines = originalVoucher.lines.map(line => ({
        account: line.account,
        debit: line.credit, // Swap debit and credit
        credit: line.debit,
    }));

    const voidVoucher = {
        id: `VOID-${debitNoteId}-${Date.now()}`,
        reverses: debitNoteId,
        date: new Date().toISOString().split('T')[0],
        narration: `Voiding of Debit Note #${debitNoteId}`,
        lines: reversalLines,
        amount: originalVoucher.amount,
        vendorId: originalVoucher.vendorId,
    };

    try {
        await addJournalVoucher(voidVoucher);
        toast({ title: "Debit Note Voided", description: `Debit Note #${debitNoteId} has been successfully voided.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Voiding Failed", description: e.message });
    }
  };

  const handleDownloadPdf = (note: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("DEBIT NOTE", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Debit Note #: ${note.id}`, 14, 40);
    doc.text(`Date: ${format(new Date(note.date), "dd MMM, yyyy")}`, 14, 46);
    doc.text(`Original Purchase Bill: ${note.originalPurchase}`, 14, 52);
    doc.text(`Vendor: ${note.vendor}`, 14, 60);
    doc.text(`Amount: Rs. ${note.amount.toFixed(2)}`, 14, 70);
    doc.save(`DebitNote_${note.id}.pdf`);
    toast({ title: "Download Started", description: `Downloading PDF for debit note ${note.id}.` });
  };
  
   const handleAction = (action: string, note: DebitNote) => {
      if (action === 'View') {
        setSelectedNote(note);
      } else if (action === 'Void') {
        handleVoidDebitNote(note.id);
      } else if (action === 'Download') {
        handleDownloadPdf(note);
      } else {
        toast({
            title: `Action: ${action}`,
            description: `This would ${action.toLowerCase()} Debit Note ${note.id}. This is a placeholder.`
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
          value={`₹${totalDebited30d.toFixed(2)}`}
          icon={IndianRupee}
          description="Total amount for debit notes issued in the last 30 days."
          loading={loading}
        />
        <StatCard 
          title="Open Debit Notes"
          value="₹0.00"
          icon={FileWarning}
          description="Total value of unapplied debit notes."
          loading={loading}
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
      
      {selectedNote && (
        <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Debit Note Details: {selectedNote.id}</DialogTitle>
                    <DialogDescription>
                        Details for the debit note issued to {selectedNote.vendor}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Vendor:</span>
                        <span>{selectedNote.vendor}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{format(new Date(selectedNote.date), "dd MMM, yyyy")}</span>
                    </div>
                    <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Original Purchase:</span>
                        <span>{selectedNote.originalPurchase}</span>
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
