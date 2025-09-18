
"use client";

import { PlaceholderPage } from "@/components/placeholder-page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AccountingEngagementLetterPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to Document Selection
            </Link>
            <PlaceholderPage
                title="Accounting Engagement Letter Generator"
                description="This tool will help you draft a formal agreement for accounting and bookkeeping services. This feature is currently under construction and will be available soon."
            />
        </div>
    );
}
