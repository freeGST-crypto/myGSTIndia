
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Briefcase, CalendarPlus, MapPin, Search, Star, User } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const sampleProfessionals = [
  {
    id: "PRO-001",
    name: "Rohan Sharma, CA",
    type: "ca",
    firmName: "Sharma & Associates",
    email: "rohan.sharma@ca-firm.com",
    specialization: ["Startup Advisory", "GST", "Audit"],
    city: "Mumbai",
    experience: 10,
    rating: 4.8,
    reviews: 32,
    avatarUrl: "https://picsum.photos/seed/pro1/100/100",
  },
  {
    id: "PRO-002",
    name: "Priya Mehta, Advocate",
    type: "advocate",
    firmName: "Mehta Legal",
    email: "priya.mehta@legal.com",
    specialization: ["Corporate Law", "GST Litigation"],
    city: "Delhi",
    experience: 12,
    rating: 4.9,
    reviews: 45,
    avatarUrl: "https://picsum.photos/seed/pro2/100/100",
  },
  {
    id: "PRO-003",
    name: "Anjali Singh, CS",
    type: "cs",
    firmName: "Singh Corporate Services",
    email: "anjali.s@cs-practitioner.com",
    specialization: ["LLP & Company Formation", "Compliance"],
    city: "Bangalore",
    experience: 8,
    rating: 4.7,
    reviews: 28,
     avatarUrl: "https://picsum.photos/seed/pro3/100/100",
  },
   {
    id: "PRO-004",
    name: "Vikram Reddy, CA",
    type: "ca",
    firmName: "Reddy & Co.",
    email: "vikram.r@ca.com",
    specialization: ["Income Tax", "Project Finance"],
    city: "Hyderabad",
    experience: 15,
    rating: 4.9,
    reviews: 55,
    avatarUrl: "https://picsum.photos/seed/pro4/100/100",
  },
   {
    id: "PRO-005",
    name: "Suresh Gupta, Advocate",
    type: "advocate",
    firmName: "Gupta & Associates",
    email: "s.gupta@law.com",
    specialization: ["Tax Litigation", "Contract Law"],
    city: "Mumbai",
    experience: 20,
    rating: 4.6,
    reviews: 60,
    avatarUrl: "https://picsum.photos/seed/pro5/100/100",
  },
];


export default function ProfessionalServicesPage() {
    const [city, setCity] = useState("Mumbai");
    const [profType, setProfType] = useState("all");

    const filteredProfessionals = sampleProfessionals.filter(p => {
        const cityMatch = city ? p.city.toLowerCase().includes(city.toLowerCase()) : true;
        const typeMatch = profType !== 'all' ? p.type === profType : true;
        return cityMatch && typeMatch;
    });

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Find a Professional</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Search our network of verified Chartered Accountants, Advocates, and Company Secretaries to find the right expert for your business needs.</p>
            </div>
            
             <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Find an Expert</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="prof-type">Type of Professional</Label>
                            <Select value={profType} onValueChange={setProfType}>
                                <SelectTrigger id="prof-type">
                                    <SelectValue placeholder="Select a professional type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Professionals</SelectItem>
                                    <SelectItem value="ca">Chartered Accountant (CA)</SelectItem>
                                    <SelectItem value="cs">Company Secretary (CS)</SelectItem>
                                    <SelectItem value="advocate">Advocate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="city">City</Label>
                             <div className="relative flex-1">
                                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                 <Input id="city" placeholder="Enter a city" className="pl-10" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                 <h2 className="text-2xl font-semibold text-center">Professionals matching your search</h2>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {filteredProfessionals.map(pro => (
                        <Card key={pro.id} className="flex flex-col sm:flex-row items-start p-6 gap-6">
                            <Avatar className="size-24 border">
                                <AvatarImage src={pro.avatarUrl} alt={pro.name} />
                                <AvatarFallback>{pro.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">{pro.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-2"><Briefcase className="size-4"/>{pro.firmName}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="size-4" />
                                    <span>{pro.city}</span>
                                    <span className="text-2xl leading-none">&middot;</span>
                                    <span>{pro.experience} years experience</span>
                                </div>
                                 <div className="flex items-center gap-2 text-sm">
                                    <Star className="size-4 text-yellow-500 fill-yellow-400" />
                                    <span className="font-semibold">{pro.rating}</span>
                                    <span className="text-muted-foreground">({pro.reviews} reviews)</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pro.specialization.map(spec => (
                                        <Badge key={spec} variant="secondary">{spec}</Badge>
                                    ))}
                                </div>
                                <div className="pt-2">
                                     <Link href={`/book-appointment?proId=${pro.id}&proName=${encodeURIComponent(pro.name)}&proType=${pro.type}`} passHref>
                                        <Button>
                                            <CalendarPlus className="mr-2"/> Book an Appointment
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
