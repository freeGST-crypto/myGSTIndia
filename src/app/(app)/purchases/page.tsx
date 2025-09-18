
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
import { PlusCircle, MoreHorizontal, FileText, IndianRupee, AlertCircle, CheckCircle, Edit, Copy, Trash2, Search } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Input } from "@/components/ui/input";
import { AccountingContext } from "@/context/accounting-context";
import { format, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PurchasesPage() {
  const { journalVouchers, addJournalVoucher } = useContext(AccountingContext)!;
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const purchases = useMemo(() => {
    const allBills = journalVouchers.filter(v => v.id.startsWith("JV-BILL-"));
    const deletedBillIds = new Set(
      journalVouchers
        .filter(v => v.id.startsWith("JV-DEL-BILL-"))
        .map(v => v.id.replace("JV-DEL-", ""))
    );
    
    return allBills
        .filter(bill => !deletedBillIds.has(bill.id.replace("JV-", "")))
        .map(v => ({
            id: v.id.replace("JV-", ""),
            vendor: v.narration.replace("Purchase from ", "").split(" against")[0],
            date: v.date,
            dueDate: format(addDays(new Date(v.date), 30), 'yyyy-MM-dd'),
            amount: v.amount,
            status: "Pending", // Status logic to be implemented later
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalVouchers]);
  
  const handleDeleteBill = async (billId: string) => {
    const originalVoucherId = `JV-${billId}`;
    const originalVoucher = journalVouchers.find(v => v.id === originalVoucherId);

    if (!originalVoucher) {
        toast({ variant: "destructive", title: "Error", description: "Original purchase transaction not found." });
        return;
    }

    const reversalLines = originalVoucher.lines.map(line => ({
        account: line.account,
        debit: line.credit, // Swap debit and credit
        credit: line.debit,
    }));

    const deletionVoucher = {
        id: `JV-DEL-${billId}`,
        date: new Date().toISOString().split('T')[0],
        narration: `Deletion of Purchase Bill #${billId}`,
        lines: reversalLines,
        amount: originalVoucher.amount,
        vendorId: originalVoucher.vendorId,
    };

    try {
        await addJournalVoucher(deletionVoucher);
        toast({ title: "Purchase Bill Deleted", description: `Purchase bill #${billId} has been successfully deleted.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
    }
  };
  
   const handleAction = (action: string, billId: string) => {
        toast({
            title: `Action: ${action}`,
            description: `This would ${action.toLowerCase()} bill ${billId}. This is a placeholder.`
        });
    }

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
                        <TableCell className="font-medium">{purchase.id}</TableCell>
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
                                <DropdownMenuItem onSelect={() => handleAction('View', purchase.id)}>
                                <FileText />
                                View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction('Edit', purchase.id)}>
                                <Edit />
                                Edit Bill
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction('Duplicate', purchase.id)}>
                                <Copy />
                                Duplicate Bill
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteBill(purchase.id)}>
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
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
