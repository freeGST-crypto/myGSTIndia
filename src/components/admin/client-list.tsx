
"use client";

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
import { PlusCircle, Switch } from "lucide-react";

const sampleClients = [
  { id: "CL-001", name: "Innovate LLC", gstin: "29AABCI5678G1Z4" },
  { id: "CL-002", name: "Quantum Services", gstin: "07LMNOP1234Q1Z9" },
  { id: "CL-003", name: "Synergy Corp", gstin: "24AAACS4321H1Z2" },
];

export function ClientList() {
  const { toast } = useToast();

  const handleSwitchWorkspace = (clientName: string) => {
    toast({
      title: `Switched to ${clientName}'s Workspace`,
      description: `You are now managing the account for ${clientName}. Be careful!`,
    });
    // In a real app, this would trigger a context switch or redirect.
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <PlusCircle className="mr-2" /> Add New Client
        </Button>
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
            {sampleClients.map((client) => (
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
                    <Switch className="mr-2" />
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
