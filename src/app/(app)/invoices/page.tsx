
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const InvoiceList = dynamic(() => import('@/components/billing/invoice-list'), { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
});

export default function InvoicesPage() {
    return <InvoiceList />;
}
