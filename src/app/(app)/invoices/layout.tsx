
"use client"

import React from 'react';
import { Suspense } from 'react';

export default function InvoiceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<div>Loading...</div>}>
                {children}
            </Suspense>
        </div>
    );
}
