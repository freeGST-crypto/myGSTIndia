
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileDown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const trialBalanceData = [
  // Assets
  { account: "Cash on Hand", code: "1010", debit: 1500.00, credit: 0 },
  { account: "HDFC Bank", code: "1020", debit: 120000.00, credit: 0 },
  { account: "Accounts Receivable", code: "1210", debit: 35000.00, credit: 0 },
  { account: "Office Supplies", code: "1410", debit: 5000.00, credit: 0 },
  // Liabilities
  { account: "Accounts Payable", code: "2010", debit: 0, credit: 22000.00 },
  { account: "GST Payable", code: "2110", debit: 0, credit: 8500.00 },
  // Equity
  { account: "Owner's Equity", code: "3010", debit: 0, credit: 100000.00 },
  { account: "Retained Earnings", code: "3020", debit: 0, credit: 15000.00 },
  // Revenue
  { account: "Sales Revenue", code: "4010", debit: 0, credit: 50000.00 },
  { account: "Service Revenue", code: "4020", debit: 0, credit: 25000.00 },
  // Expenses
  { account: "Rent Expense", code: "5010", debit: 25000.00, credit: 0 },
  { account: "Salaries and Wages", code: "5020", debit: 30000.00, credit: 0 },
  { account: "Office Supplies Expense", code: "5030", debit: 4000.00, credit: 0 },
  { account: "Bank Charges", code: "5040", debit: 5000.00, credit: 0 },
  // This entry is intentionally added to cause a mismatch for demonstration
  { account: "Suspense Account", code: "9999", debit: 100.00, credit: 0 },
];

export default function TrialBalancePage() {
    
    const { toast } = useToast();
    const router = useRouter();
    const [isMismatchDialogOpen, setIsMismatchDialogOpen] = useState(false);

    const totalDebits = trialBalanceData.reduce((acc, item) => acc + item.debit, 0);
    const totalCredits = trialBalanceData.reduce((acc, item) => acc + item.credit, 0);
    const difference = totalDebits - totalCredits;

    const suspenseEntries = trialBalanceData.filter(item => item.code === "9999");

    const handleAccountClick = (code: string) => {
        // In a real app, this would be: router.push(`/accounting/ledgers?account=${code}`);
        router.push('/accounting/ledgers');
        toast({
            title: `Navigating to Ledger`,
            description: `You would now be viewing the ledger for account ${code}.`
        });
    }

    const handleVerifyPost = (entry: any) => {
        toast({
            title: "Verification Action",
            description: `You have clicked 'Verify' for the entry: ${entry.account}. A modal would open here to correct this posting.`,
        });
    }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trial Balance</h1>
          <p className="text-muted-foreground">
            A summary of all ledger balances to verify the equality of debits and credits.
          </p>
        </div>
        <Button>
          <FileDown className="mr-2"/>
          Export PDF
        </Button>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Trial Balance as on {new Date().toLocaleDateString('en-GB')}</CardTitle>
              <CardDescription>This report lists the closing balances of all general ledger accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Account Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead className="text-right">Debit (₹)</TableHead>
                        <TableHead className="text-right">Credit (₹)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trialBalanceData.map((item) => (
                        <TableRow key={item.code}>
                            <TableCell>{item.code}</TableCell>
                            <TableCell 
                                className="font-medium hover:underline cursor-pointer"
                                onClick={() => handleAccountClick(item.code)}
                            >
                                {item.account}
                            </TableCell>
                            <TableCell className="text-right font-mono">{item.debit > 0 ? item.debit.toFixed(2) : "-"}</TableCell>
                            <TableCell className="text-right font-mono">{item.credit > 0 ? item.credit.toFixed(2) : "-"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold hover:bg-muted/50">
                        <TableCell colSpan={2} className="text-right">Total</TableCell>
                        <TableCell className="text-right font-mono">₹{totalDebits.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">₹{totalCredits.toFixed(2)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            {totalDebits !== totalCredits && (
                <div 
                    className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive font-semibold text-center cursor-pointer hover:bg-destructive/20"
                    onClick={() => setIsMismatchDialogOpen(true)}
                >
                    <div className="flex items-center justify-center gap-2">
                         <AlertTriangle className="h-5 w-5" />
                        <span>Warning: Debits and Credits do not match! Click to see discrepancies.</span>
                    </div>
                </div>
            )}
          </CardContent>
      </Card>
      
      <Dialog open={isMismatchDialogOpen} onOpenChange={setIsMismatchDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Trial Balance Discrepancies</DialogTitle>
                <DialogDescription>
                   The following entries are causing the Trial Balance to be out of balance by ₹{difference.toFixed(2)}. These are posted to a temporary Suspense Account.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suspenseEntries.map((entry, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{entry.account}</TableCell>
                                <TableCell className="text-right font-mono">{entry.debit > 0 ? entry.debit.toFixed(2) : "-"}</TableCell>
                                <TableCell className="text-right font-mono">{entry.credit > 0 ? entry.credit.toFixed(2) : "-"}</TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={() => handleVerifyPost(entry)}>Verify</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsMismatchDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
