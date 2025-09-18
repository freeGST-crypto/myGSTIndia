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

const sampleProfessionals = [
  {
    id: "PRO-001",
    name: "Rohan Sharma, CA",
    email: "rohan.sharma@ca-firm.com",
    specialization: "Startup Advisory, GST",
    clients: 15,
    status: "Active",
  },
  {
    id: "PRO-002",
    name: "Priya Mehta, Advocate",
    email: "priya.mehta@legal.com",
    specialization: "Corporate Law, GST Litigation",
    clients: 8,
    status: "Active",
  },
  {
    id: "PRO-003",
    name: "Anjali Singh, CS",
    email: "anjali.s@cs-practitioner.com",
    specialization: "LLP & Company Formation",
    clients: 22,
    status: "Pending Verification",
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Professional</DialogTitle>
                    <DialogDescription>Manually add a new professional to the platform.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name & Designation</Label>
                        <Input id="name" placeholder="e.g., Rohan Sharma, CA" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="professional@example.com" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input id="specialization" placeholder="e.g., GST, Corporate Law" />
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
                <TableHead>Specialization</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((pro) => (
                <TableRow key={pro.id}>
                  <TableCell>
                    <div className="font-medium">{pro.name}</div>
                    <div className="text-sm text-muted-foreground">{pro.email}</div>
                  </TableCell>
                  <TableCell>{pro.specialization}</TableCell>
                  <TableCell>{pro.clients}</TableCell>
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
