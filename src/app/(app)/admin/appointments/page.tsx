
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
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Appointment = {
  id: string;
  clientName: string;
  clientEmail: string;
  professionalType: string;
  serviceArea: string;
  preferredDate: Date;
  preferredTime: string;
  mode: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  assignedTo?: string;
};

const sampleAppointments: Appointment[] = [
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
  {
    id: "APT-004",
    clientName: "Digital Goods",
    clientEmail: "accounts@digitalgoods.com",
    professionalType: "Cost Accountant (CWA)",
    serviceArea: "Cost Audit",
    preferredDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    preferredTime: "11:00 AM - 01:00 PM",
    mode: "Video Call",
    status: "Pending",
  },
  {
    id: "APT-005",
    clientName: "Retail Chain Inc.",
    clientEmail: "finance@retailchain.com",
    professionalType: "Tax Practitioner",
    serviceArea: "TDS Compliance",
    preferredDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    preferredTime: "03:00 PM - 04:00 PM",
    mode: "Phone Call",
    status: "Pending",
  },
];

const sampleProfessionals = [
    { id: "PRO-001", name: "Rohan Sharma, CA" },
    { id: "PRO-002", name: "Priya Mehta, Advocate" },
    { id: "PRO-003", name: "Anjali Singh, CS" },
];

export default function AppointmentsListPage() {
  const [appointments, setAppointments] = useState(sampleAppointments);
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
    );
    toast({
      title: `Appointment ${status}`,
      description: `Appointment ${id} has been marked as ${status.toLowerCase()}.`,
    });
  };

  const handleAssignProfessional = (professionalId: string) => {
      if (!selectedAppointment) return;
      const professional = sampleProfessionals.find(p => p.id === professionalId);
      if (!professional) return;

      setAppointments(prev => 
          prev.map(apt => apt.id === selectedAppointment.id ? { ...apt, assignedTo: professional.name, status: "Confirmed" } : apt)
      );
      toast({
          title: "Professional Assigned",
          description: `${professional.name} has been assigned to appointment ${selectedAppointment.id}.`
      });
      setIsAssignDialogOpen(false);
      setSelectedAppointment(null);
  }

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Confirmed":
        return <Badge className="bg-blue-600 hover:bg-blue-700">Confirmed</Badge>;
      case "Completed":
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case "Cancelled":
          return <Badge variant="destructive">Cancelled</Badge>;
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
                <TableHead>Status / Assigned To</TableHead>
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
                  <TableCell>
                      {getStatusBadge(apt.status)}
                      {apt.assignedTo && <div className="text-xs text-muted-foreground mt-1">to {apt.assignedTo}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => { setSelectedAppointment(apt); setIsAssignDialogOpen(true); }}>
                          <UserPlus className="mr-2" /> Assign Professional
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleStatusChange(apt.id, 'Confirmed')}>
                          <Check className="mr-2" /> Confirm Appointment
                        </DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive" onSelect={() => handleStatusChange(apt.id, 'Cancelled')}>
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
      
       <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Professional</DialogTitle>
                    <DialogDescription>
                        Assign a professional to handle appointment #{selectedAppointment?.id} for {selectedAppointment?.clientName}.
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
