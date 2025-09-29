
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { servicePricing } from '@/lib/on-demand-pricing';
import { ConciergeBell, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

const allCategories = [
    { id: 'all', name: 'All Services' },
    { id: 'reports', name: 'Management Reports' },
    { id: 'ca_certs', name: 'CA Certificates' },
    { id: 'notice_handling', name: 'Notice Handling' },
    { id: 'registration_deeds', name: 'Registration & Deeds' },
    { id: 'founder_startup', name: 'Founder & Startup' },
    { id: 'agreements', name: 'General Agreements' },
    { id: 'hr_documents', name: 'HR Documents' },
];

const allServices = Object.values(servicePricing).flat();

export default function ProfessionalServicesPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const router = useRouter();

    const filteredServices = selectedCategory === 'all'
        ? allServices
        : servicePricing[selectedCategory as keyof typeof servicePricing] || [];
        
    const handleBookAppointment = (serviceId: string) => {
        router.push(`/book-appointment?service=${serviceId}`);
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="inline-block rounded-full bg-primary/10 p-4">
                    <ConciergeBell className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">On-Demand Professional Services</h1>
                <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                    Access expert-led services on a pay-per-use basis. No subscriptions required. From report generation to legal drafting, get the help you need, when you need it.
                </p>
            </div>
            
            <div className="flex justify-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>


            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                    <Card key={service.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <Badge variant="secondary" className="text-lg">
                                Starts at ₹{service.price.toLocaleString('en-IN')}
                            </Badge>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleBookAppointment(service.id)}>
                                <Calendar className="mr-2"/>
                                Book a Consultation
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
