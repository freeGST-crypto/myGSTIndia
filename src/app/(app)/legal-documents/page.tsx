
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { PlaceholderPage } from "@/components/placeholder-page";

const documentTypes = [
    {
        name: "Partnership Deed",
        description: "Create a legal document to form a business partnership.",
        href: "/legal-documents/partnership-deed",
        icon: FileText,
        status: "active"
    },
    {
        name: "Rental Deed",
        description: "Draft a legal agreement for property rental.",
        href: "/legal-documents/rental-deed",
        icon: FileText,
        status: "active"
    },
    {
        name: "Lease Deed",
        description: "Create a formal lease agreement for long-term property usage.",
        href: "/legal-documents/lease-deed",
        icon: FileText,
        status: "active"
    },
    {
        name: "Self Affidavit for GST",
        description: "Generate a self-declaration affidavit for GST registration.",
        href: "/legal-documents/self-affidavit-gst",
        icon: FileText,
        status: "active"
    },
    {
        name: "Society Registration Deed",
        description: "Register a new society with a formal deed.",
        href: "#",
        icon: FileText,
        status: "coming_soon"
    },
    {
        name: "Trust Deed",
        description: "Formally establish a trust with a legal deed.",
        href: "#",
        icon: FileText,
        status: "coming_soon"
    },
    {
        name: "LLP Agreement",
        description: "Draft an agreement for a Limited Liability Partnership.",
        href: "#",
        icon: FileText,
        status: "coming_soon"
    },
    {
        name: "MOA & AOA",
        description: "Memorandum and Articles of Association for companies.",
        href: "#",
        icon: FileText,
        status: "coming_soon"
    },
     {
        name: "Rental Receipts for HRA",
        description: "Generate monthly rental receipts for employees.",
        href: "#",
        icon: FileText,
        status: "coming_soon"
    }
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
                     <Card key={doc.name}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <doc.icon className="text-primary"/> {doc.name}
                            </CardTitle>
                            <CardDescription>
                                {doc.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {doc.status === 'active' ? (
                                <Link href={doc.href} passHref>
                                    <Button>
                                        <span>Start Drafting</span>
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
