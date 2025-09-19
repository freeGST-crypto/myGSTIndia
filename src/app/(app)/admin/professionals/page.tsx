
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
import { MoreHorizontal, Edit, Trash2, UserPlus, CheckCircle, XCircle, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type Professional = {
    id: string;
    name: string;
    firmName: string;
    email: string;
    city: string;
    specialization: string | string[];
    clients: number;
    status: "Active" | "Pending Verification" | "Inactive";
    about: string;
    experience: number;
    staffCount: number;
    proCount: number;
    avatarUrl: string;
    type?: string;
    rating?: number;
    reviews?: number;
};

const sampleProfessionals: Professional[] = [
    {
        id: "PRO-001",
        name: "Rohan Sharma, CA",
        type: "ca",
        firmName: "Sharma & Associates",
        email: "rohan.sharma@ca-firm.com",
        specialization: ["Startup Advisory", "GST", "Audit"],
        clients: 25,
        status: "Active",
        about: "A leading CA firm based in Mumbai, specializing in startup consultation and audit services.",
        experience: 10,
        staffCount: 25,
        proCount: 5,
        avatarUrl: "https://picsum.photos/seed/pro1/100/100",
        rating: 4.8,
        reviews: 32,
    },
    {
        id: "PRO-002",
        name: "Priya Mehta, Advocate",
        type: "advocate",
        firmName: "Mehta Legal",
        email: "priya.mehta@legal.com",
        specialization: ["Corporate Law", "GST Litigation"],
        clients: 40,
        status: "Active",
        about: "Expert legal counsel for corporate law, mergers, and high-stakes GST litigation.",
        experience: 12,
        staffCount: 10,
        proCount: 3,
        avatarUrl: "https://picsum.photos/seed/pro2/100/100",
        rating: 4.9,
        reviews: 45,
    },
    {
        id: "PRO-003",
        name: "Anjali Singh, CS",
        type: "cs",
        firmName: "Singh Corporate Services",
        email: "anjali.s@cs-practitioner.com",
        specialization: ["LLP Registration", "MCA Compliance"],
        clients: 50,
        status: "Pending Verification",
        about: "One-stop solution for company and LLP formation and annual compliance.",
        experience: 8,
        staffCount: 8,
        proCount: 2,
        avatarUrl: "https://picsum.photos/seed/pro3/100/100",
        rating: 4.7,
        reviews: 28,
    },
];


export default function ProfessionalsListPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(sampleProfessionals);
  const { toast } = useToast();

  const handleExport = () => {
    const dataToExport = professionals.map(pro => ({
        Name: pro.name,
        Firm: pro.firmName,
        Email: pro.email,
        City: pro.city,
        Specialization: Array.isArray(pro.specialization) ? pro.specialization.join(', ') : pro.specialization,
        Experience: pro.experience,
        Clients: pro.clients,
        Status: pro.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Professionals");
    XLSX.writeFile(workbook, `Professionals_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({
        title: "Export Successful",
        description: "The professionals list has been exported to an Excel file."
    });
  };

  const handleAddProfessional = (newPro: Omit<Professional, 'id'>) => {
    const newProfessional = { ...newPro, id: `PRO-${Date.now()}`};
    setProfessionals(prev => [...prev, newProfessional]);
    toast({ title: "Professional Added", description: `${newProfessional.name} has been added.`});
  };

  const handleStatusChange = (id: string, status: Professional['status']) => {
    setProfessionals(prev => prev.map(pro => pro.id === id ? { ...pro, status } : pro));
    toast({
        title: `Profile ${status}`,
        description: `Professional profile has been marked as ${status}.`
    });
  };

  const handleDelete = (id: string) => {
      setProfessionals(prev => prev.filter(pro => pro.id !== id));
      toast({
          variant: "destructive",
          title: "Profile Deleted",
          description: "The professional has been removed from the platform."
      });
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
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
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
                <FileSpreadsheet className="mr-2"/> Export to CSV
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="mr-2" />
                        Add Professional
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    {/* The form inside the dialog would call handleAddProfessional on submit */}
                    <DialogHeader>
                        <DialogTitle>Add New Professional</DialogTitle>
                        <DialogDescription>Manually add a new professional to the platform.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" placeholder="e.g., Rohan Sharma, CA" className="col-span-3"/>
                        </div>
                        {/* ... more fields ... */}
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={() => {
                            // This is a simplified handler for demonstration
                            const newProData: Omit<Professional, 'id'> = {
                                name: "New Professional", firmName: "New Firm", email: "new@pro.com", city: "New City",
                                specialization: "New Service", clients: 0, status: "Pending Verification", about: "New firm description",
                                experience: 1, staffCount: 1, proCount: 1, avatarUrl: "https://picsum.photos/seed/new/100/100"
                            };
                            handleAddProfessional(newProData);
                        }}>Save Professional</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
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
              {professionals.length > 0 ? professionals.map((pro) => (
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
                  <TableCell>{Array.isArray(pro.specialization) ? pro.specialization.join(', ') : pro.specialization}</TableCell>
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
                        {pro.status === "Pending Verification" && <DropdownMenuItem onClick={() => handleStatusChange(pro.id, 'Active')}><CheckCircle className="mr-2" /> Approve Verification</DropdownMenuItem>}
                        {pro.status === "Active" && <DropdownMenuItem onClick={() => handleStatusChange(pro.id, 'Inactive')}><XCircle className="mr-2" /> Deactivate Profile</DropdownMenuItem>}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(pro.id)}><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No professionals registered.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    