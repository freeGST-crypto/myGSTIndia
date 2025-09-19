
"use client";

import React, { Suspense } from 'react';
import { AccountingProvider } from "@/context/accounting-context";
import { Loader2 } from 'lucide-react';

export default function AccountingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AccountingProvider>
            <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}>
                {children}
            </Suspense>
        </AccountingProvider>
    );
}
