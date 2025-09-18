
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

const resolutionTypes = [
    { name: "Opening of Bank Account", href: "/legal-documents/board-resolutions/opening-of-bank-account", status: "active" },
    { name: "Appointment of First Auditor", href: "/legal-documents/board-resolutions/appointment-of-auditor", status: "active" },
    { name: "Approval of Annual Accounts", href: "/legal-documents/board-resolutions/approval-of-annual-accounts", status: "active" },
    { name: "Appointment of Additional Director", href: "/legal-documents/board-resolutions/appointment-of-director", status: "active" },
    { name: "Approval of Loan from Director", href: "/legal-documents/board-resolutions/approval-of-loan", status: "active" },
    { name: "Borrowing Powers (Bank Loan)", href: "/legal-documents/board-resolutions/borrowing-powers", status: "active" },
    { name: "Issue of Share Certificates", href: "/legal-documents/board-resolutions/issue-of-share-certificates", status: "active" },
    { name: "Shifting of Registered Office", href: "/legal-documents/board-resolutions/shifting-of-registered-office", status: "active" },
];

export default function BoardResolutionsLibraryPage() {
    return (
        <div className="space-y-8">
             <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to Document Selection
            </Link>
            <div className="text-center">
                <h1 className="text-3xl font-bold">Board Resolutions Library</h1>
                <p className="text-muted-foreground">Select a resolution type to start generating the document.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {resolutionTypes.map(res => (
                     <Card key={res.name}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <FileText className="text-primary"/> {res.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             {res.status === 'active' ? (
                                <Link href={res.href} passHref>
                                    <Button>
                                        <span>Generate</span>
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
