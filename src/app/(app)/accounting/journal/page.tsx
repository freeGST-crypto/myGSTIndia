
"use client";

import { useState, useContext, useEffect, useMemo } from "react";
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
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AccountingContext, type JournalVoucher } from "@/context/accounting-context";
import { allAccounts } from "@/lib/accounts";

export default function JournalVoucherPage() {
    const accountingContext = useContext(AccountingContext);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<JournalVoucher | null>(null);
    const [narration, setNarration] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [lines, setLines] = useState([
        { account: '', debit: '0', credit: '0' },
        { account: '', debit: '0', credit: '0' }
    ]);
    const { toast } = useToast();
    const [selectedVoucher, setSelectedVoucher] = useState<JournalVoucher | null>(null);

    useEffect(() => {
        if (editingVoucher) {
            setDate(new Date(editingVoucher.date));
            setNarration(editingVoucher.narration);
            setLines(editingVoucher.lines);
            setIsAddDialogOpen(true);
        } else {
            // Reset form when not editing
            setDate(new Date());
            setNarration("");
            setLines([{ account: '', debit: '0', credit: '0' }, { account: '', debit: '0', credit: '0' }]);
        }
    }, [editingVoucher]);

    if (!accountingContext) {
        return <Loader2 className="animate-spin" />;
    }
    
    const { journalVouchers: allVouchers, addJournalVoucher, updateJournalVoucher, loading } = accountingContext;

    const visibleJournalVouchers = useMemo(() => {
        const reversedIds = new Set(
            allVouchers.filter(v => v.reverses).map(v => v.reverses)
        );
        return allVouchers.filter(v => !reversedIds.has(v.id) && !v.reverses);
    }, [allVouchers]);

    const handleDeleteJournalVoucher = async (voucherId: string) => {
        const originalVoucher = allVouchers.find(v => v.id === voucherId);

        if (!originalVoucher) {
            toast({ variant: "destructive", title: "Error", description: "Original journal voucher not found." });
            return;
        }

        const reversalLines = originalVoucher.lines.map(line => ({
            account: line.account,
            debit: line.credit, // Swap debit and credit
            credit: line.debit,
        }));
        
        const reversalVoucher = {
            id: `JV-REV-${Date.now()}`, // Generate a unique ID
            reverses: voucherId, // Keep track of the voucher being reversed
            date: new Date().toISOString().split('T')[0],
            narration: `Reversal of Voucher #${voucherId}`,
            lines: reversalLines,
            amount: originalVoucher.amount,
        };

        try {
            await addJournalVoucher(reversalVoucher);
            toast({ title: "Voucher Reversed", description: `A reversing entry for voucher #${voucherId} has been created.` });
        } catch (e: any) {
            toast({ variant: "destructive", title: "Reversal Failed", description: e.message });
        }
    };

    const handleVoucherAction = (action: string, voucher: JournalVoucher) => {
        if (action === 'Delete') {
             if (voucher.reverses) {
                toast({ variant: "destructive", title: "Cannot Delete", description: "This is a reversal entry and cannot be deleted." });
                return;
            }
            handleDeleteJournalVoucher(voucher.id);
        } else if (action === 'View') {
            setSelectedVoucher(voucher);
        } else if (action === 'Edit') {
             if (voucher.reverses) {
                toast({ variant: "destructive", title: "Cannot Edit", description: "Reversal entries cannot be edited." });
                return;
            }
            const originalVoucher = allVouchers.find(v => v.id === voucher.id);
            if (originalVoucher) {
              setEditingVoucher(originalVoucher);
            }
        } else {
            toast({
                title: `${action} Voucher`,
                description: `This would ${action.toLowerCase()} voucher ${voucher.id}. This feature is a placeholder.`,
            });
        }
    };

    const handleAddLine = () => {
        setLines([...lines, { account: '', debit: '0', credit: '0' }]);
    };

    const handleLineChange = (index: number, field: 'account' | 'debit' | 'credit', value: any) => {
        const newLines = [...lines];
        const line = newLines[index] as any;
        line[field] = value;

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

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingVoucher(null); // Reset editing mode on close
        }
        setIsAddDialogOpen(open);
    }

    const handleSaveVoucher = async () => {
        if (!date || !narration) {
            toast({ variant: "destructive", title: "Missing Details", description: "Please provide a date and narration." });
            return;
        }

        const totalDebits = lines.reduce((sum, line) => sum + parseFloat(line.debit || '0'), 0);
        const totalCredits = lines.reduce((sum, line) => sum + parseFloat(line.credit || '0'), 0);
        const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;
        
        if (!isBalanced) {
            toast({ variant: "destructive", title: "Unbalanced Entry", description: "Debit and credit totals must match and be greater than zero." });
            return;
        }
        
        const voucherData = {
            date: format(date, "yyyy-MM-dd"),
            narration: narration,
            lines: lines,
            amount: totalDebits,
        };

        try {
            if (editingVoucher) {
                await updateJournalVoucher(editingVoucher.id, voucherData);
                toast({
                    title: "Voucher Updated",
                    description: "Your journal voucher has been updated successfully."
                });
            } else {
                const newVoucher = {
                    ...voucherData,
                    id: `JV-${Date.now()}`,
                };
                await addJournalVoucher(newVoucher);
                toast({
                    title: "Voucher Saved",
                    description: "Your journal voucher has been saved successfully."
                });
            }

            handleDialogClose(false); // Close dialog and reset state

        } catch (e: any) {
            toast({ variant: "destructive", title: "Save failed", description: e.message });
        }
    };

    const totalDebits = lines.reduce((sum, line) => sum + parseFloat(line.debit || '0'), 0);
    const totalCredits = lines.reduce((sum, line) => sum + parseFloat(line.credit || '0'), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal Vouchers</h1>
          <p className="text-muted-foreground">
            Create manual journal entries to adjust ledger accounts.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    New Journal Voucher
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{editingVoucher ? "Edit Journal Voucher" : "New Journal Voucher"}</DialogTitle>
                    <DialogDescription>
                        {editingVoucher ? `Editing voucher #${editingVoucher.id}` : "Create a manual entry to record transactions."}
                    </DialogDescription>
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
                            <Textarea id="narration" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g., To record monthly depreciation expense" />
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
                                        <Select value={line.account} onValueChange={(value) => handleLineChange(index, 'account', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allAccounts.map(acc => <SelectItem key={acc.code} value={acc.code}>{acc.name} ({acc.code})</SelectItem>)}
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
                    <Button onClick={handleSaveVoucher} disabled={!isBalanced}>{editingVoucher ? 'Save Changes' : 'Save Voucher'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Voucher List</CardTitle>
          <CardDescription>
            A list of all manual journal entries. Reversed entries are hidden from this list.
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
              {loading && <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>}
              {visibleJournalVouchers.map((voucher) => (
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
                        <DropdownMenuItem onSelect={() => handleVoucherAction("View", voucher)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleVoucherAction("Edit", voucher)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleVoucherAction("Delete", voucher)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Reverse / Delete
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
      
      {selectedVoucher && (
        <Dialog open={!!selectedVoucher} onOpenChange={(open) => !open && setSelectedVoucher(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Voucher Details: {selectedVoucher.id}</DialogTitle>
                    <DialogDescription>
                        {selectedVoucher.narration}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedVoucher.lines.map((line, index) => (
                                <TableRow key={index}>
                                    <TableCell>{allAccounts.find(a => a.code === line.account)?.name || line.account}</TableCell>
                                    <TableCell className="text-right font-mono">{parseFloat(line.debit) > 0 ? `₹${parseFloat(line.debit).toFixed(2)}` : '-'}</TableCell>
                                    <TableCell className="text-right font-mono">{parseFloat(line.credit) > 0 ? `₹${parseFloat(line.credit).toFixed(2)}` : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right font-mono">₹{selectedVoucher.amount.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-mono">₹{selectedVoucher.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
