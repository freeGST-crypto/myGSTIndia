
"use client"

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

const sampleProfessionals = [
  {
    id: "PRO-001",
    name: "Rohan Sharma, CA",
    firmName: "Sharma & Associates",
    email: "rohan.sharma@ca-firm.com",
    city: "Mumbai",
    specialization: "Startup Advisory, GST",
    clients: 15,
    status: "Active",
    about: "A leading CA firm based in Mumbai, specializing in startup consultation, GST compliance, and audit services for over 10 years.",
    experience: 10,
    staffCount: 25,
    proCount: 5,
    avatarUrl: "https://picsum.photos/seed/pro1/100/100"
  },
  {
    id: "PRO-002",
    name: "Priya Mehta, Advocate",
    firmName: "Mehta Legal",
    email: "priya.mehta@legal.com",
    city: "Delhi",
    specialization: "Corporate Law, GST Litigation",
    clients: 8,
    status: "Active",
    about: "Expert legal counsel for corporate law, mergers, and high-stakes GST litigation. Based in New Delhi.",
    experience: 12,
    staffCount: 10,
    proCount: 3,
    avatarUrl: "https://picsum.photos/seed/pro2/100/100"
  },
  {
    id: "PRO-003",
    name: "Anjali Singh, CS",
    firmName: "Singh Corporate Services",
    email: "anjali.s@cs-practitioner.com",
    city: "Bangalore",
    specialization: "LLP & Company Formation",
    clients: 22,
    status: "Pending Verification",
    about: "Your one-stop solution for company and LLP formation, annual compliance, and secretarial audits in Bangalore.",
    experience: 8,
    staffCount: 8,
    proCount: 2,
    avatarUrl: "https://picsum.photos/seed/pro3/100/100"
  },
  {
    id: "PRO-006",
    name: "Sandeep Verma, CWA",
    firmName: "Verma Cost Accountants",
    email: "s.verma@cwa.com",
    city: "Chennai",
    specialization: "Cost Audit, Management Accounting",
    clients: 12,
    status: "Active",
    about: "Specialists in cost accounting and management advisory services for manufacturing industries.",
    experience: 14,
    staffCount: 15,
    proCount: 4,
    avatarUrl: "https://picsum.photos/seed/pro6/100/100",
  },
   {
    id: "PRO-008",
    name: "Amit Kumar, Tax Practitioner",
    firmName: "Kumar Tax Consultants",
    email: "amit.k@taxhelp.com",
    city: "Kolkata",
    specialization: "Income Tax Filing, TDS/TCS",
    clients: 50,
    status: "Active",
    about: "20+ years of experience in individual and corporate tax planning and filing.",
    experience: 18,
    staffCount: 5,
    proCount: 2,
    avatarUrl: "https://picsum.photos/seed/pro8/100/100",
  },
];

export default function ProfessionalsListPage() {
  const [professionals, setProfessionals] = useState(sampleProfessionals);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "Pending Verification":
        return <Badge variant="secondary">Pending</Badge>;
      case "Inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Professionals Management</h1>
         <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2" />
                    Add Professional
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Professional</DialogTitle>
                    <DialogDescription>Manually add a new professional to the platform.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" placeholder="e.g., Rohan Sharma, CA" className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="firm" className="text-right">Firm Name</Label>
                        <Input id="firm" placeholder="e.g., Sharma & Associates" className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" placeholder="professional@example.com" className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">City</Label>
                        <Input id="city" placeholder="e.g., Mumbai" className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="specialization" className="text-right">Specialization</Label>
                        <Input id="specialization" placeholder="e.g., GST, Corporate Law" className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="about" className="text-right pt-2">About Firm</Label>
                        <Textarea id="about" placeholder="A brief description of the firm and its services." className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="experience" className="text-right">Experience (Yrs)</Label>
                        <Input id="experience" type="number" placeholder="10" className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="staff" className="text-right">Total Staff</Label>
                        <Input id="staff" type="number" placeholder="25" className="col-span-3"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pros" className="text-right">Professionals</Label>
                        <Input id="pros" type="number" placeholder="5" className="col-span-3"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Professional</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Registered Professionals</CardTitle>
          <CardDescription>View, manage, and verify all professionals on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professional</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((pro) => (
                <TableRow key={pro.id}>
                  <TableCell>
                    <div className='flex items-center gap-4'>
                        <Avatar>
                            <AvatarImage src={pro.avatarUrl} alt={pro.name} />
                            <AvatarFallback>{pro.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{pro.name}</div>
                            <div className="text-sm text-muted-foreground">{pro.email}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>{pro.city}</TableCell>
                  <TableCell>{pro.specialization}</TableCell>
                  <TableCell>{getStatusBadge(pro.status)}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2" /> Edit Profile</DropdownMenuItem>
                        <DropdownMenuItem><CheckCircle className="mr-2" /> Approve Verification</DropdownMenuItem>
                        <DropdownMenuItem><XCircle className="mr-2" /> Deactivate Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
