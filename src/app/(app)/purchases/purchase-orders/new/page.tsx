
"use client";

import { useState } from "react";
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

// Sample data
const vendors = [
  { id: "VEND-001", name: "Supplier Alpha" },
  { id: "VEND-002", name: "Vendor Beta" },
  { id: "VEND-003", name: "Supplier Gamma" },
];

const items = [
  { id: "ITEM-001", name: "Standard Office Chair", price: 4500, hsn: "9401" },
  { id: "ITEM-003", name: "Wireless Mouse", price: 6000, hsn: "8471" },
  { id: "ITEM-004", name: "Raw Material A", price: 1200, hsn: "2901" },
  { id: "ITEM-005", name: "Packaging Boxes", price: 150, hsn: "4819" },
];

export default function NewPurchaseOrderPage() {
  const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
  const [expectedDate, setExpectedDate] = useState<Date | undefined>();
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
  const totalAmount = subtotal + totalTax;


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/purchases/purchase-orders" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Purchase Order</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Details</CardTitle>
          <CardDescription>
            Fill out the details for the new purchase order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
             <div className="space-y-2">
              <Label>Vendor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !orderDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {orderDate ? format(orderDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={setOrderDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
             <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDate ? format(expectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expectedDate}
                    onSelect={setExpectedDate}
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
          
          <div className="space-y-2">
              <Label>Terms & Conditions / Notes</Label>
              <Textarea placeholder="Add any specific terms for this purchase order..." className="min-h-[100px]" />
            </div>

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>
            <Save className="mr-2" />
            Save Purchase Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


