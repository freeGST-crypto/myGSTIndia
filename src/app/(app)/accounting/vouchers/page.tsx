
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
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const initialReceipts = [
  { id: "RV-001", date: "2024-06-05", party: "Global Tech Inc.", amount: 25000, mode: "Bank" },
  { id: "RV-002", date: "2024-06-10", party: "Cash Sales", amount: 5000, mode: "Cash" },
];

const initialPayments = [
  { id: "PV-001", date: "2024-06-07", party: "Supplier Alpha", amount: 8500, mode: "Bank" },
  { id: "PV-002", date: "2024-06-12", party: "Office Expenses", amount: 1500, mode: "Cash" },
];

const accounts = [
    { code: "1010", name: "Cash on Hand" },
    { code: "1020", name: "HDFC Bank" },
    { code: "1210", name: "Accounts Receivable" },
    { code: "2010", name: "Accounts Payable" },
    { code: "4010", name: "Sales Revenue" },
    { code: "5010", "name": "Rent Expense" },
];

const invoices = [
    { id: "INV-001", party: "Global Tech Inc.", amount: 25000.00 },
    { id: "INV-002", party: "Innovate Solutions", amount: 15000.00 },
    { id: "INV-004", party: "Synergy Corp", amount: 45000.00 },
]

export default function VouchersPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'receipt' | 'payment'>('receipt');
    const [transactionType, setTransactionType] = useState<string>("on_account");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { toast } = useToast();
    
    const handleVoucherAction = (action: string, voucherId: string) => {
        toast({
            title: `${action} Voucher`,
            description: `Simulating ${action.toLowerCase()} action for voucher ${voucherId}.`,
        });
    };

    const openDialog = (type: 'receipt' | 'payment') => {
        setDialogType(type);
        setTransactionType('on_account'); // Reset on open
        setIsAddDialogOpen(true);
    };

    const dialogTitle = dialogType === 'receipt' ? "New Receipt Voucher" : "New Payment Voucher";
    const dialogDescription = dialogType === 'receipt' ? "Record cash or bank receipts from customers or other income." : "Record cash or bank payments to vendors or for expenses.";


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receipt & Payment Vouchers</h1>
          <p className="text-muted-foreground">
            Record all cash and bank transactions.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="receipts">
        <div className="flex justify-between items-start">
            <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
                 <Button onClick={() => openDialog('receipt')}>
                    <PlusCircle className="mr-2" />
                    New Receipt
                </Button>
                <Button onClick={() => openDialog('payment')}>
                    <PlusCircle className="mr-2" />
                    New Payment
                </Button>
            </div>
        </div>
        <TabsContent value="receipts" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Receipts</CardTitle>
                <CardDescription>
                    A list of all cash and bank receipts.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Voucher #</TableHead>
                        <TableHead>Received From</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {initialReceipts.map((voucher) => (
                        <TableRow key={voucher.id}>
                        <TableCell>{format(new Date(voucher.date), "dd MMM, yyyy")}</TableCell>
                        <TableCell className="font-medium">{voucher.id}</TableCell>
                        <TableCell>{voucher.party}</TableCell>
                        <TableCell>{voucher.mode}</TableCell>
                        <TableCell className="text-right font-mono">₹{voucher.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleVoucherAction("View", voucher.id)}><FileText className="mr-2"/>View Details</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleVoucherAction("Edit", voucher.id)}><Edit className="mr-2"/>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleVoucherAction("Delete", voucher.id)}><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="payments" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>
                    A list of all cash and bank payments.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Voucher #</TableHead>
                        <TableHead>Paid To</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {initialPayments.map((voucher) => (
                        <TableRow key={voucher.id}>
                        <TableCell>{format(new Date(voucher.date), "dd MMM, yyyy")}</TableCell>
                        <TableCell className="font-medium">{voucher.id}</TableCell>
                        <TableCell>{voucher.party}</TableCell>
                        <TableCell>{voucher.mode}</TableCell>
                        <TableCell className="text-right font-mono">₹{voucher.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleVoucherAction("View", voucher.id)}><FileText className="mr-2"/>View Details</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleVoucherAction("Edit", voucher.id)}><Edit className="mr-2"/>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleVoucherAction("Delete", voucher.id)}><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                         <div className="space-y-2">
                             <Label>Voucher Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")} >
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
                            <Label>{dialogType === 'receipt' ? 'Received From' : 'Paid To'}</Label>
                            <Select><SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                                <SelectContent>{accounts.map(acc => <SelectItem key={acc.code} value={acc.code}>{acc.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Transaction Type</Label>
                             <Select defaultValue="on_account" onValueChange={(value) => setTransactionType(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select transaction type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="against_invoice">Against Invoice</SelectItem>
                                    <SelectItem value="on_account">On Account</SelectItem>
                                    <SelectItem value="advance">Advance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {transactionType === 'against_invoice' && (
                             <div className="space-y-2">
                                <Label>Select Invoice</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an invoice to settle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {invoices.map(inv => (
                                             <SelectItem key={inv.id} value={inv.id}>
                                                {inv.id} ({inv.party} - ₹{inv.amount.toFixed(2)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <Separator/>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input type="number" placeholder="0.00"/>
                        </div>
                         <div className="space-y-2">
                             <Label>Mode</Label>
                             <Select defaultValue="bank">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank">Bank</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                             </Select>
                         </div>
                         <div className="space-y-2">
                            <Label>Reference No. / Cheque No.</Label>
                            <Input placeholder="e.g., Cheque 123456"/>
                         </div>
                     </div>
                     <div className="space-y-2">
                        <Label>Narration</Label>
                        <Textarea placeholder="A brief description of the transaction"/>
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Save Voucher</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
