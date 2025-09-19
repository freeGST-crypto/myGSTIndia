
"use client";

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, UserPlus, CheckCircle, Clock } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Notice = {
  id: string;
  clientName: string;
  clientEmail: string;
  noticeType: string;
  description: string;
  submissionDate: Date;
  status: "Pending Review" | "In Progress" | "Resolved";
  assignedTo?: string;
};

const sampleNotices: Notice[] = [
    {
        id: "NOTICE-001",
        clientName: "Quantum Services",
        clientEmail: "contact@quantum.com",
        noticeType: "GST Department",
        description: "Notice regarding mismatch in GSTR-1 and GSTR-3B for the month of April 2024.",
        submissionDate: new Date(2024, 5, 20),
        status: "Pending Review",
    },
    {
        id: "NOTICE-002",
        clientName: "Innovate LLC",
        clientEmail: "accounts@innovate.dev",
        noticeType: "Income Tax Department",
        description: "Intimation u/s 143(1) for AY 2023-24 regarding TDS mismatch.",
        submissionDate: new Date(2024, 5, 18),
        status: "In Progress",
        assignedTo: "Rohan Sharma, CA",
    },
     {
        id: "NOTICE-003",
        clientName: "Synergy Corp",
        clientEmail: "finance@synergy.io",
        noticeType: "Registrar of Companies (ROC)",
        description: "Show Cause Notice for non-filing of AOC-4 and MGT-7 for FY 2022-23.",
        submissionDate: new Date(2024, 5, 15),
        status: "Resolved",
        assignedTo: "Anjali Singh, CS",
    },
];

const sampleProfessionals = [
  { id: "PRO-001", name: "Rohan Sharma, CA" },
  { id: "PRO-002", name: "Priya Mehta, Advocate" },
  { id: "PRO-003", name: "Anjali Singh, CS" },
];


export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(sampleNotices);
  const { toast } = useToast();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const handleDownloadNotice = (id: string) => {
      toast({
          title: 'Download Started',
          description: `Downloading notice file for ${id}.`
      });
  };

  const handleAssignProfessional = (professionalId: string) => {
      if (!selectedNotice) return;
      const professional = sampleProfessionals.find(p => p.id === professionalId);
      if (!professional) return;

      setNotices(prev => 
          prev.map(notice => notice.id === selectedNotice.id ? { ...notice, assignedTo: professional.name, status: "In Progress" } : notice)
      );
      toast({
          title: "Professional Assigned",
          description: `${professional.name} has been assigned to notice ${selectedNotice.id}.`
      });
      setIsAssignDialogOpen(false);
      setSelectedNotice(null);
  };

  const getStatusBadge = (status: Notice['status']) => {
    switch (status) {
      case "Pending Review":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="size-3" />Pending Review</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-600 hover:bg-blue-700">In Progress</Badge>;
      case "Resolved":
        return <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1"><CheckCircle className="size-3" />Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">User-Submitted Notices</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Submitted Notices</CardTitle>
          <CardDescription>View, manage, and assign all notices submitted by users for resolution.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client & Notice Type</TableHead>
                <TableHead className="w-1/2">Description</TableHead>
                <TableHead>Submitted / Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.length > 0 ? notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    <div className="font-medium">{notice.clientName}</div>
                    <div className="text-sm text-muted-foreground">{notice.noticeType}</div>
                  </TableCell>
                   <TableCell className="text-sm text-muted-foreground">{notice.description}</TableCell>
                   <TableCell>
                       <div>{format(notice.submissionDate, 'dd MMM, yyyy')}</div>
                       {notice.assignedTo && <div className="text-xs text-muted-foreground mt-1">to {notice.assignedTo}</div>}
                   </TableCell>
                   <TableCell>{getStatusBadge(notice.status)}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onSelect={() => handleDownloadNotice(notice.id)}>
                          <Download className="mr-2" /> Download Attachment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => {setSelectedNotice(notice); setIsAssignDialogOpen(true);}}>
                          <UserPlus className="mr-2" /> Assign Professional
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No notices submitted.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Professional</DialogTitle>
                    <DialogDescription>
                        Assign a professional to handle notice #{selectedNotice?.id} for {selectedNotice?.clientName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={handleAssignProfessional}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a professional..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sampleProfessionals.map(pro => (
                                <SelectItem key={pro.id} value={pro.id}>{pro.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}

    