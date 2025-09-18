
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Award } from "lucide-react";
import Link from "next/link";

const certificateTypes = [
    {
        name: "Net Worth Certificate",
        description: "Certify the net worth of an individual or entity.",
        href: "/ca-certificates/net-worth",
        icon: FileText,
        status: "active"
    },
    {
        name: "Turnover Certificate",
        description: "Certify the annual turnover of a business.",
        href: "/ca-certificates/turnover",
        icon: FileText,
        status: "active"
    },
    {
        name: "Visa/Immigration Certificate",
        description: "Generate income and net worth certificates for visa purposes.",
        href: "/ca-certificates/visa-immigration",
        icon: FileText,
        status: "active"
    },
    {
        name: "Capital Contribution Certificate",
        description: "Certify the capital brought in by partners/directors.",
        href: "/ca-certificates/capital-contribution",
        icon: FileText,
        status: "active"
    },
    {
        name: "Foreign Remittance (Form 15CB)",
        description: "Prepare Form 15CB for remittances made to non-residents.",
        href: "/ca-certificates/foreign-remittance",
        icon: FileText,
        status: "active"
    },
    {
        name: "General Attestation",
        description: "A general-purpose attestation form.",
        href: "#",
        icon: FileText,
        status: "inactive"
    },
];

export default function CACertificatesPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                 <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
                    <Award className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">CA Certificate Generator</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Select a certificate type to begin drafting. The system will guide you through the required information and generate a draft for your review and signature.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {certificateTypes.map(doc => (
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
