
"use client";

import Link from "next/link";
import { useState, useContext, useMemo } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileDown, AlertTriangle, ChevronDown, Upload, Download, FileSpreadsheet, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AccountingContext } from "@/context/accounting-context";

const allAccounts = [
  { code: "1010", name: "Cash on Hand", type: "Asset" },
  { code: "1020", name: "HDFC Bank", type: "Asset" },
  { code: "1210", name: "Accounts Receivable", type: "Asset" },
  { code: "1410", name: "Office Supplies", type: "Asset" },
  { code: "1450", name: "Office Equipment", type: "Asset" },
  { code: "1455", name: "Accumulated Depreciation", type: "Asset" },
  { code: "1510", name: "Prepaid Insurance", type: "Asset" },
  { code: "2010", name: "Accounts Payable", type: "Liability" },
  { code: "2110", name: "GST Payable", type: "Liability" },
  { code: "3010", name: "Owner's Equity", type: "Equity" },
  { code: "3020", name: "Retained Earnings", type: "Equity" },
  { code: "4010", name: "Sales Revenue", type: "Revenue" },
  { code: "4020", name: "Service Revenue", type: "Revenue" },
  { code: "5010", name: "Rent Expense", type: "Expense" },
  { code: "5020", name: "Salaries and Wages", type: "Expense" },
  { code: "5030", name: "Office Supplies Expense", type: "Expense" },
  { code: "5040", name: "Bank Charges", type: "Expense" },
  { code: "5150", name: "Depreciation Expense", type: "Expense" },
  { code: "5160", name: "Insurance Expense", type: "Expense" },
];


export default function TrialBalancePage() {
    
    const { toast } = useToast();
    const router = useRouter();
    const { journalVouchers } = useContext(AccountingContext)!;
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isMismatchDialogOpen, setIsMismatchDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [uploadDate, setUploadDate] = useState<Date | undefined>(new Date());
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const trialBalanceData = useMemo(() => {
        const balances: Record<string, { debit: number, credit: number }> = {};

        allAccounts.forEach(acc => {
            balances[acc.code] = { debit: 0, credit: 0 };
        });

        journalVouchers.forEach(voucher => {
            voucher.lines.forEach(line => {
                if (balances[line.account]) {
                    balances[line.account].debit += parseFloat(line.debit);
                    balances[line.account].credit += parseFloat(line.credit);
                }
            });
        });

        return allAccounts.map(acc => {
            const balance = balances[acc.code];
            const netBalance = balance.debit - balance.credit;
            
            // Assets and Expenses have debit balances
            // Liabilities, Equity, and Revenue have credit balances
            const isDebitNature = acc.type === 'Asset' || acc.type === 'Expense';

            if (isDebitNature) {
                 return {
                    account: acc.name,
                    code: acc.code,
                    debit: netBalance > 0 ? netBalance : 0,
                    credit: netBalance < 0 ? -netBalance : 0,
                 };
            } else {
                 return {
                    account: acc.name,
                    code: acc.code,
                    debit: netBalance < 0 ? 0 : netBalance,
                    credit: netBalance > 0 ? -netBalance : 0,
                 };
            }
        }).map(acc => {
            // A simple correction for typical balances.
            // A better system would use account types (Asset, Liability, etc.)
            const netBalance = acc.debit - acc.credit;
            const accountInfo = allAccounts.find(a => a.code === acc.code);
            const accountType = accountInfo?.type;

            if ((accountType === 'Asset' || accountType === 'Expense') && netBalance < 0) {
                 return { ...acc, debit: 0, credit: -netBalance };
            }
             if ((accountType === 'Liability' || accountType === 'Equity' || accountType === 'Revenue') && netBalance > 0) {
                 return { ...acc, debit: netBalance, credit: 0 };
            }
            // A bit of a simplification - in real accounting, a credit balance in an asset account is possible (e.g. bank overdraft)
            // But for this simulation, we'll keep it clean.
            if(netBalance > 0) return {...acc, debit: netBalance, credit: 0};
            if(netBalance < 0) return {...acc, debit: 0, credit: -netBalance};
            return acc;
        });

    }, [journalVouchers]);

    const totalDebits = trialBalanceData.reduce((acc, item) => acc + item.debit, 0);
    const totalCredits = trialBalanceData.reduce((acc, item) => acc + item.credit, 0);
    const difference = totalDebits - totalCredits;

    const suspenseEntry = {
        account: "Suspense Account",
        code: "9999",
        debit: difference > 0 ? 0 : -difference,
        credit: difference > 0 ? difference : 0
    };


    const handleAccountClick = (code: string) => {
        // This is a placeholder for navigation. In a real app, you might do something like this:
        // router.push(`/accounting/ledgers?accountCode=${code}`);
        toast({
            title: `Viewing Ledger for ${code}`,
            description: `You would be navigated to the ledger for this account. For now, please use the ledger page directly.`
        });
    }

    const handleVerifyPost = (entry: any) => {
        toast({
            title: "Verification Action",
            description: `You have clicked 'Rectify' for the entry: ${entry.account}. A modal would open here to correct this posting.`,
        });
    }
    
    const handleFileUpload = () => {
        if (!uploadFile || !uploadDate) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please select a file and a date."});
            return;
        }

        console.log("Simulating file upload...");
        console.log("Date:", uploadDate);
        console.log("File Name:", uploadFile.name);
        console.log("File Size:", uploadFile.size);

        toast({
            title: "Upload Successful",
            description: `Financial reports will now be generated based on the uploaded Trial Balance as on ${format(uploadDate, "PPP")}. (Simulation)`,
        });
        setIsUploadDialogOpen(false);
    }
    
    const handleDownloadTemplate = () => {
        const headers = "Account,Debit,Credit";
        const exampleData = "Cash,10000,0\nSales,0,10000";
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleData}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "trial_balance_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Template Downloaded", description: "Trial Balance CSV template has been downloaded." });
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Import/Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem onSelect={() => setIsUploadDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDownloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <CardTitle>Trial Balance as on {date ? format(date, "PPP") : 'selected date'}</CardTitle>
                    <CardDescription>This report is dynamically generated from your journal entries.</CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full md:w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                        {trialBalanceData.filter(item => item.debit > 0 || item.credit > 0).map((item) => (
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
            </div>
            {difference !== 0 && (
                <div 
                    className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive font-semibold text-center cursor-pointer hover:bg-destructive/20"
                    onClick={() => setIsMismatchDialogOpen(true)}
                >
                    <div className="flex items-center justify-center gap-2">
                         <AlertTriangle className="h-5 w-5" />
                        <span>Warning: Debits and Credits do not match! Difference: ₹{Math.abs(difference).toFixed(2)}. Click to see discrepancies.</span>
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
                   The following entry has been created in a temporary Suspense Account to balance the Trial Balance difference of ₹{Math.abs(difference).toFixed(2)}.
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
                        <TableRow>
                            <TableCell className="font-medium">{suspenseEntry.account}</TableCell>
                            <TableCell className="text-right font-mono">{suspenseEntry.debit > 0 ? suspenseEntry.debit.toFixed(2) : "-"}</TableCell>
                            <TableCell className="text-right font-mono">{suspenseEntry.credit > 0 ? suspenseEntry.credit.toFixed(2) : "-"}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" onClick={() => handleVerifyPost(suspenseEntry)}>Rectify</Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsMismatchDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

       <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Upload Trial Balance CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV to generate financial reports from that data. The file must contain 'Account', 'Debit', and 'Credit' columns.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="tb-date">Trial Balance Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !uploadDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {uploadDate ? format(uploadDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={uploadDate} onSelect={setUploadDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="tb-file">CSV File</Label>
                    <Input id="tb-file" type="file" accept=".csv" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleFileUpload}>Upload and Process</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
