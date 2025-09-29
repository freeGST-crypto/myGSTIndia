
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Briefcase, Star, Users, Award, FileText, MailWarning, FileSignature, Handshake, Building } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { professionals } from '@/lib/professionals';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { servicePricing } from '@/lib/on-demand-pricing';

const serviceCategories = [
    { id: 'ca_certs', title: 'CA Certificates', icon: Award },
    { id: 'reports', title: 'Management Reports', icon: FileText },
    { id: 'notice_handling', title: 'Notice Handling', icon: MailWarning },
    { id: 'registration_deeds', title: 'Registration Deeds', icon: FileSignature },
    { id: 'founder_startup', title: 'Founder & Startup Docs', icon: Handshake },
    { id: 'agreements', title: 'General Agreements', icon: Handshake },
    { id: 'hr_documents', title: 'HR Documents', icon: Users },
    { id: 'company_documents', title: 'Company Secretarial', icon: Building },
    { id: 'gst_documents', title: 'GST Compliance', icon: FileText },
    { id: 'accounting_documents', title: 'Accounting', icon: FileText },
]

export default function FindProfessionalPage() {
    const router = useRouter();
    const [selectedService, setSelectedService] = useState<string | null>(null);

    const handleBookAppointment = (proName: string, proType: string) => {
        const serviceQuery = selectedService ? `&service=${encodeURIComponent(selectedService)}` : '';
        router.push(`/book-appointment?proName=${encodeURIComponent(proName)}&proType=${encodeURIComponent(proType)}${serviceQuery}`);
    }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Find an Expert</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our directory of on-demand services or find a professional for a specific consultation.
        </p>
      </div>

       <div className="space-y-8">
        {serviceCategories.map(category => {
          const services = servicePricing[category.id as keyof typeof servicePricing];
          if (!services || services.length === 0) return null;
          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><category.icon /> {category.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {services.map(service => (
                  <Button 
                    key={service.id}
                    variant="outline" 
                    className="h-auto text-left justify-start"
                    onClick={() => router.push('/book-appointment')}
                  >
                    <div className="flex flex-col">
                      <span>{service.name}</span>
                      <span className="text-xs text-muted-foreground">Starting at ₹{service.price}</span>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
