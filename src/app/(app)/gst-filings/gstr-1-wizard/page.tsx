"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const Gstr1Wizard = dynamic(
  () => import('@/components/gst-wizards/gstr1-wizard'),
  { 
    ssr: false,
    loading: () => (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }
);

export default function Gstr1WizardPage() {
    return <Gstr1Wizard />;
}
