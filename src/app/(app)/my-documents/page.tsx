
"use client";

import { useState, useMemo, useEffect } from "react";
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Edit, Trash2, Download, FileArchive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyDocumentsPage() {
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();

    const userDocsQuery = user ? query(collection(db, "userDocuments"), where("userId", "==", user.uid)) : null;
    const [docsSnapshot, docsLoading] = useCollection(userDocsQuery);

    const documents = useMemo(() => 
        docsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [],
    [docsSnapshot]);
    
    const docTypeToUrl: Record<string, string> = {
        'net-worth-certificate': '/ca-certificates/net-worth',
        'capital-contribution-certificate': '/ca-certificates/capital-contribution',
        'foreign-remittance-certificate': '/ca-certificates/foreign-remittance',
        'general-attestation-certificate': '/ca-certificates/general-attestation',
        'partnership-deed': '/legal-documents/partnership-deed',
    }
    
    const handleEdit = (doc: any) => {
        const baseUrl = docTypeToUrl[doc.documentType];
        if (baseUrl) {
            router.push(`${baseUrl}?id=${doc.id}`);
        } else {
            toast({ variant: 'destructive', title: 'Cannot Edit', description: 'This document type does not support editing.' });
        }
    }

    return (
        <div className="space-y-8">
             <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10">
                    <FileArchive className="size-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">My Saved Documents</h1>
                    <p className="text-muted-foreground">A central place for all your generated document drafts.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Drafts</CardTitle>
                    <CardDescription>Here are all the legal and CA certificate drafts you have saved.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Document Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Saved</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {docsLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading documents...</TableCell></TableRow>
                            ) : documents.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">You haven't saved any document drafts yet.</TableCell></TableRow>
                            ) : (
                                documents.map((doc: any) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.documentName}</TableCell>
                                        <TableCell className="capitalize text-muted-foreground">{doc.documentType.replace(/-/g, ' ')}</TableCell>
                                        <TableCell><Badge variant={doc.status === 'Certified' ? 'default' : 'secondary'}>{doc.status}</Badge></TableCell>
                                        <TableCell>{format(doc.createdAt.toDate(), 'dd MMM, yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(doc)}><Edit className="mr-2"/> Edit Draft</DropdownMenuItem>
                                                    {doc.status === 'Certified' && <DropdownMenuItem><Download className="mr-2"/> Download Certified Copy</DropdownMenuItem>}
                                                     <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/> Delete Draft</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

