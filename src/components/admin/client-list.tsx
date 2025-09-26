
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sampleClients = [
  { id: "CL-001", name: "Innovate LLC", gstin: "29AABCI5678G1Z4", email: "contact@innovate.llc" },
  { id: "CL-002", name: "Quantum Services", gstin: "07LMNOP1234Q1Z9", email: "accounts@quantum.com" },
  { id: "CL-003", name: "Synergy Corp", gstin: "24AAACS4321H1Z2", email: "finance@synergy.io" },
];

export function ClientList() {
  const { toast } = useToast();
  const [clients, setClients] = useState(sampleClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newClientName, setNewClientName] = useState("");
  const [newClientGstin, setNewClientGstin] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");


  const handleSwitchWorkspace = (clientName: string) => {
    toast({
      title: `Switched to ${clientName}'s Workspace`,
      description: `You are now managing the account for ${clientName}. Be careful!`,
    });
    // In a real app, this would trigger a context switch or redirect.
  };
  
  const handleAddNewClient = () => {
    if (!newClientName || !newClientGstin || !newClientEmail) {
        toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all client details."});
        return;
    }
    const newClient = {
        id: `CL-${String(clients.length + 1).padStart(3, '0')}`,
        name: newClientName,
        gstin: newClientGstin,
        email: newClientEmail,
    };
    setClients(prev => [...prev, newClient]);
    toast({ title: "Client Added", description: `${newClient.name} has been added to your client list.`});
    
    // Reset form and close dialog
    setNewClientName("");
    setNewClientGstin("");
    setNewClientEmail("");
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" /> Add New Client
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Enter the details of the new client you want to manage.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="client-name">Client Name / Business Name</Label>
                        <Input id="client-name" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="e.g., Apex Solutions" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-gstin">Client GSTIN</Label>
                        <Input id="client-gstin" value={newClientGstin} onChange={e => setNewClientGstin(e.target.value)} placeholder="15-digit GSTIN" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="client-email">Contact Email</Label>
                        <Input id="client-email" type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="contact@example.com" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddNewClient}>Add Client</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="font-mono text-xs">
                  {client.gstin}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSwitchWorkspace(client.name)}
                  >
                    <ArrowRightLeft className="mr-2" />
                    Switch Workspace
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
