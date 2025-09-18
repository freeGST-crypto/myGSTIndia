
"use client";

import { useState } from "react";
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
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Sample data - in a real app, this would come from an API
const customers = [
  { id: "CUST-001", name: "Global Tech Inc." },
  { id: "CUST-002", name: "Innovate Solutions" },
  { id: "CUST-003", name: "Quantum Leap" },
];

const items = [
  { id: "ITEM-001", name: "Standard Office Chair", price: 7500, hsn: "9401" },
  {
    id: "ITEM-002",
    name: "Accounting Services",
    price: 15000,
    hsn: "9982",
  },
  {
    id: "ITEM-003",
    name: "Wireless Mouse",
    price: 8999,
    hsn: "8471",
  },
];

export default function NewInvoicePage() {
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [taxCompliance, setTaxCompliance] = useState("none"); // 'none', 'tds', 'tcs'
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
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem) {
        currentItem.description = selectedItem.name;
        currentItem.rate = selectedItem.price;
        currentItem.hsn = selectedItem.hsn;
        currentItem.amount = currentItem.qty * selectedItem.price;
      }
    }
    
    setLineItems(list);
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
  const totalTax = lineItems.reduce((acc, item) => acc + (item.amount * item.taxRate / 100), 0);
  
  // Calculate TDS (Sec 194Q) or TCS (Sec 206C(1H))
  // Using 0.1% as the standard rate for example purposes.
  const tdsAmount = taxCompliance === 'tds' ? (subtotal + totalTax) * 0.001 : 0;
  const tcsAmount = taxCompliance === 'tcs' ? (subtotal + totalTax) * 0.001 : 0;

  const totalAmount = subtotal + totalTax - tdsAmount + tcsAmount;


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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={setInvoiceDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
             <div className="space-y-2">
              <Label>Due Date</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
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
                       <Select onValueChange={(value) => handleItemChange(index, "itemId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((i) => (
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
                <span className="text-muted-foreground">Total GST</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              {taxCompliance === 'tds' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Less: TDS Receivable (0.1%)</span>
                  <span className="text-red-500">- ₹{tdsAmount.toFixed(2)}</span>
                </div>
              )}
               {taxCompliance === 'tcs' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add: TCS to Collect (0.1%)</span>
                  <span className="text-green-600">+ ₹{tcsAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator/>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea placeholder="Payment is due within 30 days..." className="mt-2 min-h-[120px]" />
              </div>
               <div>
                  <Label>Tax Compliance</Label>
                   <RadioGroup value={taxCompliance} onValueChange={setTaxCompliance} className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="tax-none" />
                        <Label htmlFor="tax-none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tds" id="tax-tds" />
                        <Label htmlFor="tax-tds">TDS Applicable (Sec 194Q - Buyer deducts)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tcs" id="tax-tcs" />
                        <Label htmlFor="tax-tcs">TCS Applicable (Sec 206C(1H) - Seller collects)</Label>
                      </div>
                    </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select if TDS or TCS applies as per Income Tax provisions based on turnover limits.
                  </p>
               </div>
            </div>
            <div className="space-y-2">
               <Label>Attach Signature</Label>
               <div className="relative w-48 h-24 rounded-md border flex items-center justify-center bg-muted/50">
                  <Upload className="size-8 text-muted-foreground" />
               </div>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>
            <Save className="mr-2" />
            Save Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
