"use client";

import { useState, useContext } from "react";
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


export default function NewPurchasePage() {
  const accountingContext = useContext(AccountingContext);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const [billDate, setBillDate] = useState<Date | undefined>(new Date());
  const [vendor, setVendor] = useState("");
  const [billNumber, setBillNumber] = useState("");

  const [lineItems, setLineItems] = useState([
    {
      itemId: "",
      description: "",
      hsn: "",
      qty: 1,
      rate: 0,
      taxRate: 18,
      amount: 0,
    },
  ]);
  
  const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
  const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
  const vendors = vendorsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
  const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
  const items = itemsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      {
        itemId: "",
        description: "",
        hsn: "",
        qty: 1,
        rate: 0,
        taxRate: 18,
        amount: 0,
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

    if (field === 'qty' || field === 'rate') {
      currentItem.amount = currentItem.qty * currentItem.rate;
    }

    if (field === 'itemId') {
      const selectedItem = items.find((i: any) => i.id === value);
      if (selectedItem) {
        currentItem.description = selectedItem.name;
        currentItem.rate = selectedItem.purchasePrice || 0;
        currentItem.hsn = selectedItem.hsn || "";
        currentItem.amount = currentItem.qty * (selectedItem.purchasePrice || 0);
      }
    }
    
    setLineItems(list);
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
  const totalTax = lineItems.reduce((acc, item) => acc + (item.amount * item.taxRate / 100), 0);
  const totalAmount = subtotal + totalTax;

  const handleSaveBill = async () => {
    if (!accountingContext) return;
    const { addJournalVoucher } = accountingContext;

    const selectedVendor = vendors.find(v => v.id === vendor);
    if (!selectedVendor || !billNumber) {
        toast({ variant: "destructive", title: "Missing Details", description: "Please select a vendor and enter a bill number."});
        return;
    }

    // This creates the double-entry accounting transaction for the purchase.
    const journalLines = [
        { account: '5050', debit: subtotal.toFixed(2), credit: '0' }, // Debit Purchases
        { account: '2110', debit: totalTax.toFixed(2), credit: '0' }, // Debit GST Payable (for ITC)
        { account: '2010', debit: '0', credit: totalAmount.toFixed(2) } // Credit Accounts Payable
    ];

    try {
        await addJournalVoucher({
            id: `JV-BILL-${billNumber}`,
            date: billDate ? format(billDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
            narration: `Purchase from ${selectedVendor.name} against Bill #${billNumber}`,
            lines: journalLines,
            amount: totalAmount,
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
              <Select onValueChange={setVendor} disabled={vendorsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={vendorsLoading ? "Loading..." : "Select a vendor"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
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
                  <TableRow key={index}>
                    <TableCell>
                       <Select onValueChange={(value) => handleItemChange(index, "itemId", value)} disabled={itemsLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder={itemsLoading ? "Loading..." : "Select item"} />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((i: any) => (
                              <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                            ))}
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
                        onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{item.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" onClick={handleAddItem}>
              <PlusCircle className="mr-2" />
              Add Item
            </Button>
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
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
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
