
"use client";

import { useState, useRef, useMemo } from 'react';
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
import { MoreHorizontal, Download, Upload, ShieldCheck, CheckCircle, Clock, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { db, auth, storage } from "@/lib/firebase";
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

type Request = {
  id: string;
  reportType: string;
  clientName: string;
  requestedBy: string;
  requestDate: any; // Firestore timestamp
  status: "Pending" | "Completed";
  draftUrl: string;
  signedDocumentUrl: string | null;
  formData?: any;
};

export default function CertificationRequestsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestsQuery = query(collection(db, "certificationRequests"), orderBy("requestDate", "desc"));
  const [requestsSnapshot, loading] = useCollection(requestsQuery);

  const requests: Request[] = useMemo(() => 
    requestsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request)) || [],
  [requestsSnapshot]);

  const handleUploadClick = (requestId: string) => {
    setActiveRequestId(requestId);
    fileInputRef.current?.click();
  };
  
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && activeRequestId) {
        const file = e.target.files[0];
        setIsUploading(true);
        try {
            // 1. Upload to Firebase Storage
            const fileRef = storageRef(storage, `signed_certs/${activeRequestId}/${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);

            // 2. Update Firestore document
            const requestDocRef = doc(db, "certificationRequests", activeRequestId);
            await updateDoc(requestDocRef, {
                status: "Completed",
                signedDocumentUrl: downloadUrl,
            });

            toast({
                title: 'Upload Successful',
                description: `${file.name} has been uploaded and linked to request ${activeRequestId}.`,
            });

        } catch (error) {
            console.error("Upload error:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the signed document.' });
        } finally {
            setActiveRequestId(null);
            setIsUploading(false);
            e.target.value = ''; // Reset file input
        }
    }
  };
  
  const handleDownload = (url: string | null, requestId: string) => {
      if (url && url !== '#') {
        window.open(url, '_blank');
        toast({
            title: 'Download Started',
            description: `Downloading document for request ${requestId}.`
        });
      } else {
        toast({ variant: 'destructive', title: 'No Document', description: 'No document URL is available for this request.'});
      }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="size-3" />Pending</Badge>;
      case "Completed":
        return <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1"><CheckCircle className="size-3" />Completed</Badge>;
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
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto text-primary"/></TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No certification requests found.</TableCell></TableRow>
              ) : requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.clientName}</div>
                    <div className="text-sm text-muted-foreground">{req.reportType}</div>
                  </TableCell>
                   <TableCell>{req.requestedBy}</TableCell>
                   <TableCell>{req.requestDate ? format(req.requestDate.toDate(), 'dd MMM, yyyy') : 'N/A'}</TableCell>
                   <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    {req.status === "Completed" ? (
                        <Button variant="outline" size="sm" onClick={() => handleDownload(req.signedDocumentUrl, req.id)}>
                            <Download className="mr-2" />
                            Download Signed
                        </Button>
                    ) : (
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isUploading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>
                              <Download className="mr-2" /> Download Draft (WIP)
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
          <Input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept=".pdf" />
        </CardContent>
      </Card>
    </div>
  );
}
