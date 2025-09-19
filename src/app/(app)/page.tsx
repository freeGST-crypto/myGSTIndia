"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { AccountingProvider } from '@/context/accounting-context';
import DashboardContent from './dashboard/dashboard-content';

export default function Page() {
    return (
        <AccountingProvider>
            <DashboardContent />
        </AccountingProvider>
    );
}
