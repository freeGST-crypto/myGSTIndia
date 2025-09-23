
"use client";

import { useState, useMemo, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileUp,
  RefreshCw,
  GitCompareArrows,
  Check,
  PlusCircle,
  Loader2,
  FileText
} from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { allAccounts } from '@/lib/accounts';
import { AccountingContext } from '@/context/accounting-context';
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/stat-card';


type StatementTransaction = {
  id: string;
  date: string;
  description: string;
  withdrawal: number | null;
  deposit: number | null;
  matchedId?: string | null;
};

type BookTransaction = {
  id: string;
  date: string;
  description: string;
  type: 'Receipt' | 'Payment';
  amount: number;
  matchedId?: string | null;
};

export default function BankReconciliationPage() {
    const { toast } = useToast();
    const { journalVouchers, loading } = useContext(AccountingContext)!;
    const [statementTransactions, setStatementTransactions] = useState<StatementTransaction[]>([]);
    const [selectedStatementTxs, setSelectedStatementTxs] = useState<Set<string>>(new Set());
    const [selectedBookTxs, setSelectedBookTxs] = useState<Set<string>>(new Set());
    const [bankAccount, setBankAccount] = useState<string>("1020"); // Default to HDFC Bank

    const bookTransactions = useMemo(() => {
        return journalVouchers
            .filter(v => v.lines.some(l => l.account === bankAccount))
            .map(v => {
                const isDebit = parseFloat(v.lines.find(l => l.account === bankAccount)!.debit) > 0;
                return {
                    id: v.id,
                    date: v.date,
                    description: v.narration,
                    type: isDebit ? 'Receipt' : 'Payment',
                    amount: v.amount,
                    matchedId: null, // This would be populated from reconciliation data
                };
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [journalVouchers, bankAccount]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            // Assuming CSV format: Date, Description, Withdrawal, Deposit
            const parsedData: StatementTransaction[] = json.slice(1).map((row, index) => ({
                id: `stmt-${index}`,
                date: row[0],
                description: row[1],
                withdrawal: row[2] ? parseFloat(row[2]) : null,
                deposit: row[3] ? parseFloat(row[3]) : null,
            }));
            setStatementTransactions(parsedData);
            toast({ title: "Statement Uploaded", description: `${parsedData.length} transactions loaded.` });
        };
        reader.readAsArrayBuffer(file);
    };
    
    const toggleSelection = (id: string, type: 'statement' | 'book') => {
        if (type === 'statement') {
            const newSelection = new Set(selectedStatementTxs);
            if (newSelection.has(id)) newSelection.delete(id); else newSelection.add(id);
            setSelectedStatementTxs(newSelection);
        } else {
            const newSelection = new Set(selectedBookTxs);
            if (newSelection.has(id)) newSelection.delete(id); else newSelection.add(id);
            setSelectedBookTxs(newSelection);
        }
    };
    
    const handleMatch = () => {
        if (selectedStatementTxs.size === 0 || selectedBookTxs.size === 0) {
            toast({ variant: "destructive", title: "Selection Error", description: "You must select at least one transaction from each side to match." });
            return;
        }

        const totalStatement = Array.from(selectedStatementTxs).reduce((acc, id) => {
            const tx = statementTransactions.find(t => t.id === id);
            return acc + (tx?.deposit || 0) - (tx?.withdrawal || 0);
        }, 0);

        const totalBook = Array.from(selectedBookTxs).reduce((acc, id) => {
            const tx = bookTransactions.find(t => t.id === id);
            return acc + (tx?.type === 'Receipt' ? tx.amount : -tx.amount);
        }, 0);
        
        if (Math.abs(totalStatement - totalBook) > 0.01) {
             toast({ variant: "destructive", title: "Mismatch Error", description: `Selected totals do not match. Bank: ${totalStatement.toFixed(2)}, Book: ${totalBook.toFixed(2)}` });
             return;
        }
        
        const matchId = `match-${Date.now()}`;
        
        setStatementTransactions(prev => prev.map(tx => selectedStatementTxs.has(tx.id) ? { ...tx, matchedId: matchId } : tx));
        
        // This is a local update. In a real app, we would persist this.
        // For now, we cannot update the context data directly this way.
        toast({ title: "Transactions Matched", description: `${selectedStatementTxs.size} bank transaction(s) matched with ${selectedBookTxs.size} book transaction(s).` });

        setSelectedStatementTxs(new Set());
        setSelectedBookTxs(new Set());
    };

    const bookBalance = useMemo(() => bookTransactions.reduce((acc, tx) => acc + (tx.type === 'Receipt' ? tx.amount : -tx.amount), 0), [bookTransactions]);
    const statementBalance = useMemo(() => statementTransactions.reduce((acc, tx) => acc + (tx.deposit || 0) - (tx.withdrawal || 0), 0), [statementTransactions]);
    const difference = statementBalance - bookBalance;


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bank Reconciliation</h1>
        <p className="text-muted-foreground">
          Match your bank statement with your books.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Setup</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <Select value={bankAccount} onValueChange={setBankAccount}>
                    <SelectTrigger className="w-full md:w-[250px]">
                        <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                    <SelectContent>
                        {allAccounts.filter(acc => acc.name.toLowerCase().includes("bank")).map(acc => (
                            <SelectItem key={acc.code} value={acc.code}>{acc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DateRangePicker />
              </div>
               <div className="space-y-2 self-end">
                 <Input id="statement-upload" type="file" className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
                 <Button asChild variant="outline">
                    <label htmlFor="statement-upload" className="cursor-pointer">
                        <FileUp className="mr-2"/> Upload Bank Statement
                    </label>
                 </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
       <div className="grid md:grid-cols-3 gap-4">
            <StatCard title="Bank Statement Balance" value={`₹${statementBalance.toFixed(2)}`} icon={FileText}/>
            <StatCard title="Book Balance" value={`₹${bookBalance.toFixed(2)}`} icon={FileText}/>
            <StatCard title="Difference" value={`₹${difference.toFixed(2)}`} className={Math.abs(difference) > 0.01 ? "text-destructive" : ""} icon={FileText}/>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Bank Statement Side */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Statement Transactions</CardTitle>
            <CardDescription>Transactions from your uploaded statement.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable
                transactions={statementTransactions.map(tx => ({
                    id: tx.id,
                    date: tx.date,
                    description: tx.description,
                    amount: tx.deposit !== null ? tx.deposit : tx.withdrawal !== null ? -tx.withdrawal : 0,
                    matched: !!tx.matchedId,
                }))}
                selectedTxs={selectedStatementTxs}
                onToggle={id => toggleSelection(id, 'statement')}
                type="statement"
            />
          </CardContent>
        </Card>
        
        {/* GSTEase / Book Side */}
        <Card>
          <CardHeader>
             <div className="flex justify-between items-start">
                 <div>
                    <CardTitle>GSTEase Transactions</CardTitle>
                    <CardDescription>Receipts and payments from your books.</CardDescription>
                </div>
                 <Button size="sm" variant="outline">
                    <PlusCircle className="mr-2" /> Add Missing Entry
                </Button>
             </div>
          </CardHeader>
          <CardContent>
             <TransactionTable
                transactions={bookTransactions.map(tx => ({
                    id: tx.id,
                    date: tx.date,
                    description: tx.description,
                    amount: tx.type === 'Receipt' ? tx.amount : -tx.amount,
                    matched: !!tx.matchedId,
                }))}
                selectedTxs={selectedBookTxs}
                onToggle={id => toggleSelection(id, 'book')}
                type="book"
            />
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm border-t -mx-6 -mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
            <Button size="lg" onClick={handleMatch} disabled={selectedStatementTxs.size === 0 || selectedBookTxs.size === 0}>
                <GitCompareArrows className="mr-2"/> Match Selected Transactions
            </Button>
        </div>
      </div>
    </div>
  );
}

function TransactionTable({ transactions, selectedTxs, onToggle, type }: { transactions: any[], selectedTxs: Set<string>, onToggle: (id: string) => void, type: 'statement' | 'book' }) {
    return (
        <div className="max-h-[500px] overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            {type === 'statement' ? 'Upload a statement to see transactions.' : 'No book transactions for this period.'}
                        </TableCell></TableRow>
                    ) : (
                        transactions.map(tx => (
                            <TableRow key={tx.id} data-state={selectedTxs.has(tx.id) ? "selected" : ""}>
                                <TableCell>
                                    {tx.matched ? (
                                        <Badge variant="secondary" className="flex items-center justify-center h-6 w-6 p-0"><Check className="size-4 text-green-600"/></Badge>
                                    ) : (
                                        <Checkbox checked={selectedTxs.has(tx.id)} onCheckedChange={() => onToggle(tx.id)} />
                                    )}
                                </TableCell>
                                <TableCell className="text-xs whitespace-nowrap">{format(new Date(tx.date), "dd-MMM-yy")}</TableCell>
                                <TableCell className="text-xs">{tx.description}</TableCell>
                                <TableCell className={`text-right font-mono text-xs ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
