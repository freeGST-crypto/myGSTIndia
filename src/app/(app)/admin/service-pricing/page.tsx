
"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const initialServices = {
  reports: [
    { id: "CMA_REPORT", name: "CMA Report Generation", price: 5000 },
  ],
  ca_certs: [
    { id: "NW_CERT", name: "Net Worth Certificate", price: 2500 },
    { id: "TURNOVER_CERT", name: "Turnover Certificate", price: 2500 },
    { id: "VISA_CERT", name: "Visa/Immigration Financials", price: 6000 },
    { id: "CAPITAL_CONT_CERT", name: "Capital Contribution Certificate", price: 3000 },
    { id: "FR_CERT", name: "Form 15CB (Foreign Remittance)", price: 4000 },
    { id: "GEN_ATTEST", name: "General Attestation", price: 2000 },
  ],
  registration_deeds: [
      { id: "PARTNERSHIP_DEED", name: "Partnership Deed Drafting", price: 3000 },
      { id: "LLP_AGREEMENT", name: "LLP Agreement Drafting", price: 5000 },
      { id: "TRUST_DEED", name: "Trust Deed", price: 4500 },
      { id: "SOCIETY_DEED", name: "Society Registration Deed", price: 4500 },
  ],
  founder_startup: [
      { id: "FOUNDERS_AGREEMENT", name: "Founders’ Agreement Drafting", price: 7500 },
      { id: "SHAREHOLDERS_AGREEMENT", name: "Shareholders' Agreement (SHA)", price: 15000 },
      { id: "ESOP_POLICY", name: "ESOP Policy & Trust Deed", price: 25000 },
      { id: "SAFE_AGREEMENT", name: "SAFE / Convertible Note", price: 10000 },
  ],
  agreements: [
      { id: "RENTAL_DEED", name: "Rental / Lease Deed", price: 1500 },
      { id: "NDA", name: "Non-Disclosure Agreement (NDA)", price: 1000 },
      { id: "CONSULTANT_AGMT", name: "Consultant / Freelancer Agreement", price: 2000 },
      { id: "VENDOR_AGREEMENT", name: "Vendor Agreement", price: 2000 },
      { id: "SERVICE_AGREEMENT", name: "Service Agreement", price: 2000 },
      { id: "FRANCHISE_AGREEMENT", name: "Franchise Agreement", price: 12000 },
      { id: "LOAN_AGREEMENT", name: "Loan Agreement (Director/Partner)", price: 1500 },
  ],
  hr_documents: [
      { id: "OFFER_LETTER", name: "Offer Letter", price: 500 },
      { id: "APPOINTMENT_LETTER", name: "Appointment Letter", price: 750 },
      { id: "INTERNSHIP_AGREEMENT", name: "Internship Agreement", price: 750 },
  ],
  company_documents: [
    { id: "MOA_AOA", name: "MOA & AOA Generation", price: 5000 },
    { id: "BOARD_RESOLUTION", name: "Board Resolution", price: 750 },
    { id: "STATUTORY_REGISTERS", name: "Statutory Registers", price: 2000 },
  ],
  gst_documents: [
      { id: "GST_ENGAGEMENT_LETTER", name: "GST Engagement Letter", price: 500 },
      { id: "SELF_AFFIDAVIT_GST", name: "Self Affidavit for GST", price: 250 },
      { id: "RENTAL_RECEIPTS_HRA", name: "Rental Receipts for HRA", price: 100 },
  ],
  accounting_documents: [
      { id: "ACCOUNTING_ENGAGEMENT_LETTER", name: "Accounting Engagement Letter", price: 500 },
  ],
  notice_handling: [
      { id: "GST_NOTICE", name: "GST Department Notice Reply", price: 5000 },
      { id: "IT_NOTICE", name: "Income Tax Department Notice Reply", price: 4000 },
      { id: "ROC_NOTICE", name: "Registrar of Companies (ROC) Notice Reply", price: 6000 },
      { id: "OTHER_NOTICE", name: "Other Departmental Notice Reply", price: 7500 },
  ],
};

type Service = {
    id: string;
    name: string;
    price: number;
}

type ServiceCategories = keyof typeof initialServices;


export default function ServicePricingPage() {
  const { toast } = useToast();
  const [services, setServices] = useState(initialServices);

  const handlePriceChange = (category: ServiceCategories, id: string, newPrice: number) => {
      setServices(prev => ({
          ...prev,
          [category]: prev[category].map(s => s.id === id ? {...s, price: newPrice} : s)
      }));
  };
  
  const handleSaveChanges = () => {
      // In a real app, this would make an API call to save the prices.
      console.log("Saving new prices:", services);
      toast({
          title: "Prices Updated",
          description: "The new service prices have been saved successfully."
      });
  }

  const renderServiceCategory = (title: string, category: ServiceCategories) => (
      <div key={category}>
        <h3 className="text-lg font-semibold my-4">{title}</h3>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[70%]">Service / Document Name</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {services[category].map((service) => (
                    <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-right">
                        <Input 
                        type="number" 
                        value={service.price} 
                        onChange={(e) => handlePriceChange(category, service.id, parseInt(e.target.value) || 0)}
                        className="w-32 ml-auto text-right"
                        />
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard /> On-Demand Service Pricing
          </h1>
          <p className="text-muted-foreground">
            Set and manage the prices for pay-per-use services and documents.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service Price List</CardTitle>
          <CardDescription>
            Update the prices that will be shown to users when they access these on-demand features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {renderServiceCategory("Management Reports", "reports")}
            {renderServiceCategory("CA Certificates", "ca_certs")}
            {renderServiceCategory("Notice Handling & Resolution", "notice_handling")}
            <Separator />
            {renderServiceCategory("Registration Deeds", "registration_deeds")}
            {renderServiceCategory("Founder & Startup Docs", "founder_startup")}
            {renderServiceCategory("General Agreements", "agreements")}
            <Separator />
            {renderServiceCategory("HR Documents", "hr_documents")}
            {renderServiceCategory("Company Secretarial", "company_documents")}
            {renderServiceCategory("GST Compliance", "gst_documents")}
            {renderServiceCategory("Accounting", "accounting_documents")}
        </CardContent>
        <CardFooter className="justify-end">
            <Button onClick={handleSaveChanges}>
                <Save className="mr-2" />
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
