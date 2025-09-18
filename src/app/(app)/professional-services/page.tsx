"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarPlus } from "lucide-react";
import Link from "next/link";

const services = [
    {
        name: "Book an Appointment",
        description: "Schedule a consultation with a CA, CS, or Advocate.",
        href: "/book-appointment",
        icon: CalendarPlus,
        status: "active",
        price: 500,
    },
];

export default function ProfessionalServicesPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">On-Demand Professional Services</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Access expert advice and services whenever you need them, with transparent, pay-per-use pricing.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {services.map(doc => (
                     <Card key={doc.name} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <doc.icon className="text-primary"/> {doc.name}
                            </CardTitle>
                            <CardDescription>
                                {doc.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                             {doc.status === 'active' ? (
                                <Link href={doc.href} passHref>
                                    <Button>
                                        <span>
                                            Proceed
                                            {doc.price && ` - ₹${doc.price}`}
                                        </span>
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
