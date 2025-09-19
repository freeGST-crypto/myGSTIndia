
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
import { MoreHorizontal, Edit, RefreshCw, XCircle } from "lucide-react";
import { format } from 'date-fns';

const sampleSubscribers: any[] = [];

export default function SubscribersListPage() {
  const [subscribers, setSubscribers] = useState(sampleSubscribers);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Paid Subscribers</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Subscribers</CardTitle>
          <CardDescription>View and manage all active and past subscriptions on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Renewal</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length > 0 ? subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="font-medium">{sub.user}</div>
                    <div className="text-sm text-muted-foreground">{sub.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.plan === 'Business' ? 'default' : 'secondary'}>{sub.plan}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>{format(sub.renewalDate, 'dd MMM, yyyy')}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2" /> Change Plan</DropdownMenuItem>
                        <DropdownMenuItem><RefreshCw className="mr-2" /> Extend Subscription</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><XCircle className="mr-2" /> Cancel Subscription</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No subscribers found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
