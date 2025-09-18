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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, UserPlus, X } from "lucide-react";
import { format } from 'date-fns';

const sampleAppointments = [
  {
    id: "APT-001",
    clientName: "Anjali Singh",
    clientEmail: "anjali.singh@startup.io",
    professionalType: "Chartered Accountant (CA)",
    serviceArea: "Start-up Advisory",
    preferredDate: new Date(),
    preferredTime: "10:00 AM - 12:00 PM",
    mode: "Video Call",
    status: "Pending",
  },
  {
    id: "APT-002",
    clientName: "Tech Corp",
    clientEmail: "sales@techcorp.com",
    professionalType: "Advocate",
    serviceArea: "GST",
    preferredDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    preferredTime: "02:00 PM - 04:00 PM",
    status: "Confirmed",
    assignedTo: "Priya Mehta, Advocate"
  },
  {
    id: "APT-003",
    clientName: "Innovate LLC",
    clientEmail: "contact@innovate.llc",
    professionalType: "Company Secretary (CS)",
    serviceArea: "LLP / Company Formation",
    preferredDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    preferredTime: "12:00 PM - 02:00 PM",
    status: "Completed",
    assignedTo: "Rohan Sharma, CS"
  },
];

export default function AppointmentsListPage() {
  const [appointments, setAppointments] = useState(sampleAppointments);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "Completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Appointment Bookings</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Requested Appointments</CardTitle>
          <CardDescription>View, manage, and assign all appointment requests from users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Preferred Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div className="font-medium">{apt.clientName}</div>
                    <div className="text-sm text-muted-foreground">{apt.clientEmail}</div>
                  </TableCell>
                  <TableCell>
                     <div className="font-medium">{apt.professionalType}</div>
                    <div className="text-sm text-muted-foreground">{apt.serviceArea} ({apt.mode})</div>
                  </TableCell>
                   <TableCell>
                    <div>{format(apt.preferredDate, 'dd MMM, yyyy')}</div>
                    <div className="text-sm text-muted-foreground">{apt.preferredTime}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserPlus className="mr-2" /> Assign Professional
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Check className="mr-2" /> Confirm Appointment
                        </DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive">
                          <X className="mr-2" /> Cancel Appointment
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
