
"use client";

import { AccountingProvider } from '@/context/accounting-context';
import DashboardContent from '@/components/dashboard/dashboard-content';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    return (
        <AccountingProvider>
             <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}>
                <DashboardContent />
            </Suspense>
        </AccountingProvider>
    );
}
