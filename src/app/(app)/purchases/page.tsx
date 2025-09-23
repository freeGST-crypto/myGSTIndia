
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
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, AlertCircle, CheckCircle, Edit, Copy, Trash2, Search } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Input } from "@/components/ui/input";
import { AccountingContext, type JournalVoucher } from "@/context/accounting-context";
import { format, addDays, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Purchase = {
    id: string;
    vendor: string;
    date: string;
    dueDate: string;
    amount: number;
    status: string;
    raw: JournalVoucher;
}

export default function PurchasesPage() {
  const accountingContext = useContext(AccountingContext);
  if (!accountingContext) throw new Error("AccountingContext not found");
  const { journalVouchers, addJournalVoucher, loading } = accountingContext;
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const purchases: Purchase[] = useMemo(() => {
    const allBills = journalVouchers.filter(v => v && v.id && v.id.startsWith("JV-BILL-"));
    const deletedBillIds = new Set(
        journalVouchers
            .filter(v => v && v.reverses && v.reverses.startsWith("JV-BILL-"))
            .map(v => v.reverses)
    );
    
    return allBills
        .map(v => {
            if (!v) return null;
            const isDeleted = deletedBillIds.has(v.id);
            const dueDate = addDays(new Date(v.date), 30);
            const isOverdue = !isDeleted && isPast(dueDate);

            let status = "Pending";
            if (isDeleted) {
                status = "Deleted";
            } else if (isOverdue) {
                status = "Overdue";
            }
            
            return {
                id: v.id,
                vendor: v.narration.replace("Purchase from ", "").split(" against")[0],
                date: v.date,
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                amount: v.amount,
                status: status,
                raw: v,
            }
        })
        .filter((v): v is Purchase => v !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalVouchers]);
  
  const handleDeleteBill = async (billId: string): Promise<boolean> => {
    const originalVoucherId = billId;
    const originalVoucher = journalVouchers.find(v => v.id === originalVoucherId);

    if (!originalVoucher) {
        toast({ variant: "destructive", title: "Error", description: "Original purchase transaction not found." });
        return false;
    }

    const reversalLines = originalVoucher.lines.map(line => ({
        account: line.account,
        debit: line.credit, // Swap debit and credit
        credit: line.debit,
    }));

    const deletionVoucher = {
        id: `JV-DEL-${Date.now()}`,
        reverses: originalVoucherId,
        date: new Date().toISOString().split('T')[0],
        narration: `Deletion of Purchase Bill #${originalVoucherId.replace("JV-", "")}`,
        lines: reversalLines,
        amount: originalVoucher.amount,
        vendorId: originalVoucher.vendorId,
    };

    try {
        await addJournalVoucher(deletionVoucher);
        toast({ title: "Purchase Bill Deleted", description: `Purchase bill #${originalVoucherId.replace("JV-", "")} has been successfully deleted.` });
        return true;
    } catch (e: any) {
        toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
        return false;
    }
  };
  
   const handleAction = async (action: string, purchase: Purchase) => {
        if (action === 'View') {
            setSelectedPurchase(purchase);
        } else if (action === 'Delete') {
            await handleDeleteBill(purchase.id);
        } else if (action === 'Edit') {
             toast({ title: 'Editing Purchase Bill...', description: `Deleting ${purchase.id.replace("JV-", "")} and creating a new draft.` });
            const deleted = await handleDeleteBill(purchase.id);
            if (deleted) {
                const queryParams = new URLSearchParams({
                    edit: purchase.id.replace('JV-', '')
                }).toString();
                router.push(`/purchases/new?${queryParams}`);
            } else {
                 toast({ variant: 'destructive', title: 'Edit Failed', description: `Could not delete the original bill.` });
            }
        }
        else {
            toast({
                title: `Action: ${action}`,
                description: `This would ${action.toLowerCase()} bill ${purchase.id.replace("JV-", "")}. This is a placeholder.`
            });
        }
    }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "deleted":
        return <Badge variant="destructive">Deleted</Badge>;
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

  const totalPayables = useMemo(() => purchases.reduce((acc, p) => (p.status === 'Pending' || p.status === 'Overdue') ? acc + p.amount : acc, 0), [purchases]);
  const totalOverdue = useMemo(() => purchases.reduce((acc, p) => p.status === 'Overdue' ? acc + p.amount : acc, 0), [purchases]);
  const overdueCount = useMemo(() => purchases.filter(p => p.status === 'Overdue').length, [purchases]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          value={`₹${totalPayables.toFixed(2)}`}
          icon={IndianRupee}
          description="Amount to be paid"
          loading={loading}
        />
        <StatCard 
          title="Total Overdue"
          value={`₹${totalOverdue.toFixed(2)}`}
          icon={AlertCircle}
          description={`${overdueCount} bill${overdueCount === 1 ? '' : 's'} overdue`}
          className="text-destructive"
          loading={loading}
        />
        <StatCard 
          title="Paid (Last 30 days)"
          value="₹0.00"
          icon={CheckCircle}
          description="From 0 bills"
          loading={loading}
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
                        <TableCell className="font-medium">{purchase.id.replace("JV-","")}</TableCell>
                        <TableCell>{purchase.vendor}</TableCell>
                        <TableCell>{format(new Date(purchase.date), "dd MMM, yyyy")}</TableCell>
                        <TableCell>{format(new Date(purchase.dueDate), "dd MMM, yyyy")}</TableCell>
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
                                <DropdownMenuItem onSelect={() => handleAction('View', purchase)}>
                                  <FileText className="mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction('Edit', purchase)} disabled={purchase.status === 'Deleted'}>
                                  <Edit className="mr-2" /> Edit Bill
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction('Duplicate', purchase)}>
                                  <Copy className="mr-2" /> Duplicate Bill
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onSelect={() => handleAction('Delete', purchase)} disabled={purchase.status === 'Deleted'}>
                                  <Trash2 className="mr-2" /> Delete Bill
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

      {selectedPurchase && (
        <Dialog open={!!selectedPurchase} onOpenChange={(open) => !open && setSelectedPurchase(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Purchase Bill Details: {selectedPurchase.id.replace("JV-", "")}</DialogTitle>
                    <DialogDescription>
                        Details for the bill received from {selectedPurchase.vendor}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Vendor:</span>
                        <span>{selectedPurchase.vendor}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Bill Date:</span>
                        <span>{format(new Date(selectedPurchase.date), "dd MMM, yyyy")}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{format(new Date(selectedPurchase.dueDate), "dd MMM, yyyy")}</span>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Status:</span>
                        <div>{getStatusBadge(selectedPurchase.status)}</div>
                    </div>
                     <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">₹{selectedPurchase.amount.toFixed(2)}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
