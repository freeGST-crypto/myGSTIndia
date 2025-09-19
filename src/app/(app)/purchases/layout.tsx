
"use client";

import React, { Suspense } from 'react';
import { AccountingProvider } from "@/context/accounting-context";
import { Loader2 } from 'lucide-react';

export default function PurchaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AccountingProvider>
            <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}>
                <div className="mx-auto w-full max-w-7xl">{children}</div>
            </Suspense>
        </AccountingProvider>
    );
}
