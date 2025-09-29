
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Users, Handshake, Briefcase, Landmark, Shield, BookOpen, Library, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const documentTools = [
  {
    title: "Founders' Agreement",
    description: "Establish roles, responsibilities, equity ownership, and vesting schedules for your co-founders.",
    icon: Handshake,
    href: "/legal-documents/founders-agreement",
  },
  {
    title: "LLP Agreement",
    description: "Create a comprehensive Limited Liability Partnership (LLP) agreement with AI-suggested clauses.",
    icon: Users,
    href: "/legal-documents/llp-agreement",
  },
  {
    title: "Partnership Deed",
    description: "Draft a formal agreement for a partnership firm, outlining capital, profit sharing, and partner duties.",
    icon: Users,
    href: "/legal-documents/partnership-deed",
  },
  {
    title: "Consultant / Freelancer Agreement",
    description: "A general-purpose agreement for engaging independent contractors and freelancers.",
    icon: Briefcase,
    href: "/legal-documents/consultant-agreement",
  },
   {
    title: "Vendor Agreement",
    description: "Set clear terms with your suppliers and vendors for goods or services.",
    icon: Briefcase,
    href: "/legal-documents/vendor-agreement",
  },
   {
    title: "Service Agreement",
    description: "A general-purpose agreement for providing services to clients.",
    icon: Briefcase,
    href: "/legal-documents/service-agreement",
  },
  {
    title: "Rental / Lease Deed",
    description: "Generate a rental agreement for residential or commercial properties.",
    icon: Landmark,
    href: "/legal-documents/rental-deed",
  },
   {
    title: "Loan Agreement (from Director)",
    description: "Formalize an unsecured loan from a director or partner to the company.",
    icon: Landmark,
    href: "/legal-documents/loan-agreement",
  },
  {
    title: "Non-Disclosure Agreement (NDA)",
    description: "Protect your confidential business information when sharing it with third parties.",
    icon: Shield,
    href: "/legal-documents/nda",
  },
   {
    title: "Board Resolutions Library",
    description: "Generate certified true copies of common board resolutions for company compliance.",
    icon: Library,
    href: "/legal-documents/board-resolutions",
  },
  {
    title: "Offer Letter",
    description: "Create and print a professional job offer letter for a prospective employee.",
    icon: FileText,
    href: "/legal-documents/offer-letter",
  },
  {
    title: "Appointment Letter",
    description: "Generate a detailed appointment letter for new hires, outlining key terms of employment.",
    icon: FileText,
    href: "/legal-documents/appointment-letter",
  },
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
          <Link key={tool.title} href={tool.href} passHref>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
