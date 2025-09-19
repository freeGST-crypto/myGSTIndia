
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DashboardPage = dynamic(() => import('./dashboard/page'), { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
});

export default function Page() {
    return <DashboardPage />;
}
