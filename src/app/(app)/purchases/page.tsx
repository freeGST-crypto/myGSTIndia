
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PurchaseList = dynamic(() => import('@/components/purchases/purchase-list'), { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
});

export default function PurchasesPage() {
    return <PurchaseList />;
}
