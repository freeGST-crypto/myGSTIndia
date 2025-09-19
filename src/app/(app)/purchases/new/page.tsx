
"use client";

import { useState, useContext, useCallback, memo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  PlusCircle,
  Save,
  Trash2,
  Upload,
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
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { PartyDialog, ItemDialog } from "@/components/billing/add-new-dialogs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  purchasePrice?: number;
  [key: string]: any;
};

const PurchaseItemRow = memo(({
    item,
    index,
    onRemove,
    handleItemChange,
    items,
    itemsLoading,
    openItemDialog,
}: {
    item: LineItem;
    index: number;
    onRemove: () => void;
    handleItemChange: (index: number, field: keyof LineItem, value: any) => void;
    items: Item[];
    itemsLoading: boolean;
    openItemDialog: () => void;
}) => {
    
    const handleSelectChange = (itemId: string) => {
        if (itemId === 'add-new') {
            openItemDialog();
        } else {
             const selectedItem = items.find((i) => i.id === itemId);
            if (selectedItem) {
                handleItemChange(index, 'itemId', itemId);
                handleItemChange(index, 'description', selectedItem.name);
                handleItemChange(index, 'rate', selectedItem.purchasePrice || 0);
                handleItemChange(index, 'hsn', selectedItem.hsn || "");
            }
        }
    };
    
    const taxableAmount = item.qty * item.rate;

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
            <TableCell>
                <Input
                value={item.hsn}
                onChange={(e) => handleItemChange(index, "hsn", e.target.value)}
                placeholder="HSN/SAC"
                />
            </TableCell>
            <TableCell>
                <Input
                type="number"
                value={item.qty}
                onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 0)}
                className="text-right"
                />
            </TableCell>
            <TableCell>
                <Input
                type="number"
                value={item.rate}
                onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
                className="text-right"
                />
            </TableCell>
            <TableCell className="text-right font-medium">
                ₹{taxableAmount.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={onRemove}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </TableCell>
        </TableRow>
    );
});
PurchaseItemRow.displayName = 'PurchaseItemRow';

const createNewLineItem = (): LineItem => ({
  id: `${Date.now()}-${Math.random()}`,
  itemId: "",
  description: "",
  hsn: "",
  qty: 1,
  rate: 0,
  taxRate: 18,
  amount: 0,
});


export default function NewPurchasePage() {
  const accountingContext = useContext(AccountingContext);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const [billDate, setBillDate] = useState<Date | undefined>(new Date());
  const [vendor, setVendor] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [taxType, setTaxType] = useState<'none' | 'tds' | 'tcs'>('none');
  
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([createNewLineItem()]);
  
  const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
  const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
  const vendors = vendorsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
  const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
  const items: Item[] = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)) || [];

  const handleAddItem = useCallback(() => {
    setLineItems(prev => [...prev, createNewLineItem()]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleItemChange = useCallback((index: number, field: keyof LineItem, value: any) => {
    setLineItems(prev => {
      const newItems = [...prev];
      const updatedItem = { ...newItems[index], [field]: value };
      if (field === 'qty' || field === 'rate') {
          updatedItem.amount = (updatedItem.qty || 0) * (updatedItem.rate || 0);
      }
      newItems[index] = updatedItem;
      return newItems;
    });
  }, []);

  const handleVendorChange = useCallback((value: string) => {
    if (value === 'add-new') {
        setIsVendorDialogOpen(true);
    } else {
        setVendor(value);
    }
  }, []);

  const openItemDialog = useCallback(() => {
    setIsItemDialogOpen(true);
  }, []);

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const totalTax = lineItems.reduce((acc, item) => acc + (item.qty * item.rate * item.taxRate / 100), 0);
  const totalBillAmount = subtotal + totalTax;

  const taxOnSourceAmount = (subtotal * 0.1) / 100;
  let totalAmountPayable = totalBillAmount;
  if (taxType === 'tds') {
    totalAmountPayable -= taxOnSourceAmount;
  } else if (taxType === 'tcs') {
    totalAmountPayable += taxOnSourceAmount;
  }


  const handleSaveBill = async () => {
    if (!accountingContext) return;
    const { addJournalVoucher } = accountingContext;

    const selectedVendor = vendors.find(v => v.id === vendor);
    if (!selectedVendor || !billNumber) {
        toast({ variant: "destructive", title: "Missing Details", description: "Please select a vendor and enter a bill number."});
        return;
    }

    const journalLines = [
        { account: '5050', debit: subtotal.toFixed(2), credit: '0' },
        { account: '2110', debit: totalTax.toFixed(2), credit: '0' }, 
        { account: selectedVendor.id, debit: '0', credit: totalAmountPayable.toFixed(2) } 
    ];

    if (taxOnSourceAmount > 0) {
      if (taxType === 'tds') {
        journalLines.push({ account: '2130', debit: '0', credit: taxOnSourceAmount.toFixed(2)}); // TDS Payable
      } else if (taxType === 'tcs') {
        journalLines.push({ account: '1470', debit: taxOnSourceAmount.toFixed(2), credit: '0'}); // TCS Receivable
      }
    }


    try {
        await addJournalVoucher({
            id: `JV-BILL-${billNumber}`,
            date: billDate ? format(billDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
            narration: `Purchase from ${selectedVendor.name} against Bill #${billNumber}`,
            lines: journalLines,
            amount: totalBillAmount,
            vendorId: vendor,
        });
        toast({ title: "Purchase Bill Saved", description: `Journal entry for bill #${billNumber} has been automatically created.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to save journal entry", description: e.message });
    }
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/purchases" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Purchase Bill</h1>
      </div>

      <PartyDialog type="Vendor" open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen} />
      <ItemDialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen} />

      <Card>
        <CardHeader>
          <CardTitle>Purchase Bill Details</CardTitle>
          <CardDescription>
            Fill out the details for your new purchase bill.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select onValueChange={handleVendorChange} value={vendor} disabled={vendorsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={vendorsLoading ? "Loading..." : "Select a vendor"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                  <Separator />
                  <SelectItem value="add-new" className="text-primary focus:text-primary">
                    <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" /> Add New Vendor
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="bill-no">Bill Number</Label>
              <Input id="bill-no" placeholder="Enter vendor invoice number" value={billNumber} onChange={e => setBillNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bill Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !billDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {billDate ? format(billDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={billDate}
                    onSelect={setBillDate}
                    initialFocus
                  />
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
                  <TableHead className="w-[30%]">Item</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                    <PurchaseItemRow 
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={() => handleRemoveItem(index)}
                        handleItemChange={handleItemChange}
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tax (e.g. IGST @18%)</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              <Separator/>
              <div className="flex justify-between font-semibold">
                <span>Total Bill Amount</span>
                <span>₹{totalBillAmount.toFixed(2)}</span>
              </div>
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
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount Payable</span>
                <span>₹{totalAmountPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Add any notes for this purchase bill..." className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
               <Label>Attach Bill Document</Label>
               <div className="relative w-48 h-24 rounded-md border flex items-center justify-center bg-muted/50">
                  <Upload className="size-8 text-muted-foreground" />
               </div>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveBill}>
            <Save className="mr-2" />
            Save Bill
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
