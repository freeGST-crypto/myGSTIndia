
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
import { Textarea } from "@/components/ui/textarea";

const vendors = [
  { id: "VEND-001", name: "Supplier Alpha" },
  { id: "VEND-002", name: "Vendor Beta" },
  { id: "VEND-003", name: "Supplier Gamma" },
];

const purchases = [
    { id: "PUR-001", vendorId: "VEND-001" },
    { id: "PUR-002", vendorId: "VEND-002" },
    { id: "PUR-003", vendorId: "VEND-003" },
];

export default function NewDebitNotePage() {
  const [debitNoteDate, setDebitNoteDate] = useState<Date | undefined>(new Date());
  const [lineItems, setLineItems] = useState([
    {
      description: "",
      qty: 1,
      rate: 0,
      amount: 0,
    },
  ]);

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: "",
        qty: 1,
        rate: 0,
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
      currentItem.amount = (currentItem.qty || 0) * (currentItem.rate || 0);
    }
    
    setLineItems(list);
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
  const totalTax = subtotal * 0.18; // Assuming a flat 18% tax for simplicity
  const totalAmount = subtotal + totalTax;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/billing/debit-notes" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Debit Note</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debit Note Details</CardTitle>
          <CardDescription>
            Fill out the details for the new debit note.
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
              <Label>Original Purchase #</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a purchase" />
                </SelectTrigger>
                <SelectContent>
                  {purchases.map((purchase) => (
                    <SelectItem key={purchase.id} value={purchase.id}>
                      {purchase.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Debit Note Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !debitNoteDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {debitNoteDate ? format(debitNoteDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={debitNoteDate}
                    onSelect={setDebitNoteDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Items to Debit</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Description</TableHead>
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
                       <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="e.g., 'Goods returned due to damage'"
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
                <span>Total Debit</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
           <div className="space-y-2">
              <Label>Reason for Debit Note</Label>
              <Textarea placeholder="e.g., Purchase return, quality issue, etc." className="min-h-[100px]" />
            </div>

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>
            <Save className="mr-2" />
            Save Debit Note
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
