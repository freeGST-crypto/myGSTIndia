
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
    id: "NTC-001",
    clientName: "Global Tech Inc.",
    clientEmail: "accounts@globaltech.com",
    noticeType: "GST Department",
    description: "Received a notice regarding mismatch in GSTR-1 and GSTR-3B for the month of April 2024. The notice mentions a discrepancy of Rs. 15,000 in taxable value.",
    submissionDate: new Date(),
    status: "Pending Review",
  },
  {
    id: "NTC-002",
    clientName: "Innovate LLC",
    clientEmail: "contact@innovate.llc",
    noticeType: "Income Tax Department",
    description: "Notice under section 143(1)(a) for proposed adjustments in the ITR for AY 2023-24. It seems to be related to some disallowed expenses under travel.",
    submissionDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    status: "In Progress",
    assignedTo: "Rohan Sharma, CA"
  },
  {
    id: "NTC-003",
    clientName: "Synergy Corp",
    clientEmail: "legal@synergycorp.com",
    noticeType: "Registrar of Companies (ROC)",
    description: "Show cause notice for non-filing of Form DPT-3 for the financial year ended March 31, 2024.",
    submissionDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    status: "Resolved",
    assignedTo: "Anjali Singh, CS"
  },
];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(sampleNotices);
  const { toast } = useToast();

  const handleDownloadNotice = (id: string) => {
      toast({
          title: 'Download Started',
          description: `Downloading notice file for ${id}.`
      });
  }

  const getStatusBadge = (status: Notice['status']) => {
    switch (status) {
      case "Pending Review":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="size-3" />Pending</Badge>;
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
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    <div className="font-medium">{notice.clientName}</div>
                    <div className="text-sm text-muted-foreground">{notice.noticeType}</div>
                  </TableCell>
                   <TableCell className="text-sm text-muted-foreground">{notice.description}</TableCell>
                   <TableCell>{format(notice.submissionDate, 'dd MMM, yyyy')}</TableCell>
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
                        <DropdownMenuItem>
                          <UserPlus className="mr-2" /> Assign Professional
                        </DropdownMenuItem>
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
