
"use client";

import { useState, useContext, useEffect, useCallback, memo } from "react";
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

type LineItem = {
    id: string; // Unique ID for key prop
    itemId: string;
    description: string;
    hsn: string;
    qty: number;
    rate: number;
    taxRate: number;
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
    onRemove,
    onUpdate,
    items,
    itemsLoading,
    openItemDialog,
}: {
    item: LineItem;
    onRemove: () => void;
    onUpdate: (id: string, field: keyof LineItem, value: any) => void;
    items: Item[];
    itemsLoading: boolean;
    openItemDialog: () => void;
}) => {

    const handleSelectChange = useCallback((itemId: string) => {
        if (itemId === 'add-new') {
            openItemDialog();
        } else {
            const selectedItem = items.find(i => i.id === itemId);
            if (selectedItem) {
                onUpdate(item.id, 'itemId', itemId);
                onUpdate(item.id, 'description', selectedItem.name);
                onUpdate(item.id, 'rate', selectedItem.sellingPrice || 0);
                onUpdate(item.id, 'hsn', selectedItem.hsn || "");
            }
        }
    }, [items, onUpdate, openItemDialog, item.id]);
    
    const taxableAmount = (item.qty || 0) * (item.rate || 0);
    const igst = taxableAmount * (item.taxRate / 100);
    const cgst = 0; // Assuming IGST for now
    const sgst = 0;

    return (
        <TableRow>
            <TableCell>
                <Select onValueChange={handleSelectChange} value={item.itemId} disabled={itemsLoading}>
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
            <TableCell><Input type="number" value={item.qty} onChange={(e) => onUpdate(item.id, "qty", parseInt(e.target.value) || 0)} className="w-16 text-right" /></TableCell>
            <TableCell><Input type="number" value={item.rate} onChange={(e) => onUpdate(item.id, "rate", parseFloat(e.target.value) || 0)} className="w-24 text-right" /></TableCell>
            <TableCell className="text-right font-medium">₹{taxableAmount.toFixed(2)}</TableCell>
            <TableCell><Input type="number" value={item.taxRate} onChange={(e) => onUpdate(item.id, "taxRate", parseFloat(e.target.value) || 0)} className="w-16 text-right" /></TableCell>
            <TableCell className="text-right font-mono">₹{igst.toFixed(2)}</TableCell>
            <TableCell className="text-right font-mono">₹{cgst.toFixed(2)}</TableCell>
            <TableCell className="text-right font-mono">₹{sgst.toFixed(2)}</TableCell>
            <TableCell className="text-right">
               <Button variant="ghost" size="icon" onClick={onRemove}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </TableCell>
        </TableRow>
    );
});
InvoiceItemRow.displayName = 'InvoiceItemRow';

const createNewLineItem = (): LineItem => ({
  id: `${Date.now()}-${Math.random()}`,
  itemId: "", description: "", hsn: "", qty: 1, rate: 0, taxRate: 18
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
  const [tdsRate, setTdsRate] = useState(0);
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  
  const [lineItems, setLineItems] = useState<LineItem[]>([createNewLineItem()]);
  
  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
  const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
  const items: Item[] = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)) || [];

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
        if (salesLine) {
            setLineItems([{
                 id: `${Date.now()}-${Math.random()}`,
                 itemId: "",
                 description: "Reconstructed from journal",
                 hsn: "",
                 qty: 1,
                 rate: parseFloat(salesLine.credit),
                 taxRate: 18,
            }]);
        }
      }
    }
  }, [searchParams, journalVouchers, items]);

  const handleAddItem = useCallback(() => {
    setLineItems(prev => [...prev, createNewLineItem()]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleItemChange = useCallback((id: string, field: keyof LineItem, value: any) => {
    setLineItems(prev => {
        return prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
    });
  }, []);
  
  const handleCustomerChange = useCallback((value: string) => {
    if (value === 'add-new') {
      setIsCustomerDialogOpen(true);
    } else {
      setCustomer(value);
    }
  }, []);

  const openItemDialog = useCallback(() => {
    setIsItemDialogOpen(true);
  }, []);

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const totalIgst = lineItems.reduce((acc, item) => acc + (item.qty * item.rate * item.taxRate / 100), 0);
  const totalCgst = 0; // Assuming IGST for simplicity
  const totalSgst = 0;
  const totalTax = totalIgst + totalCgst + totalSgst;
  const grandTotal = subtotal + totalTax;
  const tdsAmount = (subtotal * tdsRate) / 100;
  const totalAmount = grandTotal - tdsAmount;

  const handleSaveInvoice = async () => {
    if (!accountingContext) return;
    const { addJournalVoucher } = accountingContext;

    const selectedCustomer = customers.find(c => c.id === customer);
    if (!selectedCustomer || !invoiceNumber) {
        toast({ variant: "destructive", title: "Missing Details", description: "Please select a customer and enter an invoice number."});
        return;
    }

    const journalLines = [
        { account: '1210', debit: totalAmount.toFixed(2), credit: '0' },
        { account: '4010', debit: '0', credit: subtotal.toFixed(2) },
        { account: '2110', debit: '0', credit: totalTax.toFixed(2) }
    ];

    if (tdsAmount > 0) {
      journalLines.push({ account: '1460', debit: tdsAmount.toFixed(2), credit: '0'}); // TDS Receivable
    }


    try {
        await addJournalVoucher({
            id: `JV-${invoiceNumber}`,
            date: invoiceDate ? format(invoiceDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
            narration: `Sale to ${selectedCustomer.name} via Invoice #${invoiceNumber}`,
            lines: journalLines,
            amount: grandTotal, // Store the gross amount in the journal
            customerId: customer,
        });
        toast({ title: "Invoice Saved", description: `Journal entry for invoice #${invoiceNumber} has been automatically created.` });
        router.push("/invoices");
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
                {lineItems.map((item) => (
                  <InvoiceItemRow
                      key={item.id}
                      item={item}
                      onRemove={() => handleRemoveItem(item.id)}
                      onUpdate={handleItemChange}
                      items={items}
                      itemsLoading={itemsLoading}
                      openItemDialog={openItemDialog}
                  />
                ))}
              </TableBody>
            </Table>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="tds-rate">TDS/TCS Rate (%)</Label>
                <Input id="tds-rate" type="number" value={tdsRate} onChange={e => setTdsRate(parseFloat(e.target.value) || 0)} className="w-24 text-right" />
              </div>
               <div className="flex justify-between"><span className="text-muted-foreground">TDS/TCS Amount</span><span className="text-red-500">- ₹{tdsAmount.toFixed(2)}</span></div>
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
