
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  PlusCircle,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const initialVouchers = [
  {
    id: "JV-001",
    date: "2024-05-30",
    narration: "To record monthly office rent.",
    amount: 25000.0,
  },
  {
    id: "JV-002",
    date: "2024-05-31",
    narration: "To record depreciation on office equipment for the month.",
    amount: 5000.0,
  },
  {
    id: "JV-003",
    date: "2024-06-01",
    narration: "To adjust for prepaid insurance.",
    amount: 1200.0,
  },
];

const accounts = [
    { code: "1010", name: "Cash on Hand" },
    { code: "1020", name: "HDFC Bank" },
    { code: "5010", name: "Rent Expense" },
    { code: "1450", name: "Office Equipment" },
    { code: "1455", name: "Accumulated Depreciation" },
    { code: "5150", name: "Depreciation Expense" },
    { code: "1510", name: "Prepaid Insurance" },
    { code: "5160", name: "Insurance Expense" },
];


export default function JournalVoucherPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [lines, setLines] = useState([
        { account: '', debit: '0', credit: '0' },
        { account: '', debit: '0', credit: '0' }
    ]);
    const { toast } = useToast();

    const handleAddLine = () => {
        setLines([...lines, { account: '', debit: '0', credit: '0' }]);
    };

    const handleLineChange = (index: number, field: 'account' | 'debit' | 'credit', value: any) => {
        const newLines = [...lines];
        const line = newLines[index] as any;
        line[field] = value;

        // Ensure only debit or credit is entered, not both
        if (field === 'debit' && parseFloat(value) > 0) {
            line['credit'] = '0';
        } else if (field === 'credit' && parseFloat(value) > 0) {
            line['debit'] = '0';
        }

        setLines(newLines);
    };

    const handleRemoveLine = (index: number) => {
        const newLines = [...lines];
        newLines.splice(index, 1);
        setLines(newLines);
    };
    
    const handleVoucherAction = (action: string, voucherId: string) => {
        toast({
            title: `${action} Voucher`,
            description: `Simulating ${action.toLowerCase()} action for voucher ${voucherId}.`,
        });
    };

    const totalDebits = lines.reduce((sum, line) => sum + parseFloat(line.debit || '0'), 0);
    const totalCredits = lines.reduce((sum, line) => sum + parseFloat(line.credit || '0'), 0);
    const isBalanced = totalDebits === totalCredits && totalDebits > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal Vouchers</h1>
          <p className="text-muted-foreground">
            Create manual journal entries to adjust ledger accounts.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    New Journal Voucher
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>New Journal Voucher</DialogTitle>
                    <DialogDescription>Create a manual entry to record transactions that don't fit into other categories.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                             <Label>Voucher Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="narration">Narration</Label>
                            <Textarea id="narration" placeholder="e.g., To record monthly depreciation expense" />
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Account</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead className="w-[50px] text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Select onValueChange={(value) => handleLineChange(index, 'account', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => <SelectItem key={acc.code} value={acc.code}>{acc.name} ({acc.code})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" className="text-right" value={line.debit} onChange={(e) => handleLineChange(index, 'debit', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" className="text-right" value={line.credit} onChange={(e) => handleLineChange(index, 'credit', e.target.value)} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveLine(index)} disabled={lines.length <= 2}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button variant="outline" size="sm" className="mt-4" onClick={handleAddLine}>
                            <PlusCircle className="mr-2"/> Add Line
                        </Button>
                     </div>
                     <Separator />
                     <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2">
                             <div className="flex justify-between font-medium">
                                <span>Total Debits</span>
                                <span className="font-mono">₹{totalDebits.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span>Total Credits</span>
                                <span className="font-mono">₹{totalCredits.toFixed(2)}</span>
                            </div>
                             {totalDebits !== totalCredits && <p className="text-sm text-destructive text-right">Totals must match.</p>}
                        </div>
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsAddDialogOpen(false)} disabled={!isBalanced}>Save Voucher</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Voucher List</CardTitle>
          <CardDescription>
            A list of all manual journal entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Voucher #</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>{format(new Date(voucher.date), "dd MMM, yyyy")}</TableCell>
                  <TableCell className="font-medium">{voucher.id}</TableCell>
                  <TableCell>{voucher.narration}</TableCell>
                  <TableCell className="text-right font-mono">₹{voucher.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleVoucherAction("View Details", voucher.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleVoucherAction("Edit", voucher.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleVoucherAction("Delete", voucher.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
    </div>
  );
}
