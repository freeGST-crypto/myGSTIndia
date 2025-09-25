
"use client";

import React, { memo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, PlusCircle } from "lucide-react";

export type LineItem = {
    id: string; // Unique ID for key prop
    itemId: string;
    description: string;
    hsn: string;
    qty: number;
    rate: number;
    taxRate: number;
    amount: number;
};

export type Item = {
  id: string;
  name: string;
  hsn: string;
  sellingPrice?: number;
  purchasePrice?: number;
  [key: string]: any;
};

interface ItemRowProps {
    item: LineItem;
    index: number;
    onRemove: (index: number) => void;
    handleItemChange: (index: number, field: keyof LineItem, value: any) => void;
    handleSelectChange: (index: number, itemId: string) => void;
    items: Item[];
    itemsLoading: boolean;
    isPurchase: boolean;
}

const ItemRow = memo(({
    item,
    index,
    onRemove,
    handleItemChange,
    handleSelectChange,
    items,
    itemsLoading,
    isPurchase
}: ItemRowProps) => {
    
    const taxableAmount = item.qty * item.rate;

    const renderSalesColumns = () => (
        <>
            <TableCell>
                <Input type="number" value={item.taxRate} onChange={(e) => handleItemChange(index, "taxRate", parseFloat(e.target.value) || 0)} className="w-16 text-right" />
            </TableCell>
            <TableCell className="text-right font-mono">₹{(taxableAmount * (item.taxRate / 100)).toFixed(2)}</TableCell>
            <TableCell className="text-right font-mono">₹0.00</TableCell>
            <TableCell className="text-right font-mono">₹0.00</TableCell>
        </>
    );

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
             {!isPurchase && <TableCell><Input value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} /></TableCell>}
            <TableCell><Input value={item.hsn} onChange={(e) => handleItemChange(index, "hsn", e.target.value)} /></TableCell>
            <TableCell><Input type="number" value={item.qty} onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 0)} className="w-16 text-right" /></TableCell>
            <TableCell><Input type="number" value={item.rate} onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} className="w-24 text-right" /></TableCell>
            <TableCell className="text-right font-medium">₹{taxableAmount.toFixed(2)}</TableCell>
            {!isPurchase && renderSalesColumns()}
            <TableCell className="text-right">
               <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </TableCell>
        </TableRow>
    );
});
ItemRow.displayName = 'ItemRow';

interface ItemTableProps {
    lineItems: LineItem[];
    setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
    items: Item[];
    itemsLoading: boolean;
    isPurchase: boolean;
    openItemDialog: () => void;
}

export function ItemTable({ lineItems, setLineItems, items, itemsLoading, isPurchase, openItemDialog }: ItemTableProps) {
    const handleAddItem = useCallback(() => {
        setLineItems(prev => [...prev, {
            id: `${Date.now()}-${Math.random()}`,
            itemId: "", description: "", hsn: "", qty: 1, rate: 0, taxRate: 18, amount: 0,
          }]);
    }, [setLineItems]);

    const handleRemoveItem = useCallback((index: number) => {
        setLineItems(prev => prev.filter((_, i) => i !== index));
    }, [setLineItems]);

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
    }, [setLineItems]);

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
                        const price = isPurchase ? selectedItem.purchasePrice : selectedItem.sellingPrice;
                        return {
                            ...item,
                            itemId: itemId,
                            description: selectedItem.name,
                            rate: price || 0,
                            hsn: selectedItem.hsn || "",
                            amount: (item.qty || 0) * (price || 0)
                        };
                    }
                    return item;
                })
            );
        }
    }, [items, openItemDialog, isPurchase, setLineItems]);
    
    const salesHeaders = ["Tax Rate", "IGST", "CGST", "SGST"];
    const purchaseHeaders = ["HSN", "Qty", "Rate", "Amount", "Action"];
    const commonHeadersStart = ["Item"];
    const commonHeadersMid = isPurchase ? [] : ["Description"];

    const headers = isPurchase
    ? [...commonHeadersStart, ...commonHeadersMid, ...purchaseHeaders]
    : [...commonHeadersStart, ...commonHeadersMid, "Qty", "Rate", "Taxable Amt", ...salesHeaders, "Action"];

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map(header => (
                            <TableHead key={header} className={["Amount", "Qty", "Rate", "Taxable Amt", "IGST", "CGST", "SGST", "Action"].includes(header) ? "text-right" : ""}>
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lineItems.map((item, index) => (
                        <ItemRow
                            key={item.id}
                            item={item}
                            index={index}
                            onRemove={handleRemoveItem}
                            handleItemChange={handleItemChange}
                            handleSelectChange={handleSelectChange}
                            items={items}
                            itemsLoading={itemsLoading}
                            isPurchase={isPurchase}
                        />
                    ))}
                </TableBody>
            </Table>
            <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                    <PlusCircle className="mr-2" /> Add Row
                </Button>
            </div>
        </div>
    );
}

