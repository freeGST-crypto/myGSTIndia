
"use client";

import { useState, useContext, useEffect, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { AccountingContext, type JournalVoucher } from "@/context/accounting-context";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { PartyDialog, ItemDialog } from "@/components/billing/add-new-dialogs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type LineItem = {
    id: string; // Unique ID for key prop
    itemId: string;
    description: string;
    hsn: string;
    qty: number;
    rate: number;
    taxRate: number;
    amount: number;
};

type Item = {
  id: string;
  name: string;
  hsn: string;
  sellingPrice: number;
  [key: string]: any;
};

// Memoized Invoice Item Row to prevent re-renders
const InvoiceItemRow = memo(({
    item,
    index,
    onRemove,
    handleItemChange,
    handleSelectChange,
    items,
    itemsLoading,
}: {
    item: LineItem;
    index: number;
    onRemove: (index: number) => void;
    handleItemChange: (index: number, field: keyof LineItem, value: any) => void;
    handleSelectChange: (index: number, itemId: string) => void;
    items: Item[];
    itemsLoading: boolean;
}) => {
    
    const taxableAmount = item.qty * item.rate;
    const igst = taxableAmount * (item.taxRate / 100);
    const cgst = 0; // Assuming IGST for now
    const sgst = 0;

    return (
        <TableRow>
            <TableCell>
                <Select onValueChange={(value) => handleSelectChange(index, value)} value={item.itemId} disabled={itemsLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder={itemsLoading ? "Loading..." : "Select item"} />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                        <Separator />
                        <SelectItem value="add-new" className="text-primary focus:text-primary">
                           <div className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" /> Add New Item
                           </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell><Input type="number" value={item.qty} onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 0)} className="w-16 text-right" /></TableCell>
            <TableCell><Input type="number" value={item.rate} onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} className="w-24 text-right" /></TableCell>
            <TableCell className="text-right font-medium">₹{taxableAmount.toFixed(2)}</TableCell>
            <TableCell><Input type="number" value={item.taxRate} onChange={(e) => handleItemChange(index, "taxRate", parseFloat(e.target.value) || 0)} className="w-16 text-right" /></TableCell>
            <TableCell className="text-right font-mono">₹{igst.toFixed(2)}</TableCell>
            <TableCell className="text-right font-mono">₹{cgst.toFixed(2)}</TableCell>
            <TableCell className="text-right font-mono">₹{sgst.toFixed(2)}</TableCell>
            <TableCell className="text-right">
               <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </TableCell>
        </TableRow>
    );
});
InvoiceItemRow.displayName = 'InvoiceItemRow';

const createNewLineItem = (): LineItem => ({
  id: `${Date.now()}-${Math.random()}`,
  itemId: "", description: "", hsn: "", qty: 1, rate: 0, taxRate: 18, amount: 0,
});

export default function NewInvoicePage() {
  const accountingContext = useContext(AccountingContext);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user] = useAuthState(auth);
  
  const { journalVouchers } = useContext(AccountingContext)!;

  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [customer, setCustomer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [taxType, setTaxType] = useState<'none' | 'tds' | 'tcs'>('none');
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [useShippingAddress, setUseShippingAddress] = useState(false);
  
  const [lineItems, setLineItems] = useState<LineItem[]>([createNewLineItem()]);
  
  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [customersSnapshot]);

  const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
  const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
  const items: Item[] = useMemo(() => itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)) || [], [itemsSnapshot]);

  useEffect(() => {
    const editId = searchParams.get('edit') || searchParams.get('duplicate');
    if (editId && journalVouchers.length > 0 && items.length > 0) {
      const voucherToLoad = journalVouchers.find(v => v.id === `JV-${editId}`);
      if (voucherToLoad) {
        setInvoiceDate(new Date(voucherToLoad.date));
        setCustomer(voucherToLoad.customerId || "");
        
        if (searchParams.get('edit')) {
            setInvoiceNumber(voucherToLoad.id.replace('JV-', ''));
        }

        const salesLine = voucherToLoad.lines.find(l => l.account === '4010');
        const taxLine = voucherToLoad.lines.find(l => l.account === '2110');
        const tdsLine = voucherToLoad.lines.find(l => l.account === '1460');
        const tcsLine = voucherToLoad.lines.find(l => l.account === '2120');

        const subtotal = parseFloat(salesLine?.credit || '0');
        const taxAmount = parseFloat(taxLine?.credit || '0');

        if (tdsLine) setTaxType('tds');
        if (tcsLine) setTaxType('tcs');

        if (subtotal > 0) {
            const taxRate = (taxAmount / subtotal) * 100;
            const itemFromNarration = voucherToLoad.narration.split(" for ")[1]?.split(" to ")[0];

            let matchedItem = items.find(i => i.name.toLowerCase() === itemFromNarration?.toLowerCase());

            // A more robust way to handle single-item invoice reconstruction
            setLineItems([{
                 id: `${Date.now()}-${Math.random()}`,
                 itemId: matchedItem?.id || "",
                 description: matchedItem?.name || voucherToLoad.narration,
                 hsn: matchedItem?.hsn || "",
                 qty: 1, 
                 rate: subtotal,
                 taxRate: isNaN(taxRate) ? 18 : taxRate,
                 amount: subtotal,
            }]);
        } else {
             // Handle multi-line item reconstruction if needed in the future
        }
      }
    }
  }, [searchParams, journalVouchers, items]);

  const openItemDialog = useCallback(() => {
    setIsItemDialogOpen(true);
  }, []);

  const handleAddItem = useCallback(() => {
    setLineItems(prev => [...prev, createNewLineItem()]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleItemChange = useCallback((index: number, field: keyof LineItem, value: any) => {
    setLineItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'qty' || field === 'rate' || field === 'taxRate') {
            updatedItem.amount = (updatedItem.qty || 0) * (updatedItem.rate || 0);
          }
          return updatedItem;
        }
        return item;
      })
    );
  }, []);

  const handleSelectChange = useCallback((index: number, itemId: string) => {
    if (itemId === 'add-new') {
        openItemDialog();
        return;
    }
    const selectedItem = items.find(i => i.id === itemId);
    if(selectedItem) {
        setLineItems(prev =>
            prev.map((item, i) => {
                if (i === index) {
                    return {
                        ...item,
                        itemId: itemId,
                        description: selectedItem.name,
                        rate: selectedItem.sellingPrice || 0,
                        hsn: selectedItem.hsn || "",
                        amount: (item.qty || 0) * (selectedItem.sellingPrice || 0)
                    };
                }
                return item;
            })
        );
    }
  }, [items, openItemDialog]);
  
  const handleCustomerChange = useCallback((value: string) => {
    if (value === 'add-new') {
      setIsCustomerDialogOpen(true);
    } else {
      setCustomer(value);
    }
  }, []);

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const totalIgst = lineItems.reduce((acc, item) => acc + (item.qty * item.rate * item.taxRate / 100), 0);
  const totalCgst = 0; // Assuming IGST for simplicity
  const totalSgst = 0;
  const totalTax = totalIgst + totalCgst + totalSgst;
  const grandTotal = subtotal + totalTax;

  const taxOnSourceAmount = (subtotal * 0.1) / 100;
  let totalAmount = grandTotal;
  if (taxType === 'tds') {
    totalAmount -= taxOnSourceAmount;
  } else if (taxType === 'tcs') {
    totalAmount += taxOnSourceAmount;
  }


  const handleSaveInvoice = async () => {
    if (!accountingContext) return;
    const { addJournalVoucher } = accountingContext;

    const selectedCustomer = customers.find(c => c.id === customer);
    if (!selectedCustomer || !invoiceNumber) {
        toast({ variant: "destructive", title: "Missing Details", description: "Please select a customer and enter an invoice number."});
        return;
    }

    const journalLines = [
        { account: selectedCustomer.id, debit: totalAmount.toFixed(2), credit: '0' },
        { account: '4010', debit: '0', credit: subtotal.toFixed(2) },
        { account: '2110', debit: '0', credit: totalTax.toFixed(2) }
    ];

    if (taxOnSourceAmount > 0) {
      if (taxType === 'tds') {
        journalLines.push({ account: '1460', debit: taxOnSourceAmount.toFixed(2), credit: '0'}); // TDS Receivable
      } else if (taxType === 'tcs') {
        journalLines.push({ account: '2120', debit: '0', credit: taxOnSourceAmount.toFixed(2)}); // TCS Payable
      }
    }

    try {
        await addJournalVoucher({
            id: `JV-INV-${invoiceNumber}`,
            date: invoiceDate ? format(invoiceDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
            narration: `Sale to ${selectedCustomer.name} via Invoice #${invoiceNumber}`,
            lines: journalLines,
            amount: grandTotal, // Store the gross amount in the journal
            customerId: customer,
        });

        toast({ title: "Invoice Saved", description: `Journal entry for invoice #${invoiceNumber} has been automatically created.` });
        router.push("/billing/invoices");
    } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to save journal entry", description: e.message });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/billing/invoices" passHref>
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
             <div className="space-y-2 md:col-span-2">
              <Label>Bill To</Label>
               <Select onValueChange={handleCustomerChange} value={customer} disabled={customersLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={customersLoading ? "Loading..." : "Select a customer"} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <Separator />
                  <SelectItem value="add-new" className="text-primary focus:text-primary">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" /> Add New Customer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
          
          <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="shipping-address" checked={useShippingAddress} onCheckedChange={(checked) => setUseShippingAddress(checked as boolean)} />
                    <label htmlFor="shipping-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Ship to a different address
                    </label>
                </div>
                {useShippingAddress && (
                    <div className="p-4 border rounded-md space-y-4 animate-in fade-in-50">
                        <Label>Shipping Address</Label>
                        <Textarea placeholder="Enter the full shipping address" />
                    </div>
                )}
            </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Items</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%] min-w-[200px]">Item</TableHead>
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
                    <InvoiceItemRow
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={handleRemoveItem}
                        handleItemChange={handleItemChange}
                        handleSelectChange={handleSelectChange}
                        items={items}
                        itemsLoading={itemsLoading}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                <PlusCircle className="mr-2" />
                Add Row
                </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>₹{totalIgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>₹{totalCgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>₹{totalSgst.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold"><span className="text-muted-foreground">Gross Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
              <Separator />
               <div className="space-y-2">
                <Label>Tax at Source</Label>
                <RadioGroup value={taxType} onValueChange={(value) => setTaxType(value as any)} className="grid grid-cols-3 gap-4">
                    <div><RadioGroupItem value="none" id="tax-none"/><Label htmlFor="tax-none" className="ml-2">None</Label></div>
                    <div><RadioGroupItem value="tds" id="tax-tds"/><Label htmlFor="tax-tds" className="ml-2">TDS</Label></div>
                    <div><RadioGroupItem value="tcs" id="tax-tcs"/><Label htmlFor="tax-tcs" className="ml-2">TCS</Label></div>
                </RadioGroup>
              </div>
              {taxType === 'tds' && <div className="flex justify-between"><span className="text-muted-foreground">TDS Amount (0.1%)</span><span className="text-red-500">- ₹{taxOnSourceAmount.toFixed(2)}</span></div>}
               {taxType === 'tcs' && <div className="flex justify-between"><span className="text-muted-foreground">TCS Amount (0.1%)</span><span className="text-green-600">+ ₹{taxOnSourceAmount.toFixed(2)}</span></div>}
              <Separator/>
              <div className="flex justify-between font-bold text-lg"><span>Net Receivable</span><span>₹{totalAmount.toFixed(2)}</span></div>
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
