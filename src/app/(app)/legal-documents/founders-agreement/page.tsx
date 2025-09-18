
"use client";

import { PlaceholderPage } from "@/components/placeholder-page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FoundersAgreementPage() {
    return (
        <div className="space-y-8">
            <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to Document Selection
            </Link>
            <PlaceholderPage 
                title="Founders’ Agreement Generator"
                description="This feature will provide a step-by-step wizard to create a comprehensive founders' agreement for your startup. It will cover equity split, vesting, roles, responsibilities, and more. This feature is currently under construction."
            />
        </div>
    );
}
