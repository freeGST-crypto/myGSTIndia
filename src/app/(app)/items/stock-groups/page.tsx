
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for stock groups - in a real app, this would be fetched from Firestore
const sampleStockGroups = [
  { id: "SG-001", name: "Electronics", under: "Primary", itemsCount: 15 },
  { id: "SG-002", name: "Garments", under: "Primary", itemsCount: 45 },
  { id: "SG-003", name: "Raw Materials", under: "Primary", itemsCount: 120 },
  { id: "SG-004", name: "Laptops", under: "Electronics", itemsCount: 5 },
  { id: "SG-005", name: "Mobiles", under: "Electronics", itemsCount: 10 },
  { id: "SG-006", name: "T-Shirts", under: "Garments", itemsCount: 30 },
];

export default function StockGroupsPage() {
  const [groups, setGroups] = useState(sampleStockGroups);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAction = (action: string, groupId: string) => {
    toast({
      title: `Action: ${action}`,
      description: `This would ${action.toLowerCase()} stock group ${groupId}. This is a placeholder.`,
    });
  };

  const handleAddGroup = () => {
    // In a real app, you would handle form submission data
    const newGroup = {
        id: `SG-${Date.now()}`,
        name: "New Group",
        under: "Primary",
        itemsCount: 0
    };
    setGroups(prev => [...prev, newGroup]);
    toast({
        title: "Stock Group Added",
        description: `${newGroup.name} has been added.`
    });
    setIsAddDialogOpen(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Groups</h1>
          <p className="text-muted-foreground">Organize your stock items into hierarchical groups.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2"/>
              Create Stock Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Stock Group</DialogTitle>
              <DialogDescription>
                Create a new category to organize your items.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Name</Label>
                <Input id="group-name" placeholder="e.g., Finished Goods" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-under">Under</Label>
                <Select>
                    <SelectTrigger id="group-under">
                        <SelectValue placeholder="Select a parent group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddGroup}>Save Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Group List</CardTitle>
          <CardDescription>A list of all your stock groups.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Parent Group</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.under}</TableCell>
                  <TableCell className="text-right">{group.itemsCount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleAction("Edit", group.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleAction("Delete", group.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
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
