
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MailWarning, PlusCircle, Upload, FileText, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const sampleNotices = [
    { id: "GST-2024-001", type: "GST Show Cause Notice", dateReceived: "2024-07-15", status: "Pending Review" },
    { id: "IT-2024-001", type: "Income Tax Scrutiny Notice (u/s 143(2))", dateReceived: "2024-07-10", status: "Draft Reply Submitted" },
    { id: "GST-2024-002", type: "GST ITC Mismatch Notice", dateReceived: "2024-06-25", status: "Resolved" },
];

export default function NoticesPage() {
    const [notices, setNotices] = useState(sampleNotices);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
        case "Pending Review":
            return <Badge variant="secondary">{status}</Badge>;
        case "Draft Reply Submitted":
            return <Badge className="bg-blue-500 text-white hover:bg-blue-600">{status}</Badge>;
        case "Resolved":
            return <Badge className="bg-green-600 text-white hover:bg-green-700">{status}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
        }
    };

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MailWarning /> Handle Notices
                </h1>
                <p className="text-muted-foreground">
                    Upload and manage departmental notices for professional assistance.
                </p>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Upload className="mr-2"/> Upload New Notice
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Departmental Notice</DialogTitle>
                        <DialogDescription>
                            Provide the notice details and upload the document for our experts to review.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="notice-type">Notice Type</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the type of notice"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gst">GST Department Notice</SelectItem>
                                    <SelectItem value="it">Income Tax Department Notice</SelectItem>
                                    <SelectItem value="roc">Registrar of Companies (ROC) Notice</SelectItem>
                                    <SelectItem value="other">Other Department Notice</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notice-file">Upload Notice (PDF/Image)</Label>
                            <Input id="notice-file" type="file" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notice-comments">Your Comments (Optional)</Label>
                            <Textarea id="notice-comments" placeholder="Add any relevant comments or context about this notice." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsUploadDialogOpen(false)}>Submit for Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Submitted Notices</CardTitle>
              <CardDescription>Track the status of all notices you have submitted for review and resolution.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Notice ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date Received</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {notices.map(notice => (
                          <TableRow key={notice.id}>
                              <TableCell className="font-mono">{notice.id}</TableCell>
                              <TableCell>{notice.type}</TableCell>
                              <TableCell>{notice.dateReceived}</TableCell>
                              <TableCell>{getStatusBadge(notice.status)}</TableCell>
                              <TableCell className="text-right">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem><FileText className="mr-2"/> View Details & Reply</DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/> Withdraw</DropdownMenuItem>
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
