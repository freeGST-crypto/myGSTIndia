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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type Godown = {
  id: string;
  name: string;
  address: string;
  inCharge?: string;
};

const initialGodowns: Godown[] = [
  { id: "GOD-001", name: "Main Warehouse", address: "123 Industrial Area, Mumbai, MH", inCharge: "Ramesh Kumar" },
  { id: "GOD-002", name: "Retail Outlet - Bandra", address: "456 Linking Road, Bandra, Mumbai, MH", inCharge: "Suresh Patil" },
  { id: "GOD-003", name: "North Zone Depot", address: "789 Logistics Park, Delhi", inCharge: "Priya Singh" },
];

export default function GodownsPage() {
  const [godowns, setGodowns] = useState<Godown[]>(initialGodowns);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAction = (action: 'Edit' | 'Delete', id: string) => {
    toast({
      title: `Action: ${action}`,
      description: `This would ${action.toLowerCase()} godown ${id}. This is a placeholder.`,
    });
  };

  const handleAddGodown = () => {
    // In a real app, you would handle form submission data
    toast({
      title: "Godown Added",
      description: `A new godown has been added.`,
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Godowns / Locations</h1>
          <p className="text-muted-foreground">
            Manage your warehouses, stores, or any location where you keep stock.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              New Godown
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Godown / Location</DialogTitle>
              <DialogDescription>
                Add a new location to track your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="g-name">Name</Label>
                <Input id="g-name" placeholder="e.g., Main Warehouse" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-address">Address</Label>
                <Textarea id="g-address" placeholder="Enter the full address of the location" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="g-incharge">Person In-charge (Optional)</Label>
                <Input id="g-incharge" placeholder="e.g., Mr. Sanjay Verma" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddGodown}>Save Godown</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Godown List</CardTitle>
          <CardDescription>A list of all your inventory locations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>In-Charge</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {godowns.map((godown) => (
                <TableRow key={godown.id}>
                  <TableCell className="font-medium">{godown.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{godown.address}</TableCell>
                  <TableCell>{godown.inCharge || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleAction("Edit", godown.id)}>
                          <Edit className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleAction("Delete", godown.id)}
                        >
                          <Trash2 className="mr-2" />
                          Delete
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
