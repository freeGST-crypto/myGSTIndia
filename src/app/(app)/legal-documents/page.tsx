
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Users, Handshake, Briefcase, Landmark, Shield, BookOpen, Library, Building, FileSignature, Wallet, BadgeCheck, FileArchive, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const documentTools = [
    { title: "Partnership Deed", description: "Create a legal document to form a business partnership.", href: "/legal-documents/partnership-deed", price: 3000, icon: Handshake },
    { title: "Rental Deed", description: "Draft a legal agreement for property rental.", href: "/legal-documents/rental-deed", price: 1500, icon: Landmark },
    { title: "Lease Deed", description: "Create a formal lease agreement for long-term property usage.", href: "/legal-documents/lease-deed", price: 1500, icon: Landmark },
    { title: "Self Affidavit for GST", description: "Generate a self-declaration affidavit for GST registration.", href: "/legal-documents/self-affidavit-gst", price: 0, icon: FileSignature },
    { title: "LLP Agreement", description: "Draft an agreement for a Limited Liability Partnership.", href: "/legal-documents/llp-agreement", price: 5000, icon: Handshake },
    { title: "Rental Receipts for HRA", description: "Generate monthly rental receipts for employees.", href: "/legal-documents/rental-receipts", price: 0, icon: FileText },
    { title: "Founders’ Agreement", description: "Essential legal document for startup co-founders.", href: "/legal-documents/founders-agreement", price: 7500, icon: Handshake },
    { title: "Loan Agreement", description: "Between partners/directors & the company.", href: "/legal-documents/loan-agreement", price: 0, icon: Wallet },
    { title: "GST Engagement Letter", description: "Between a client and a tax consultant.", href: "/legal-documents/gst-engagement-letter", price: 0, icon: FileText },
    { title: "Accounting Engagement Letter", description: "Formalize the terms of accounting services.", href: "/legal-documents/accounting-engagement-letter", price: 0, icon: FileText },
    { title: "NDA (Non-Disclosure Agreement)", description: "Protect sensitive company information.", href: "/legal-documents/nda", price: 1000, icon: Shield },
    { title: "Consultant / Freelancer Agreement", description: "Define terms for engaging independent contractors.", href: "/legal-documents/consultant-agreement", price: 2000, icon: Briefcase },
    { title: "Vendor Agreement", description: "Set terms with your suppliers and vendors.", href: "/legal-documents/vendor-agreement", price: 0, icon: Briefcase },
    { title: "Service Agreement", description: "A general-purpose agreement for providing services.", href: "/legal-documents/service-agreement", price: 0, icon: Briefcase },
    { title: "Franchise Agreement", description: "Establish the terms of a franchise relationship.", href: "/legal-documents/franchise-agreement", price: 0, icon: Handshake },
    { title: "Offer Letter", description: "Generate a formal job offer for prospective employees.", href: "/legal-documents/offer-letter", price: 500, icon: FileText },
    { title: "Appointment Letter", description: "Create a detailed appointment letter for new hires.", href: "/legal-documents/appointment-letter", price: 0, icon: FileText },
    { title: "Internship Agreement", description: "Define the terms and conditions for an internship.", href: "/legal-documents/internship-agreement", price: 0, icon: FileText },
    { title: "Board Resolutions Library", description: "Templates for common board resolutions.", href: "/legal-documents/board-resolutions", price: 750, icon: Library },
    { title: "Shareholders’ Agreement (SHA)", description: "Define rights and obligations of shareholders.", href: "/legal-documents/shareholders-agreement", price: 0, icon: Users },
    { title: "ESOP Trust Deed / Policy", description: "Establish an Employee Stock Option Plan.", href: "/legal-documents/esop-policy", price: 0, icon: BookOpen },
    { title: "Convertible Note / SAFE Agreement", description: "For early-stage startup fundraising.", href: "/legal-documents/safe-agreement", price: 0, icon: FileSignature },
    { title: "Society Registration Deed", description: "Register a new society with a formal deed.", href: "/legal-documents/society-registration-deed", price: 0, icon: Users },
    { title: "Trust Deed", description: "Formally establish a trust with a legal deed.", href: "/legal-documents/trust-deed", price: 0, icon: Handshake },
    { title: "MOA & AOA", description: "Memorandum and Articles of Association for companies.", href: "/legal-documents/moa-aoa", price: 0, icon: Building },
    { title: "Statutory Registers (Co. Act)", description: "Generate mandatory statutory registers for your company.", href: "/legal-documents/statutory-registers", price: 0, icon: FileArchive },
];

export default function LegalDocumentsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-block rounded-full bg-primary/10 p-4">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Legal & Business Document Generators</h1>
        <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
          Quickly create essential legal and business documents using our guided wizards.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTools.map((tool) => (
          <Card key={tool.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{tool.title}</CardTitle>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Link href={tool.href} passHref className="w-full">
                <Button className="w-full">
                    Start Drafting {tool.price > 0 ? `- ₹${tool.price}` : ''}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
