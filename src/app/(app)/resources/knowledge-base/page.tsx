"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

// A simplified representation of your menu structure for documentation
const featurePanels = [
    { name: "Dashboard", href: "/resources/knowledge-base/dashboard", description: "Understand your main dashboard widgets and charts." },
    { name: "Billing", href: "/resources/knowledge-base/billing", description: "Learn how to create and manage invoices, purchases, and notes." },
    { name: "Accounting", href: "/resources/knowledge-base/accounting", description: "Explore the core accounting features like Journal, Ledgers, and Final Accounts." },
    { name: "GST Filings", href: "/resources/knowledge-base/gst-filings", description: "A guide to preparing and filing your GST returns." },
    { name: "Legal Documents", href: "/resources/knowledge-base/legal-documents", description: "How to use the legal document generation wizards." },
    { name: "CA Certificates", href: "/resources/knowledge-base/ca-certificates", description: "Generate various certificates required for your business." },
];

export default function KnowledgeBasePage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                 <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">GSTEase Knowledge Base</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Your comprehensive guide to all the features and functionalities of the GSTEase platform. Select a panel to learn more.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {featurePanels.map(panel => (
                     <Card key={panel.name} className="flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{panel.name}</CardTitle>
                            <CardDescription>
                                {panel.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                            <Link href={panel.href} passHref>
                                <Button variant="outline">
                                    <span>Read Guide</span>
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                 ))}
            </div>
        </div>
    );
}
