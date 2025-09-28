
"use client";

import { useState, useMemo } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { FileArchive, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

// Mapping from documentType in DB to the user-friendly name and edit path
const documentTypeMap: { [key: string]: { name: string; path: string } } = {
    'net-worth-certificate': { name: "Net Worth Certificate", path: "/ca-certificates/net-worth" },
    // Add other mappings here as they are implemented
};

type UserDocument = {
  id: string;
  documentType: string;
  documentName: string;
  status: 'Draft' | 'Completed' | 'Certified';
  createdAt: any; // Firestore Timestamp
};

export default function MyDocumentsPage() {
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();

  const userDocumentsQuery = user
    ? query(collection(db, "userDocuments"), where("userId", "==", user.uid))
    : null;

  const [documentsSnapshot, documentsLoading, error] = useCollection(userDocumentsQuery);

  const documents: UserDocument[] = useMemo(() =>
    documentsSnapshot?.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as UserDocument)) || [], [documentsSnapshot]);

  const handleEdit = (docId: string, docType: string) => {
    const mapping = documentTypeMap[docType];
    if (mapping) {
        router.push(`${mapping.path}?id=${docId}`);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot find the editor for this document type.' });
    }
  };

  const handleDelete = async (docId: string) => {
    if(!confirm("Are you sure you want to delete this document draft? This action cannot be undone.")) return;
    
    try {
        await deleteDoc(doc(db, "userDocuments", docId));
        toast({ title: "Document Deleted", description: "The draft has been successfully deleted." });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete the document.' });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "Completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "Certified":
        return <Badge className="bg-green-600">Certified</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
            <FileArchive className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">My Documents</h1>
        <p className="text-muted-foreground">
          View and manage all your saved drafts and completed documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>
            A list of all your saved document drafts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Saved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(documentsLoading || authLoading) ? (
                 <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto animate-spin text-primary"/></TableCell></TableRow>
              ) : error ? (
                 <TableRow><TableCell colSpan={5} className="text-center h-24 text-destructive">Error loading documents.</TableCell></TableRow>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.documentName}</TableCell>
                    <TableCell>{documentTypeMap[doc.documentType]?.name || doc.documentType}</TableCell>
                    <TableCell>{doc.createdAt ? format(doc.createdAt.toDate(), "dd MMM, yyyy") : 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(doc.id, doc.documentType)}>
                            <Edit className="mr-2" /> Edit / View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(doc.id)}>
                            <Trash2 className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    You have no saved documents yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
