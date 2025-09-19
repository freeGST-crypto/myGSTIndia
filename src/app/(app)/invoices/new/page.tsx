
"use client";

import { useState, useContext, useEffect, useCallback, memo } from "react";
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
import { AccountingContext, type JournalVoucher } from "@/context/accounting-context";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { PartyDialog, ItemDialog } from "@/components/billing/add-new-dialogs";
import { useRouter, useSearchParams } from "next/navigation";

type LineItem = {
    itemId: string;
    description: string;
    hsn: string;
    qty: number;
    rate: number;
    taxableAmount: number;
    taxRate: number;
    igst: number;
    cgst: number;
    sgst: number;
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
    handleItemChange,
    handleItemSelection,
    handleRemoveItem,
    items,
    itemsLoading,
    openItemDialog,
}: {
    item: LineItem;
    index: number;
    handleItemChange: (index: number, field: string, value: any) => void;
    handleItemSelection: (index: number, itemId: string) => void;
    handleRemoveItem: (index: number) => void;
    items: Item[];
    itemsLoading: boolean;
    openItemDialog: () => void;
}) => {
    
    const handleSelectChange = (itemId: string) => {
        if (itemId === 'add-new') {
            openItemDialog();
        } else {
            handleItemSelection(index, itemId);
        }
    };
    
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
    );
});
InvoiceItemRow.displayName = 'InvoiceItemRow';

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
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      itemId: "", description: "", hsn: "", qty: 1, rate: 0, taxableAmount: 0, taxRate: 18, igst: 0, cgst: 0, sgst: 0
    },
  ]);
  
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
                 itemId: "",
                 description: "Reconstructed from journal",
                 hsn: "",
                 qty: 1,
                 rate: parseFloat(salesLine.credit),
                 taxableAmount: parseFloat(salesLine.credit),
                 taxRate: 18,
                 igst: parseFloat(voucherToLoad.lines.find(l=>l.account==='2110')?.credit || '0'),
                 cgst: 0,
                 sgst: 0,
            }]);
        }
      }
    }
  }, [searchParams, journalVouchers, items]);

  const handleAddItem = useCallback(() => {
    setLineItems(prev => [
      ...prev,
      {
        itemId: "", description: "", hsn: "", qty: 1, rate: 0, taxableAmount: 0, taxRate: 18, igst: 0, cgst: 0, sgst: 0
      },
    ]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setLineItems(prev => {
        const list = [...prev];
        list.splice(index, 1);
        return list;
    });
  }, []);

  const handleItemChange = useCallback((index: number, field: string, value: any) => {
    setLineItems(prev => {
        const list = [...prev];
        const currentItem = { ...list[index] } as any;
        currentItem[field] = value;

        if (field === 'qty' || field === 'rate') {
          currentItem.taxableAmount = (currentItem.qty || 0) * (currentItem.rate || 0);
        }
        
        currentItem.igst = currentItem.taxableAmount * (currentItem.taxRate / 100);
        currentItem.cgst = 0;
        currentItem.sgst = 0;
        
        list[index] = currentItem;
        return list;
    });
  }, []);

  const handleItemSelection = useCallback((index: number, itemId: string) => {
    const selectedItem = items.find(i => i.id === itemId);
    if (selectedItem) {
        setLineItems(prev => {
            const list = [...prev];
            const currentItem = { ...list[index] };
            currentItem.itemId = itemId;
            currentItem.description = selectedItem.name;
            currentItem.rate = selectedItem.sellingPrice || 0;
            currentItem.hsn = selectedItem.hsn || "";
            currentItem.taxableAmount = currentItem.qty * (selectedItem.sellingPrice || 0);
            currentItem.igst = currentItem.taxableAmount * (currentItem.taxRate / 100);
            list[index] = currentItem;
            return list;
        });
    }
  }, [items]);
  
  const handleCustomerChange = (value: string) => {
    if (value === 'add-new') {
      setIsCustomerDialogOpen(true);
    } else {
      setCustomer(value);
    }
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
        { account: '1210', debit: totalAmount.toFixed(2), credit: '0' },
        { account: '4010', debit: '0', credit: subtotal.toFixed(2) },
        { account: '2110', debit: '0', credit: totalTax.toFixed(2) }
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
                {lineItems.map((item, index) => (
                  <InvoiceItemRow
                      key={index}
                      item={item}
                      index={index}
                      handleItemChange={handleItemChange}
                      handleItemSelection={handleItemSelection}
                      handleRemoveItem={handleRemoveItem}
                      items={items}
                      itemsLoading={itemsLoading}
                      openItemDialog={() => setIsItemDialogOpen(true)}
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
