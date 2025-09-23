
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Keyboard, Receipt, FileText, BookCopy, Landmark, TrendingUp, Scale, FilePlus, FileMinus, Wallet, Book, Users, Warehouse } from "lucide-react";
import * as Icons from "lucide-react";

type Shortcut = {
  name: string;
  category: "Vouchers" | "Reports" | "Masters";
  shortcut: string;
  description: string;
  icon: keyof typeof Icons;
};

const appShortcuts: Shortcut[] = [
    {
        name: "New Sales Invoice",
        category: "Vouchers",
        shortcut: "Ctrl + I",
        description: "Jump to the new sales invoice creation page.",
        icon: "Receipt"
    },
    {
        name: "New Purchase Bill",
        category: "Vouchers",
        shortcut: "Ctrl + P",
        description: "Jump to the new purchase bill creation page.",
        icon: "ShoppingCart"
    },
    {
        name: "New Journal Voucher",
        category: "Vouchers",
        shortcut: "Ctrl + J",
        description: "Jump to the journal to create a new manual entry.",
        icon: "BookCopy"
    },
     {
        name: "New Credit Note",
        category: "Vouchers",
        shortcut: "Ctrl + N",
        description: "Jump to the new credit note creation page.",
        icon: "FilePlus"
    },
    {
        name: "New Debit Note",
        category: "Vouchers",
        shortcut: "Ctrl + D",
        description: "Jump to the new debit note creation page.",
        icon: "FileMinus"
    },
     {
        name: "Receipt & Payment Vouchers",
        category: "Vouchers",
        shortcut: "Ctrl + R",
        description: "Go to the Receipt & Payment vouchers page.",
        icon: "Wallet"
    },
    {
        name: "Balance Sheet",
        category: "Reports",
        shortcut: "Ctrl + B",
        description: "Go directly to the Balance Sheet report.",
        icon: "Landmark"
    },
    {
        name: "Profit & Loss",
        category: "Reports",
        shortcut: "Ctrl + L",
        description: "Go directly to the Profit & Loss statement.",
        icon: "TrendingUp"
    },
    {
        name: "Trial Balance",
        category: "Reports",
        shortcut: "Ctrl + T",
        description: "Go directly to the Trial Balance report.",
        icon: "Scale"
    },
    {
        name: "General Ledger",
        category: "Reports",
        shortcut: "Ctrl + G",
        description: "Go directly to the General Ledger page.",
        icon: "Book"
    },
    {
        name: "Parties (Customers/Vendors)",
        category: "Masters",
        shortcut: "Alt + P",
        description: "Go to the Parties management page.",
        icon: "Users"
    },
    {
        name: "Items (Products/Services)",
        category: "Masters",
        shortcut: "Alt + I",
        description: "Go to the Items management page.",
        icon: "Warehouse"
    }
];

export default function AppShortcutsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredShortcuts = useMemo(() => {
    if (!searchTerm) {
      return appShortcuts;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return appShortcuts.filter(
      (shortcut) =>
        shortcut.name.toLowerCase().includes(lowercasedFilter) ||
        shortcut.description.toLowerCase().includes(lowercasedFilter) ||
        shortcut.shortcut.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);
  
  const groupedShortcuts = useMemo(() => {
    return filteredShortcuts.reduce((acc, shortcut) => {
      const { category } = shortcut;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    }, {} as Record<string, Shortcut[]>);
  }, [filteredShortcuts]);

  const renderIcon = (iconName: keyof typeof Icons) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className="size-4 text-muted-foreground" /> : null;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
          <Keyboard className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Application Shortcuts</h1>
        <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
          A quick reference guide for GSTEase keyboard shortcuts to speed up your workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shortcuts..."
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category}>
                    <h2 className="text-xl font-semibold mb-4">{category}</h2>
                    <div className="border rounded-md">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-1/3">Action</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Shortcut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((shortcut) => (
                            <TableRow key={shortcut.name}>
                                <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {renderIcon(shortcut.icon as keyof typeof Icons)}
                                    <span>{shortcut.name}</span>
                                </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{shortcut.description}</TableCell>
                                <TableCell className="text-right">
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    {shortcut.shortcut}
                                </kbd>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                </div>
            ))}
             {filteredShortcuts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No shortcuts found for "{searchTerm}"</p>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
