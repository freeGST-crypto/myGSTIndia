
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Keyboard, Receipt, BookCopy, Landmark, TrendingUp, Scale, ShoppingCart, FilePlus, FileMinus, Wallet, Book, Users, Warehouse, Home } from "lucide-react";
  
  const shortcuts = [
    { name: "Go to Dashboard", keys: "Esc", icon: Home },
    { name: "New Sales Invoice", keys: "Ctrl + I", icon: Receipt },
    { name: "New Purchase Bill", keys: "Ctrl + P", icon: ShoppingCart },
    { name: "New Credit Note", keys: "Alt + N", icon: FilePlus },
    { name: "New Debit Note", keys: "Ctrl + D", icon: FileMinus },
    { name: "Journal Vouchers", keys: "Ctrl + J", icon: BookCopy },
    { name: "Receipt & Payment", keys: "Ctrl + R", icon: Wallet },
    { name: "Balance Sheet", keys: "Ctrl + B", icon: Landmark },
    { name: "Profit & Loss", keys: "Ctrl + L", icon: TrendingUp },
    { name: "Trial Balance", keys: "Alt + T", icon: Scale },
    { name: "General Ledger", keys: "Ctrl + G", icon: Book },
    { name: "Parties", keys: "Alt + P", icon: Users },
    { name: "Items", keys: "Alt + I", icon: Warehouse },
  ];
  
  export function ShortcutGuide() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="size-5" /> Quick Actions
          </CardTitle>
          <CardDescription>Use keyboard shortcuts to navigate faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {shortcuts.map((shortcut) => (
              <li key={shortcut.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <shortcut.icon className="size-4 text-muted-foreground" />
                    <span>{shortcut.name}</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {shortcut.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }
