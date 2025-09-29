
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Briefcase, Star, Users, Award } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { professionals } from '@/lib/professionals';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const services = [
    "GST Registration", "Start-Up Registration", "PVT Incorporation", "OPC Incorporation",
    "LLP Registration", "Partnership Registration", "ITR Filing", "Society Registration",
    "GSTR Filings", "GST Notices", "Income Tax Notices", "MCA Compliance",
    "MCA Monthly Retainership", "Virtual CFO", "Book Keeping", "Payroll Accounting"
];

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
          Search our network of vetted professionals to find the right expert for your needs.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Filter Professionals</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="pro-type">Type of Professional</Label>
                 <Select defaultValue="all">
                    <SelectTrigger id="pro-type">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Professionals</SelectItem>
                        <SelectItem value="ca">Chartered Accountants</SelectItem>
                        <SelectItem value="advocate">Advocates / Lawyers</SelectItem>
                        <SelectItem value="cs">Company Secretaries</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pro-city">City</Label>
                <Select defaultValue="mumbai">
                    <SelectTrigger id="pro-city">
                        <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Or Select a Service</h2>
            <div className="flex flex-wrap gap-2">
                {services.map(service => (
                    <Button 
                        key={service} 
                        variant={selectedService === service ? "default" : "outline"}
                        onClick={() => setSelectedService(service === selectedService ? null : service)}
                    >
                        {service}
                    </Button>
                ))}
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-semibold mb-4">4 Professionals matching your search</h2>
        </div>

       <div className="grid md:grid-cols-2 gap-6">
        {professionals.map((pro) => (
          <Card key={pro.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center gap-4">
                <Image src={pro.imageUrl} alt={pro.name} width={80} height={80} className="rounded-full border-4 border-white" />
                <div className="flex-1">
                  <CardTitle>{pro.name}</CardTitle>
                  <CardDescription>{pro.firm}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                      <Star className="size-4 fill-current" />
                      <strong>{pro.rating}</strong>
                    </div>
                    <span className="text-xs text-muted-foreground">({pro.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground italic">"{pro.bio}"</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-secondary rounded-md">
                    <p className="text-xl font-bold">{pro.experience}+</p>
                    <p className="text-xs text-muted-foreground">Years Exp.</p>
                </div>
                <div className="p-2 bg-secondary rounded-md">
                    <p className="text-xl font-bold">{pro.staff}</p>
                    <p className="text-xs text-muted-foreground">Total Staff</p>
                </div>
                 <div className="p-2 bg-secondary rounded-md">
                    <p className="text-xl font-bold">{pro.professionals}</p>
                    <p className="text-xs text-muted-foreground">Professionals</p>
                </div>
              </div>
               <div>
                  <h4 className="font-semibold text-sm mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pro.specialties.map(spec => (
                      <Badge key={spec} variant="outline">{spec}</Badge>
                    ))}
                  </div>
               </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleBookAppointment(pro.name, pro.title)}>
                Book an Appointment
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
