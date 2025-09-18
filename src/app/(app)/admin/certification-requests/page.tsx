
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, Upload, ShieldCheck, CheckCircle, Clock } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const sampleRequests = [
  {
    id: "CERT-001",
    reportType: "CMA Report",
    clientName: "Innovate LLC",
    requestedBy: "Priya Mehta",
    requestDate: new Date(2024, 5, 10),
    status: "Pending",
    draftUrl: "#", // Link to download draft
  },
  {
    id: "CERT-002",
    reportType: "Projected Financials",
    clientName: "Quantum Services",
    requestedBy: "Rohan Sharma",
    requestDate: new Date(2024, 5, 9),
    status: "Completed",
    draftUrl: "#",
    signedDocumentUrl: "#"
  },
  {
    id: "CERT-003",
    reportType: "Net Worth Certificate",
    clientName: "Synergy Corp",
    requestedBy: "Anjali Singh",
    requestDate: new Date(2024, 5, 12),
    status: "Pending",
    draftUrl: "#",
  },
];

export default function CertificationRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(sampleRequests);
  
  const handleUploadClick = (requestId: string) => {
    // In a real app, you'd trigger a file input click or open a dialog.
    // For this simulation, we'll just show a toast and update the status.
    toast({
      title: 'Upload Triggered',
      description: `Please select the signed document for request ${requestId}.`,
    });
     setRequests(prev => 
        prev.map(req => 
            req.id === requestId ? {...req, status: "Completed", signedDocumentUrl: "#"} : req
        )
     );
  };
  
  const handleDownloadSigned = (requestId: string) => {
      toast({
          title: 'Download Started',
          description: `Downloading signed document for request ${requestId}.`
      });
      // In a real app, you would use the signedDocumentUrl to fetch the file.
  }
  
   const handleDownloadDraft = (requestId: string) => {
      toast({
          title: 'Download Started',
          description: `Downloading draft document for request ${requestId}.`
      });
      // In a real app, you would use the draftUrl to fetch the file.
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="size-3" />Pending</Badge>;
      case "Completed":
        return <Badge className="bg-green-600 flex items-center gap-1"><CheckCircle className="size-3" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck />
                Document Certification Requests
            </h1>
            <p className="text-muted-foreground">
                Download draft reports, sign them offline using your DSC, and upload the certified document.
            </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending & Completed Requests</CardTitle>
          <CardDescription>View all requests for document certification from users and your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client / Certificate Type</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.clientName}</div>
                    <div className="text-sm text-muted-foreground">{req.reportType}</div>
                  </TableCell>
                   <TableCell>{req.requestedBy}</TableCell>
                   <TableCell>{format(req.requestDate, 'dd MMM, yyyy')}</TableCell>
                   <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    {req.status === "Completed" ? (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadSigned(req.id)}>
                            <Download className="mr-2" />
                            Download Signed
                        </Button>
                    ) : (
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleDownloadDraft(req.id)}>
                              <Download className="mr-2" /> Download Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleUploadClick(req.id)}>
                              <Upload className="mr-2" /> Upload Signed Document
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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

