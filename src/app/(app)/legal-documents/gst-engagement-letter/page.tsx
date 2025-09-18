
"use client";

import { PlaceholderPage } from "@/components/placeholder-page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GstEngagementLetterPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to Document Selection
            </Link>
            <PlaceholderPage
                title="GST Engagement Letter Generator"
                description="This tool will help you generate a professional engagement letter for GST-related services. This feature is currently under construction and will be available soon."
            />
        </div>
    );
}
