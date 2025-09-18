
"use client";

import { PlaceholderPage } from "@/components/placeholder-page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VendorAgreementPage() {
    return (
        <div className="space-y-8">
            <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to Document Selection
            </Link>
            <PlaceholderPage 
                title="Vendor Agreement Generator"
                description="This tool will help you create a formal agreement to set clear terms with your suppliers and vendors. This feature is currently under construction."
            />
        </div>
    );
}
