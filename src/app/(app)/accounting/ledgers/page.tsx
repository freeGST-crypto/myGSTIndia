
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

const accounts = [
    { code: "1010", name: "Cash on Hand" },
    { code: "1020", name: "HDFC Bank" },
    { code: "1210", name: "Accounts Receivable" },
    { code: "2010", name: "Accounts Payable" },
    { code: "4010", name: "Sales Revenue" },
    { code: "5010", name: "Rent Expense" },
];

const initialLedgerEntries = [
    { date: "2024-05-01", particulars: "Opening Balance", type: "N/A", debit: 50000.00, credit: 0, balance: 50000.00, link: "#" },
    { date: "2024-05-05", particulars: "Sale to Innovate Solutions (INV-002)", type: "Sales", debit: 0, credit: 15000.00, balance: 35000.00, link: "/invoices/INV-002" },
    { date: "2024-05-10", particulars: "Purchase from Supplier Alpha (PUR-001)", type: "Purchase", debit: 8500.00, credit: 0, balance: 26500.00, link: "/purchases/PUR-001" },
    { date: "2024-05-15", particulars: "Office Rent Payment", type: "Journal", debit: 25000.00, credit: 0, balance: 1500.00, link: "/accounting/journal/JV-001" },
    { date: "2024-05-25", particulars: "Payment from Global Tech (INV-001)", type: "Receipt", debit: 0, credit: 25000.00, balance: 26500.00, link: "/invoices/INV-001" },
];

export default function LedgersPage() {
    const [selectedAccount, setSelectedAccount] = useState("1010"); // Default to Cash on Hand
    const { toast } = useToast();

    const openingBalance = 50000.00;
    const closingBalance = 26500.00;
    const totalDebits = initialLedgerEntries.reduce((acc, entry) => acc + entry.debit, 0);
    const totalCredits = initialLedgerEntries.reduce((acc, entry) => acc + entry.credit, 0);

    const handleRowClick = (entry: typeof initialLedgerEntries[0]) => {
        if (entry.type === 'N/A') return;
        toast({
            title: "Navigating to Transaction",
            description: `You clicked on ${entry.particulars}. You would now be taken to view the original ${entry.type} document.`,
        });
        // In a real app, you would use Next.js router to navigate:
        // router.push(entry.link);
    }

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">General Ledger</h1>
                <p className="text-muted-foreground">
                    View detailed transaction history for any account.
                </p>
            </div>
            <Button>
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
                        <SelectTrigger className="md:w-[300px]">
                            <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(account => (
                                <SelectItem key={account.code} value={account.code}>{account.name} ({account.code})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker className="w-full md:w-auto" />
                    <Button className="w-full md:w-auto">
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
                        <StatCard title="Opening Balance" value={`₹${openingBalance.toFixed(2)}`} icon={FileText} />
                        <StatCard title="Total Debits" value={`₹${totalDebits.toFixed(2)}`} icon={FileText} className="text-red-500" />
                        <StatCard title="Total Credits" value={`₹${totalCredits.toFixed(2)}`} icon={FileText} className="text-green-500" />
                        <StatCard title="Closing Balance" value={`₹${closingBalance.toFixed(2)}`} icon={FileText} />
                    </div>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Particulars</TableHead>
                            <TableHead>Voucher Type</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {initialLedgerEntries.map((entry, index) => (
                            <TableRow key={index} onClick={() => handleRowClick(entry)} className={entry.type !== 'N/A' ? 'cursor-pointer' : ''}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell className="font-medium">{entry.particulars}</TableCell>
                            <TableCell>{entry.type}</TableCell>
                            <TableCell className="text-right">{entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-'}</TableCell>
                            <TableCell className="text-right">{entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-'}</TableCell>
                            <TableCell className="text-right font-medium">₹{entry.balance.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

    