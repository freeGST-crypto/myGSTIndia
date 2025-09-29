
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Sample Data
const sampleGodowns = [
    { id: "loc-001", name: "Main Warehouse - Mumbai" },
    { id: "loc-002", name: "Retail Outlet - Delhi" },
    { id: "loc-003", name: "Damaged Goods Area" },
];

export default function GodownsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [godowns, setGodowns] = useState(sampleGodowns);

  const handleAction = (action: 'Edit' | 'Delete', id: string) => {
    toast({
        title: `Action: ${action}`,
        description: `This would ${action.toLowerCase()} godown ${id}. This functionality is a placeholder.`
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Godowns / Locations</h1>
          <p className="text-muted-foreground">
            Manage your inventory locations and warehouses.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2"/>
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
                        <Label htmlFor="g-name">Godown Name</Label>
                        <Input id="g-name" placeholder="e.g., Bengaluru Warehouse" />
                     </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Godown</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Godown List</CardTitle>
              <CardDescription>A list of all your inventory storage locations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Godown / Location Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {godowns.map((g) => (
                        <TableRow key={g.id}>
                            <TableCell className="font-medium">{g.name}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => handleAction("Edit", g.id)}><Edit className="mr-2"/>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onSelect={() => handleAction("Delete", g.id)}>
                                            <Trash2 className="mr-2"/>Delete
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

