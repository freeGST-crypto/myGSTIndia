
"use client";

import { useState, useContext, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, FileDown, FileText } from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatCard } from "@/components/dashboard/stat-card";
import { useToast } from "@/hooks/use-toast";
import { AccountingContext } from "@/context/accounting-context";
import { format } from "date-fns";
import { allAccounts } from "@/lib/accounts";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Separator } from "@/components/ui/separator";

type LedgerEntry = {
    date: string;
    particulars: string;
    type: string;
    debit: number;
    credit: number;
    balance: number;
};

export default function LedgersPage() {
    const { journalVouchers, loading: jvLoading } = useContext(AccountingContext)!;
    const [user] = useAuthState(auth);
    const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [balances, setBalances] = useState({ opening: 0, closing: 0, totalDebits: 0, totalCredits: 0 });
    const { toast } = useToast();

    // Fetch customers and vendors
    const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
    const [customersSnapshot, customersLoading] = useCollection(customersQuery);
    const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name })) || [], [customersSnapshot]);

    const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
    const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
    const vendors = useMemo(() => vendorsSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name })) || [], [vendorsSnapshot]);

    const combinedAccounts = useMemo(() => {
        return [
            ...allAccounts.map(acc => ({ value: acc.code, label: `${acc.name} (${acc.code})`, group: "Main Accounts" })),
            ...customers.map(c => ({ value: c.id, label: `${c.name} (Customer)`, group: "Customers" })),
            ...vendors.map(v => ({ value: v.id, label: `${v.name} (Vendor)`, group: "Vendors" })),
        ];
    }, [allAccounts, customers, vendors]);


    const handleViewLedger = () => {
        if (!selectedAccount) {
            toast({ variant: "destructive", title: "No Account Selected", description: "Please select an account to view its ledger."});
            return;
        }

        const account = combinedAccounts.find(a => a.value === selectedAccount);
        if (!account) return;

        const openingBalance = 0; // Simplified for this demo
        let runningBalance = openingBalance;
        let totalDebits = 0;
        let totalCredits = 0;

        const entries: LedgerEntry[] = journalVouchers
            .filter(voucher => voucher && voucher.id)
            .flatMap(voucher => 
                voucher.lines
                    .filter(line => line.account === selectedAccount)
                    .map(line => ({ voucher, line }))
            )
            .sort((a, b) => new Date(a.voucher.date).getTime() - new Date(b.voucher.date).getTime())
            .map(({ voucher, line }) => {
                const debit = parseFloat(line.debit);
                const credit = parseFloat(line.credit);
                runningBalance += debit - credit;
                totalDebits += debit;
                totalCredits += credit;
                
                return {
                    date: format(new Date(voucher.date), "yyyy-MM-dd"),
                    particulars: voucher.narration,
                    type: voucher.id.startsWith('JV-INV') ? 'Invoice' : 'Journal',
                    debit,
                    credit,
                    balance: runningBalance,
                };
            });
        
        setLedgerEntries(entries);
        setBalances({ opening: openingBalance, closing: runningBalance, totalDebits, totalCredits });
        
        toast({
            title: "Ledger Generated",
            description: `Showing ledger for ${account.label}.`,
        });
    };
    
    const handleExport = () => {
        const accountName = combinedAccounts.find(a => a.value === selectedAccount)?.label;
        toast({
            title: "Exporting Ledger",
            description: `Your PDF for ${accountName} is being generated.`,
        });
    };
    
    const selectedAccountName = combinedAccounts.find(a => a.value === selectedAccount)?.label || "Selected Account";

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">General Ledger</h1>
                <p className="text-muted-foreground">
                    View detailed transaction history for any account.
                </p>
            </div>
            <Button onClick={handleExport} disabled={ledgerEntries.length === 0}>
                <FileDown className="mr-2"/>
                Export PDF
            </Button>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle>Select Ledger</CardTitle>
                <CardDescription>Choose an account and date range to view its ledger.</CardDescription>
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <Select onValueChange={setSelectedAccount} value={selectedAccount}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                             <div className="font-semibold px-2 py-1.5 text-sm">Main Accounts</div>
                            {combinedAccounts.filter(a => a.group === "Main Accounts").map(account => (
                                <SelectItem key={account.value} value={account.value}>{account.label}</SelectItem>
                            ))}
                            <Separator className="my-2" />
                            <div className="font-semibold px-2 py-1.5 text-sm">Customers</div>
                             {combinedAccounts.filter(a => a.group === "Customers").map(account => (
                                <SelectItem key={account.value} value={account.value}>{account.label}</SelectItem>
                            ))}
                            <Separator className="my-2" />
                            <div className="font-semibold px-2 py-1.5 text-sm">Vendors</div>
                             {combinedAccounts.filter(a => a.group === "Vendors").map(account => (
                                <SelectItem key={account.value} value={account.value}>{account.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker className="w-full md:w-auto" />
                    <Button className="w-full md:w-auto" onClick={handleViewLedger} disabled={!selectedAccount}>
                        <Search className="mr-2"/>
                        View Ledger
                    </Button>
                </div>
            </CardHeader>
        </Card>

        {selectedAccount && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{selectedAccountName} Ledger</CardTitle>
                    <CardDescription>For the period 01-Apr-2024 to 31-Mar-2025</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <StatCard title="Opening Balance" value={`₹${balances.opening.toFixed(2)}`} icon={FileText} loading={jvLoading} />
                        <StatCard title="Total Debits" value={`₹${balances.totalDebits.toFixed(2)}`} icon={FileText} className="text-red-500" loading={jvLoading} />
                        <StatCard title="Total Credits" value={`₹${balances.totalCredits.toFixed(2)}`} icon={FileText} className="text-green-500" loading={jvLoading} />
                        <StatCard title="Closing Balance" value={`₹${balances.closing.toFixed(2)}`} icon={FileText} loading={jvLoading} />
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Particulars</TableHead>
                                <TableHead>Voucher Type</TableHead>
                                <TableHead className="text-right">Debit (₹)</TableHead>
                                <TableHead className="text-right">Credit (₹)</TableHead>
                                <TableHead className="text-right">Balance (₹)</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {ledgerEntries.length > 0 ? ledgerEntries.map((entry, index) => (
                                <TableRow key={index}>
                                <TableCell>{entry.date}</TableCell>
                                <TableCell className="font-medium">{entry.particulars}</TableCell>
                                <TableCell>{entry.type}</TableCell>
                                <TableCell className="text-right font-mono">{entry.debit > 0 ? entry.debit.toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right font-mono">{entry.credit > 0 ? entry.credit.toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right font-medium font-mono">{entry.balance.toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                        No entries for this account in the selected period. Click 'View Ledger' to generate.
                                    </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
