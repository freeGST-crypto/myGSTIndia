
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Unit = {
  id: string;
  symbol: string;
  formalName: string;
  type: "simple" | "compound";
  conversion?: {
    firstUnit: string;
    factor: number;
    secondUnit: string;
  };
};

const initialUnits: Unit[] = [
  { id: "u-1", symbol: "pcs", formalName: "Pieces", type: "simple" },
  { id: "u-2", symbol: "kgs", formalName: "Kilograms", type: "simple" },
  { id: "u-3", symbol: "box", formalName: "Box", type: "compound", conversion: { firstUnit: "box", factor: 12, secondUnit: "pcs" } },
  { id: "u-4", symbol: "dz", formalName: "Dozen", type: "compound", conversion: { firstUnit: "dz", factor: 12, secondUnit: "pcs" } },
];

export default function UnitsPage() {
  const [units, setUnits] = useState(initialUnits);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAction = (action: string, unitId: string) => {
    toast({
      title: `Action: ${action}`,
      description: `This would ${action.toLowerCase()} unit ${unitId}. This is a placeholder.`,
    });
  };

  const handleAddUnit = () => {
    toast({ title: "Unit Added", description: `A new unit has been saved.` });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Units of Measure</h1>
          <p className="text-muted-foreground">
            Manage simple (e.g., Pcs, Kgs) and compound (e.g., Box of 12 Pcs)
            units for your items.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Create Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Unit of Measure</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="simple">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple">Simple Unit</TabsTrigger>
                <TabsTrigger value="compound">Compound Unit</TabsTrigger>
              </TabsList>
              <TabsContent value="simple">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="simple-symbol">Symbol</Label>
                    <Input id="simple-symbol" placeholder="e.g., pcs, kgs, ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="simple-name">Formal Name</Label>
                    <Input id="simple-name" placeholder="e.g., Pieces, Kilograms" />
                  </div>
                </div>
                 <DialogFooter>
                    <Button type="button" onClick={handleAddUnit}>Save Simple Unit</Button>
                </DialogFooter>
              </TabsContent>
              <TabsContent value="compound">
                 <div className="space-y-4 py-4">
                  <Label>Conversion Rate</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">1</p>
                     <Select>
                        <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>{units.filter(u => u.type === 'simple').map(u => <SelectItem key={u.id} value={u.symbol}>{u.symbol}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="font-medium">=</p>
                    <Input type="number" placeholder="e.g., 12" />
                     <Select>
                        <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>{units.filter(u => u.type === 'simple').map(u => <SelectItem key={u.id} value={u.symbol}>{u.symbol}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Separator/>
                   <div className="space-y-2">
                    <Label>New Unit Symbol</Label>
                    <Input placeholder="e.g., box, dz" />
                  </div>
                </div>
                 <DialogFooter>
                    <Button type="button" onClick={handleAddUnit}>Save Compound Unit</Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit List</CardTitle>
          <CardDescription>A list of all your units of measure.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Formal Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-mono">{unit.symbol}</TableCell>
                  <TableCell className="font-medium">{unit.formalName}</TableCell>
                  <TableCell>
                    {unit.type === 'simple' ? 'Simple' : `Compound (${unit.conversion?.factor} ${unit.conversion?.secondUnit})`}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleAction("Edit", unit.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleAction("Delete", unit.id)}
                        >
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
