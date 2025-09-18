"use client";

import { PlaceholderPage } from "@/components/placeholder-page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FranchiseAgreementPage() {
    return (
        <div className="space-y-8">
            <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to Document Selection
            </Link>
            <PlaceholderPage 
                title="Franchise Agreement Generator"
                description="This tool will guide you through creating a comprehensive franchise agreement. This feature is currently under construction."
            />
        </div>
    );
}
