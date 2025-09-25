
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Keyboard, Receipt, BookCopy, Home, Zap, ShoppingCart, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
  
  const shortcuts = [
    { name: "Go to Dashboard", keys: "Esc", href: "/dashboard" },
    { name: "New Sales Invoice", keys: "Ctrl + I", href: "/billing/invoices/new" },
    { name: "New Purchase Bill", keys: "Ctrl + P", href: "/purchases/new" },
    { name: "Journal Vouchers", keys: "Ctrl + J", href: "/accounting/journal" },
  ];
  
  export function ShortcutGuide({ onQuickInvoiceClick }: { onQuickInvoiceClick: () => void; }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5" /> Quick Actions
          </CardTitle>
          <CardDescription>Create entries and navigate faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={onQuickInvoiceClick}>
                <Receipt className="mr-2" />
                Quick Invoice
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    Ctrl + I
                </kbd>
              </Button>
              <Link href="/purchases/rapid" passHref>
                <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="mr-2" />
                    Quick Purchase
                     <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        Ctrl + P
                    </kbd>
                </Button>
              </Link>
               <Link href="/accounting/vouchers/rapid" passHref>
                <Button variant="outline" className="w-full justify-start">
                    <Wallet className="mr-2" />
                    Receipt
                     <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        Ctrl + R
                    </kbd>
                </Button>
              </Link>
                <Link href="/accounting/vouchers/rapid" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <IndianRupee className="mr-2" />
                        Payment
                        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            F5
                        </kbd>
                    </Button>
                </Link>
                <Link href="/accounting/journal" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <BookCopy className="mr-2" />
                        Journal
                        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            Ctrl + J
                        </kbd>
                    </Button>
                </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
