
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

const accounts = [
    { code: "1010", name: "Cash on Hand" },
    { code: "1020", name: "HDFC Bank" },
    { code: "1210", name: "Accounts Receivable" },
    { code: "1410", name: "Office Supplies" },
    { code: "2010", name: "Accounts Payable" },
    { code: "2110", name: "GST Payable" },
    { code: "4010", name: "Sales Revenue" },
    { code: "5010", name: "Rent Expense" },
    { code: "1450", name: "Office Equipment" },
    { code: "1455", name: "Accumulated Depreciation" },
    { code: "5150", name: "Depreciation Expense" },
];

type LedgerEntry = {
    date: string;
    particulars: string;
    type: string;
    debit: number;
    credit: number;
    balance: number;
};

export default function LedgersPage() {
    const { journalVouchers } = useContext(AccountingContext)!;
    const [selectedAccount, setSelectedAccount] = useState("1210");
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [balances, setBalances] = useState({ opening: 0, closing: 0, totalDebits: 0, totalCredits: 0 });
    const { toast } = useToast();

    const handleViewLedger = () => {
        const account = accounts.find(a => a.code === selectedAccount);
        if (!account) return;

        const openingBalance = 0; // Simplified for this demo
        let runningBalance = openingBalance;
        let totalDebits = 0;
        let totalCredits = 0;

        const entries: LedgerEntry[] = journalVouchers
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
            description: `Showing ledger for ${account.name}.`,
        });
    };
    
    const handleExport = () => {
        const accountName = accounts.find(a => a.code === selectedAccount)?.name;
        toast({
            title: "Exporting Ledger",
            description: `Your PDF for ${accountName} is being generated.`,
        });
    };

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">General Ledger</h1>
                <p className="text-muted-foreground">
                    View detailed transaction history for any account.
                </p>
            </div>
            <Button onClick={handleExport}>
                <FileDown className="mr-2"/>
                Export PDF
            </Button>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle>Select Ledger</CardTitle>
                <CardDescription>Choose an account and date range to view its ledger.</CardDescription>
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <Select onValueChange={setSelectedAccount} defaultValue={selectedAccount}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(account => (
                                <SelectItem key={account.code} value={account.code}>{account.name} ({account.code})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker className="w-full md:w-auto" />
                    <Button className="w-full md:w-auto" onClick={handleViewLedger}>
                        <Search className="mr-2"/>
                        View Ledger
                    </Button>
                </div>
            </CardHeader>
        </Card>

        {selectedAccount && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{accounts.find(a => a.code === selectedAccount)?.name} Ledger</CardTitle>
                    <CardDescription>For the period 01-Apr-2024 to 31-Mar-2025</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <StatCard title="Opening Balance" value={`₹${balances.opening.toFixed(2)}`} icon={FileText} />
                        <StatCard title="Total Debits" value={`₹${balances.totalDebits.toFixed(2)}`} icon={FileText} className="text-red-500" />
                        <StatCard title="Total Credits" value={`₹${balances.totalCredits.toFixed(2)}`} icon={FileText} className="text-green-500" />
                        <StatCard title="Closing Balance" value={`₹${balances.closing.toFixed(2)}`} icon={FileText} />
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
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
