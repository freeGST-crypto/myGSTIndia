
"use client";

import DashboardContent from '@/components/dashboard/dashboard-content';
import { AccountingProvider } from '@/context/accounting-context';

export default function DashboardPage() {
    return (
        <AccountingProvider>
            <DashboardContent />
        </AccountingProvider>
    );
}
