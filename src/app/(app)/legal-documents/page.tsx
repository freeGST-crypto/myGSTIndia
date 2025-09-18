
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, BookCopy } from "lucide-react";
import Link from "next/link";

const documentTypes = [
    {
        name: "Partnership Deed",
        description: "Create a legal document to form a business partnership.",
        href: "/legal-documents/partnership-deed",
        icon: FileText,
        status: "active",
        price: 3000,
    },
    {
        name: "Rental Deed",
        description: "Draft a legal agreement for property rental.",
        href: "/legal-documents/rental-deed",
        icon: FileText,
        status: "active",
        price: 1500,
    },
    {
        name: "Lease Deed",
        description: "Create a formal lease agreement for long-term property usage.",
        href: "/legal-documents/lease-deed",
        icon: FileText,
        status: "active",
        price: 1500,
    },
    {
        name: "Self Affidavit for GST",
        description: "Generate a self-declaration affidavit for GST registration.",
        href: "/legal-documents/self-affidavit-gst",
        icon: FileText,
        status: "active"
    },
    {
        name: "LLP Agreement",
        description: "Draft an agreement for a Limited Liability Partnership.",
        href: "/legal-documents/llp-agreement",
        icon: FileText,
        status: "active",
        price: 5000,
    },
     {
        name: "Rental Receipts for HRA",
        description: "Generate monthly rental receipts for employees.",
        href: "/legal-documents/rental-receipts",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Founders’ Agreement",
        description: "Essential legal document for startup co-founders.",
        href: "/legal-documents/founders-agreement",
        icon: FileText,
        status: "active",
        price: 7500,
    },
    {
        name: "Loan Agreement",
        description: "Between partners/directors & the company.",
        href: "/legal-documents/loan-agreement",
        icon: FileText,
        status: "active"
    },
    {
        name: "GST Engagement Letter",
        description: "Between a client and a tax consultant.",
        href: "/legal-documents/gst-engagement-letter",
        icon: FileText,
        status: "active"
    },
    {
        name: "Accounting Engagement Letter",
        description: "Formalize the terms of accounting services.",
        href: "/legal-documents/accounting-engagement-letter",
        icon: FileText,
        status: "active"
    },
    {
        name: "NDA (Non-Disclosure Agreement)",
        description: "Protect sensitive company information.",
        href: "/legal-documents/nda",
        icon: FileText,
        status: "active",
        price: 1000,
    },
    {
        name: "Consultant / Freelancer Agreement",
        description: "Define terms for engaging independent contractors.",
        href: "/legal-documents/consultant-agreement",
        icon: FileText,
        status: "wip",
        price: 2000,
    },
    {
        name: "Vendor Agreement",
        description: "Set terms with your suppliers and vendors.",
        href: "/legal-documents/vendor-agreement",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Service Agreement",
        description: "A general-purpose agreement for providing services.",
        href: "/legal-documents/service-agreement",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Franchise Agreement",
        description: "Establish the terms of a franchise relationship.",
        href: "/legal-documents/franchise-agreement",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Offer Letter",
        description: "Generate a formal job offer for prospective employees.",
        href: "/legal-documents/offer-letter",
        icon: FileText,
        status: "wip",
        price: 500,
    },
    {
        name: "Appointment Letter",
        description: "Create a detailed appointment letter for new hires.",
        href: "/legal-documents/appointment-letter",
        icon: FileText,
        status: "active"
    },
    {
        name: "Internship Agreement",
        description: "Define the terms and conditions for an internship.",
        href: "/legal-documents/internship-agreement",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Board Resolutions Library",
        description: "Templates for common board resolutions.",
        href: "/legal-documents/board-resolutions",
        icon: FileText,
        status: "wip",
        price: 750,
    },
    {
        name: "Shareholders’ Agreement (SHA)",
        description: "Define rights and obligations of shareholders.",
        href: "/legal-documents/shareholders-agreement",
        icon: FileText,
        status: "wip"
    },
    {
        name: "ESOP Trust Deed / Policy",
        description: "Establish an Employee Stock Option Plan.",
        href: "/legal-documents/esop-policy",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Convertible Note / SAFE Agreement",
        description: "For early-stage startup fundraising.",
        href: "/legal-documents/safe-agreement",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Society Registration Deed",
        description: "Register a new society with a formal deed.",
        href: "/legal-documents/society-registration-deed",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Trust Deed",
        description: "Formally establish a trust with a legal deed.",
        href: "/legal-documents/trust-deed",
        icon: FileText,
        status: "wip"
    },
    {
        name: "MOA & AOA",
        description: "Memorandum and Articles of Association for companies.",
        href: "/legal-documents/moa-aoa",
        icon: FileText,
        status: "wip"
    },
    {
        name: "Statutory Registers (Co. Act)",
        description: "Generate mandatory statutory registers for your company.",
        href: "/legal-documents/statutory-registers",
        icon: BookCopy,
        status: "wip"
    },
]

export default function LegalDocumentsPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Legal Document Generator</h1>
                <p className="text-muted-foreground">Select a document type to start drafting.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {documentTypes.map(doc => (
                     <Card key={doc.name} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <doc.icon className="text-primary"/> {doc.name}
                            </CardTitle>
                            <CardDescription>
                                {doc.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                             {doc.status === 'active' ? (
                                <Link href={doc.href} passHref>
                                    <Button>
                                        <span>
                                            Start Drafting
                                            {doc.price && ` - ₹${'\'doc.price\''}`}
                                        </span>
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </Link>
                             ) : (
                                 <Button disabled variant="outline">Coming Soon</Button>
                             )}
                        </CardContent>
                    </Card>
                 ))}
            </div>
        </div>
    );
}
