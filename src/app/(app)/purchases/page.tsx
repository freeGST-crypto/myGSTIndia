"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the main component with SSR turned off
const PurchaseList = dynamic(
  () => import('@/components/purchases/purchase-list'),
  { 
    ssr: false,
    loading: () => (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }
);

export default function PurchasesPage() {
    return <PurchaseList />;
}
