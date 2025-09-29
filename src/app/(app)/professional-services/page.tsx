
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Briefcase, HandCoins, FileSignature, Shield, BookOpen, FileText, IndianRupee } from "lucide-react";
import { useRouter } from 'next/navigation';
import { servicePricing } from '@/lib/on-demand-pricing';
import { cn } from '@/lib/utils';

type ServiceId = keyof typeof servicePricing[keyof typeof servicePricing] extends { id: infer U }[] ? U : never;

const serviceCategories = [
    { id: 'ca_certs', title: 'CA Certificates', icon: Award },
    { id: 'reports', title: 'Management Reports', icon: FileText },
    { id: 'notice_handling', title: 'Notice Handling', icon: MailWarning },
    { id: 'registration_deeds', title: 'Registration Deeds', icon: FileSignature },
    { id: 'founder_startup', title: 'Founder & Startup Docs', icon: HandCoins },
    { id: 'agreements', title: 'General Agreements', icon: Handshake },
    { id: 'hr_documents', title: 'HR Documents', icon: Briefcase },
    { id: 'company_documents', title: 'Company Secretarial', icon: BookOpen },
    { id: 'gst_documents', title: 'GST Compliance Docs', icon: FileSpreadsheet },
    { id: 'accounting_documents', title: 'Accounting Docs', icon: Book },
];

export default function ProfessionalServicesPage() {
    const router = useRouter();
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

    const handleServiceToggle = (serviceId: string) => {
        setSelectedServices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceId)) {
                newSet.delete(serviceId);
            } else {
                newSet.add(serviceId);
            }
            return newSet;
        });
    };
    
    const handleFindProfessional = () => {
        if(selectedServices.size === 0) {
            // In a real app, show a toast message
            console.warn("No services selected");
            return;
        }
        const servicesQuery = Array.from(selectedServices).join(',');
        router.push(`/find-professional?services=${servicesQuery}`);
    }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Professional Services Marketplace</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the services you need, and we'll connect you with the best-suited professionals from our vetted network.
        </p>
      </div>

       <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-4 border-b -mx-6 px-6">
           <div className="max-w-7xl mx-auto flex items-center justify-between">
                <h2 className="text-xl font-semibold">Selected Services ({selectedServices.size})</h2>
                <Button onClick={handleFindProfessional} disabled={selectedServices.size === 0}>
                    Find a Professional
                </Button>
           </div>
        </div>

      <div className="space-y-8">
        {serviceCategories.map(category => {
            const services = servicePricing[category.id as keyof typeof servicePricing];
            if (!services || services.length === 0) return null;
            
            return (
                 <Card key={category.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><category.icon className="text-primary"/>{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map(service => (
                            <div 
                                key={service.id}
                                onClick={() => handleServiceToggle(service.id)}
                                className={cn(
                                    "p-4 border rounded-lg cursor-pointer transition-all flex items-start gap-4",
                                    selectedServices.has(service.id) && "ring-2 ring-primary bg-primary/5"
                                )}
                            >
                               <Checkbox 
                                    checked={selectedServices.has(service.id)}
                                    className="mt-1"
                               />
                               <div className="flex-1">
                                    <h3 className="font-semibold">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <IndianRupee className="size-3"/> Starting from {service.price.toLocaleString('en-IN')}
                                    </p>
                               </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
