
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, MapPin, Star, Calendar } from "lucide-react";
import { useRouter } from 'next/navigation';

const professionals = [
  {
    id: "pro-1",
    name: "Rohan Sharma, CA",
    title: "Chartered Accountant",
    location: "Mumbai, MH",
    rating: 4.9,
    reviews: 120,
    specialties: ["GST Compliance", "Startup Advisory", "Income Tax"],
    imageUrl: "https://picsum.photos/seed/pro1/100/100",
  },
  {
    id: "pro-2",
    name: "Priya Mehta, CS",
    title: "Company Secretary",
    location: "Delhi, DL",
    rating: 4.8,
    reviews: 85,
    specialties: ["MCA Compliance", "Company Incorporation", "Legal Drafting"],
    imageUrl: "https://picsum.photos/seed/pro2/100/100",
  },
  {
    id: "pro-3",
    name: "Anjali Singh, Tax Consultant",
    title: "Tax Consultant",
    location: "Bengaluru, KA",
    rating: 4.9,
    reviews: 210,
    specialties: ["Income Tax Notices", "Tax Planning", "TDS/TCS"],
    imageUrl: "https://picsum.photos/seed/pro3/100/100",
  },
    {
    id: "pro-4",
    name: "Vikram Rathod, CA",
    title: "Chartered Accountant",
    location: "Pune, MH",
    rating: 4.7,
    reviews: 95,
    specialties: ["Audit & Assurance", "CMA Reports", "Virtual CFO"],
    imageUrl: "https://picsum.photos/seed/pro4/100/100",
  },
];

const serviceAreas = ["GST Compliance", "Income Tax", "MCA Compliance", "Startup Advisory", "Audit & Assurance"];
const locations = ["Mumbai, MH", "Delhi, DL", "Bengaluru, KA", "Pune, MH", "All Locations"];

export default function ProfessionalServicesPage() {
    const router = useRouter();

    const handleBookAppointment = (proName: string, proType: string) => {
        router.push(`/book-appointment?proName=${encodeURIComponent(proName)}&proType=${encodeURIComponent(proType)}`);
    }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Find a Professional</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with vetted Chartered Accountants, Company Secretaries, and Tax Experts for your business needs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 space-y-2">
                <Label htmlFor="search-pro">Search by Name or Specialty</Label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="search-pro" placeholder="e.g., GST, Rohan Sharma..." className="pl-8" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="service-area">Service Area</Label>
                <Select>
                    <SelectTrigger id="service-area" className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                        {serviceAreas.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select>
                    <SelectTrigger id="location" className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                         {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((pro) => (
          <Card key={pro.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="h-16 w-16 border">
                    <AvatarImage src={pro.imageUrl} alt={pro.name}/>
                    <AvatarFallback>{pro.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle>{pro.name}</CardTitle>
                    <CardDescription>{pro.title}</CardDescription>
                     <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="size-3.5"/> {pro.location}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div>
                    <h4 className="text-sm font-semibold mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                        {pro.specialties.map(spec => <Badge key={spec} variant="secondary">{spec}</Badge>)}
                    </div>
                </div>
                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Star className="size-4 text-amber-400 fill-amber-400"/>
                        <span className="font-bold text-foreground">{pro.rating}</span> ({pro.reviews} reviews)
                    </div>
                </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleBookAppointment(pro.name, pro.title)}>
                <Calendar className="mr-2"/>
                Book an Appointment
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
