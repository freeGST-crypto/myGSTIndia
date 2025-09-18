
"use client";

import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  PlusCircle,
  Save,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AccountingContext } from "@/context/accounting-context";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { PartyDialog, ItemDialog } from "@/components/billing/add-new-dialogs";

export default function NewInvoicePage() {
  const accountingContext = useContext(AccountingContext);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [customer, setCustomer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  
  const [lineItems, setLineItems] = useState([
    {
      itemId: "",
      description: "",
      hsn: "",
      qty: 1,
      rate: 0,
      taxableAmount: 0,
      taxRate: 18,
      igst: 0,
      cgst: 0,
      sgst: 0,
    },
  ]);
  
  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
  const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
  const items = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      {
        itemId: "", description: "", hsn: "", qty: 1, rate: 0, taxableAmount: 0, taxRate: 18, igst: 0, cgst: 0, sgst: 0
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const list = [...lineItems];
    list.splice(index, 1);
    setLineItems(list);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const list = [...lineItems];
    const currentItem = list[index] as any;
    currentItem[field] = value;

    if (field === 'itemId') {
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem) {
        currentItem.description = selectedItem.name;
        currentItem.rate = selectedItem.sellingPrice || 0;
        currentItem.hsn = selectedItem.hsn || "";
      }
    }

    // Recalculate amounts
    currentItem.taxableAmount = (currentItem.qty || 0) * (currentItem.rate || 0);
    // Assuming IGST for simplicity. A real app would check buyer's state.
    currentItem.igst = currentItem.taxableAmount * (currentItem.taxRate / 100);
    currentItem.cgst = 0;
    currentItem.sgst = 0;
    
    setLineItems(list);
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.taxableAmount, 0);
  const totalIgst = lineItems.reduce((acc, item) => acc + item.igst, 0);
  const totalCgst = lineItems.reduce((acc, item) => acc + item.cgst, 0);
  const totalSgst = lineItems.reduce((acc, item) => acc + item.sgst, 0);
  const totalTax = totalIgst + totalCgst + totalSgst;
  const totalAmount = subtotal + totalTax;

  const handleSaveInvoice = async () => {
    if (!accountingContext) return;
    const { addJournalVoucher } = accountingContext;

    const selectedCustomer = customers.find(c => c.id === customer);
    if (!selectedCustomer || !invoiceNumber) {
        toast({ variant: "destructive", title: "Missing Details", description: "Please select a customer and enter an invoice number."});
        return;
    }

    const journalLines = [
        { account: '1210', debit: totalAmount.toFixed(2), credit: '0' }, // Debit Accounts Receivable
        { account: '4010', debit: '0', credit: subtotal.toFixed(2) }, // Credit Sales Revenue
        { account: '2110', debit: '0', credit: totalTax.toFixed(2) } // Credit GST Payable
    ];

    try {
        await addJournalVoucher({
            id: `JV-${invoiceNumber}`,
            date: invoiceDate ? format(invoiceDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
            narration: `Sale to ${selectedCustomer.name} via Invoice #${invoiceNumber}`,
            lines: journalLines,
            amount: totalAmount,
            customerId: customer,
        });
        toast({ title: "Invoice Saved", description: `Journal entry for invoice #${invoiceNumber} has been automatically created.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to save journal entry", description: e.message });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/invoices" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Invoice</h1>
      </div>

      <PartyDialog type="Customer" open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen} />
      <ItemDialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen} />

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            Fill out the details for your new invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
             <div className="space-y-2">
              <Label>Bill To</Label>
              <div className="flex gap-2">
                <Select onValueChange={setCustomer} disabled={customersLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={customersLoading ? "Loading..." : "Select a customer"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setIsCustomerDialogOpen(true)}><PlusCircle/></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-no">Invoice Number</Label>
              <Input id="invoice-no" placeholder="e.g., INV-001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={invoiceDate} onSelect={setInvoiceDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Taxable Amt</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>IGST</TableHead>
                  <TableHead>CGST</TableHead>
                  <TableHead>SGST</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                       <Select onValueChange={(value) => handleItemChange(index, "itemId", value)} disabled={itemsLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder={itemsLoading ? "Loading..." : "Select item"} />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell><Input type="number" value={item.qty} onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value))} className="w-16 text-right" /></TableCell>
                    <TableCell><Input type="number" value={item.rate} onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value))} className="w-24 text-right" /></TableCell>
                    <TableCell className="text-right font-medium">₹{item.taxableAmount.toFixed(2)}</TableCell>
                    <TableCell><Input type="number" value={item.taxRate} onChange={(e) => handleItemChange(index, "taxRate", parseFloat(e.target.value))} className="w-16 text-right" /></TableCell>
                    <TableCell className="text-right font-mono">₹{item.igst.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">₹{item.cgst.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">₹{item.sgst.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                <PlusCircle className="mr-2" />
                Add Row
                </Button>
                 <Button variant="outline" size="sm" onClick={() => setIsItemDialogOpen(true)}>
                <PlusCircle className="mr-2" />
                Add New Item
                </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>₹{totalIgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>₹{totalCgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>₹{totalSgst.toFixed(2)}</span></div>
              <Separator/>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{totalAmount.toFixed(2)}</span></div>
            </div>
          </div>
          <Separator />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveInvoice}>
            <Save className="mr-2" />
            Save Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
