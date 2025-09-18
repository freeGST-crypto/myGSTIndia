
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Briefcase, CalendarPlus, MapPin, Search, Star, User, ChevronLeft, ChevronRight, Users, Building, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const servicesList = [
    { value: "gst_registration", label: "GST Registration" },
    { value: "startup_registration", label: "Start-Up Registration" },
    { value: "pvt_incorporation", label: "PVT Incorporation" },
    { value: "opc_incorporation", label: "OPC Incorporation" },
    { value: "llp_registration", label: "LLP Registration" },
    { value: "partnership_registration", label: "Partnership Registration" },
    { value: "itr_filing", label: "ITR Filing" },
    { value: "society_registration", label: "Society Registration" },
    { value: "gstr_filings", label: "GSTR Filings" },
    { value: "gst_notices", label: "GST Notices" },
    { value: "income_tax_notices", label: "Income Tax Notices" },
    { value: "mca_compliance", label: "MCA Compliance" },
    { value: "mca_monthly_retainership", label: "MCA Monthly Retainership" },
    { value: "virtual_cfo", label: "Virtual CFO" },
    { value: "book_keeping", label: "Book Keeping" },
    { value: "payroll_accounting", label: "Payroll Accounting" },
];


const sampleProfessionals = [
  {
    id: "PRO-001",
    name: "Rohan Sharma, CA",
    type: "ca",
    firmName: "Sharma & Associates",
    email: "rohan.sharma@ca-firm.com",
    specialization: ["Startup Advisory", "GST", "Audit", "Virtual CFO"],
    city: "Mumbai",
    experience: 10,
    rating: 4.8,
    reviews: 32,
    avatarUrl: "https://picsum.photos/seed/pro1/100/100",
    about: "A leading CA firm based in Mumbai, specializing in startup consultation and audit services for over 10 years.",
    staffCount: 25,
    proCount: 5,
  },
  {
    id: "PRO-002",
    name: "Priya Mehta, Advocate",
    type: "advocate",
    firmName: "Mehta Legal",
    email: "priya.mehta@legal.com",
    specialization: ["Corporate Law", "GST Litigation", "GST Notices", "Income Tax Notices"],
    city: "Delhi",
    experience: 12,
    rating: 4.9,
    reviews: 45,
    avatarUrl: "https://picsum.photos/seed/pro2/100/100",
    about: "Expert legal counsel for corporate law, mergers, and high-stakes GST litigation.",
    staffCount: 10,
    proCount: 3,
  },
  {
    id: "PRO-003",
    name: "Anjali Singh, CS",
    type: "cs",
    firmName: "Singh Corporate Services",
    email: "anjali.s@cs-practitioner.com",
    specialization: ["LLP Registration", "PVT Incorporation", "MCA Compliance", "MCA Monthly Retainership"],
    city: "Bangalore",
    experience: 8,
    rating: 4.7,
    reviews: 28,
     avatarUrl: "https://picsum.photos/seed/pro3/100/100",
    about: "One-stop solution for company and LLP formation, annual compliance, and secretarial audits.",
    staffCount: 8,
    proCount: 2,
  },
   {
    id: "PRO-004",
    name: "Vikram Reddy, CA",
    type: "ca",
    firmName: "Reddy & Co.",
    email: "vikram.r@ca.com",
    specialization: ["Income Tax", "Project Finance", "ITR Filing", "Virtual CFO"],
    city: "Hyderabad",
    experience: 15,
    rating: 4.9,
    reviews: 55,
    avatarUrl: "https://picsum.photos/seed/pro4/100/100",
    about: "Specializing in tax planning and project financing for large-scale enterprises.",
    staffCount: 30,
    proCount: 8,
  },
   {
    id: "PRO-005",
    name: "Suresh Gupta, Advocate",
    type: "advocate",
    firmName: "Gupta & Associates",
    email: "s.gupta@law.com",
    specialization: ["Tax Litigation", "Contract Law", "GST Notices", "Partnership Registration"],
    city: "Mumbai",
    experience: 20,
    rating: 4.6,
    reviews: 60,
    avatarUrl: "https://picsum.photos/seed/pro5/100/100",
    about: "Over two decades of experience in handling complex tax litigation and corporate law.",
    staffCount: 12,
    proCount: 4,
  },
  {
    id: "PRO-006",
    name: "Sandeep Verma, CWA",
    type: "cwa",
    firmName: "Verma Cost Accountants",
    email: "s.verma@cwa.com",
    specialization: ["Cost Audit", "Management Accounting", "Book Keeping"],
    city: "Chennai",
    experience: 14,
    rating: 4.7,
    reviews: 41,
    avatarUrl: "https://picsum.photos/seed/pro6/100/100",
    about: "Specialists in cost accounting and management advisory for manufacturing industries.",
    staffCount: 15,
    proCount: 4,
  },
  {
    id: "PRO-007",
    name: "Neha Gupta, Accountant",
    type: "accountant",
    firmName: "Accurate Bookkeeping",
    email: "neha.g@bookkeeping.com",
    specialization: ["Book Keeping", "Payroll Accounting", "MIS Reporting"],
    city: "Pune",
    experience: 7,
    rating: 4.6,
    reviews: 25,
    avatarUrl: "https://picsum.photos/seed/pro7/100/100",
    about: "Dedicated bookkeeping and payroll services for small and medium enterprises.",
    staffCount: 5,
    proCount: 1,
  },
  {
    id: "PRO-008",
    name: "Amit Kumar, Tax Practitioner",
    type: "tax_practitioner",
    firmName: "Kumar Tax Consultants",
    email: "amit.k@taxhelp.com",
    specialization: ["Income Tax Filing", "TDS/TCS", "ITR Filing", "GSTR Filings"],
    city: "Kolkata",
    experience: 18,
    rating: 4.8,
    reviews: 50,
    avatarUrl: "https://picsum.photos/seed/pro8/100/100",
    about: "Expert tax filing and compliance services for individuals and corporations.",
    staffCount: 7,
    proCount: 2,
  },
   {
    id: "PRO-009",
    name: "Sunita Rao, CS",
    type: "cs",
    firmName: "Rao & Associates",
    email: "sunita.rao@csfirm.com",
    specialization: ["MCA Compliance", "LLP Registration", "PVT Incorporation"],
    city: "Mumbai",
    experience: 9,
    rating: 4.8,
    reviews: 35,
    avatarUrl: "https://picsum.photos/seed/pro9/100/100",
    about: "Providing comprehensive company secretarial services to ensure your business remains compliant.",
    staffCount: 10,
    proCount: 3,
  },
  {
    id: "PRO-010",
    name: "Deepak Verma, CA",
    type: "ca",
    firmName: "Verma & Co.",
    email: "deepak.verma@ca.in",
    specialization: ["GST", "Audit", "Startup Advisory"],
    city: "Mumbai",
    experience: 12,
    rating: 4.9,
    reviews: 40,
    avatarUrl: "https://picsum.photos/seed/pro10/100/100",
    about: "Chartered accountancy firm focused on GST advisory and statutory audits.",
    staffCount: 18,
    proCount: 4,
  },
];


export default function ProfessionalServicesPage() {
    const [city, setCity] = useState("Mumbai");
    const [profType, setProfType] = useState("all");
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const filteredProfessionals = sampleProfessionals.filter(p => {
        const cityMatch = city ? p.city.toLowerCase().includes(city.toLowerCase()) : true;
        const typeMatch = profType !== 'all' ? p.type === profType : true;
        const serviceMatch = selectedService ? p.specialization.some(s => s.toLowerCase().includes(selectedService.split('_')[0])) : true;
        return cityMatch && typeMatch && serviceMatch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProfessionals.length / itemsPerPage);
    const paginatedProfessionals = filteredProfessionals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };


    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Find a Professional</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Search our network of verified professionals to find the right expert for your business needs.</p>
            </div>
            
             <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Find an Expert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                                    <SelectItem value="cwa">Cost Accountant (CWA)</SelectItem>
                                    <SelectItem value="accountant">Accountant</SelectItem>
                                    <SelectItem value="tax_practitioner">Tax Practitioner</SelectItem>
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
                     <div className="space-y-2">
                        <Label>Select a Service</Label>
                        <div className="flex flex-wrap gap-2">
                            {servicesList.map(service => (
                                <Button
                                    key={service.value}
                                    variant={selectedService === service.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedService(prev => prev === service.value ? null : service.value)}
                                >
                                    {service.label}
                                </Button>
                            ))}
                        </div>
                     </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                 <h2 className="text-2xl font-semibold text-center">
                    {filteredProfessionals.length > 0 
                        ? `${filteredProfessionals.length} Professionals matching your search`
                        : "No professionals found matching your criteria"}
                </h2>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {paginatedProfessionals.map(pro => (
                        <Card key={pro.id} className="flex flex-col p-6 gap-4">
                            <div className="flex items-start gap-4">
                                <div className="relative shrink-0">
                                    <Avatar className="size-20 border">
                                        <AvatarImage src={pro.avatarUrl} alt={pro.name} />
                                        <AvatarFallback>{pro.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 bg-green-600 p-1 rounded-full text-white">
                                        <ShieldCheck className="size-4"/>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <CardTitle className="text-xl">{pro.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-2"><Building className="size-4"/>{pro.firmName}</CardDescription>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="size-4" />
                                        <span>{pro.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Star className="size-4 text-yellow-500 fill-yellow-400" />
                                        <span className="font-semibold">{pro.rating}</span>
                                        <span className="text-muted-foreground">({pro.reviews} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-0 space-y-4">
                                <p className="text-sm text-muted-foreground italic">"{pro.about}"</p>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="font-bold text-lg">{pro.experience}+</p>
                                        <p className="text-xs text-muted-foreground">Years Experience</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{pro.staffCount}</p>
                                        <p className="text-xs text-muted-foreground">Total Staff</p>
                                    </div>
                                     <div>
                                        <p className="font-bold text-lg">{pro.proCount}</p>
                                        <p className="text-xs text-muted-foreground">Professionals</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pro.specialization.map(spec => (
                                        <Badge key={spec} variant="secondary">{spec}</Badge>
                                    ))}
                                </div>
                                <div className="pt-2">
                                     <Link href={`/book-appointment?proId=${pro.id}&proName=${encodeURIComponent(pro.name)}&proType=${pro.type}&service=${selectedService || ''}`} passHref>
                                        <Button className="w-full">
                                            <CalendarPlus className="mr-2"/> Book an Appointment
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="mr-2" />
                            Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
