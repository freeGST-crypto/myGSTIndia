"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Ticket, Percent, IndianRupee } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { servicePricing } from "@/lib/on-demand-pricing";
import { Checkbox } from "@/components/ui/checkbox";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  status: "Active" | "Expired" | "Inactive";
  expiryDate: Date;
  appliesTo: {
    subscriptions: ("business" | "professional")[];
    services: string[];
  };
};

const initialCoupons: Coupon[] = [
  {
    id: "C-001",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    status: "Active",
    expiryDate: new Date(2024, 11, 31),
    appliesTo: { subscriptions: ["business", "professional"], services: [] },
  },
  {
    id: "C-002",
    code: "CMA500",
    type: "fixed",
    value: 500,
    status: "Active",
    expiryDate: new Date(2024, 8, 30),
    appliesTo: { subscriptions: [], services: ["CMA_REPORT"] },
  },
  {
    id: "C-003",
    code: "OLDOFFER",
    type: "percentage",
    value: 20,
    status: "Expired",
    expiryDate: new Date(2023, 11, 31),
    appliesTo: { subscriptions: ["business"], services: [] },
  },
];

const allServices = Object.values(servicePricing).flat();

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAction = (action: string, couponId: string) => {
    toast({
      title: `Action: ${action}`,
      description: `This would ${action.toLowerCase()} coupon ${couponId}. This is a placeholder.`,
    });
  };

  const getStatusBadge = (status: Coupon['status']) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case "Expired":
        return <Badge variant="secondary">Expired</Badge>;
      case "Inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons & Discounts</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
             <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogDescription>Define a new discount code for your users.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Coupon Code</Label>
                        <Input placeholder="e.g., LAUNCH20" />
                    </div>
                     <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Discount Type</Label>
                         <Select defaultValue="percentage">
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Value</Label>
                        <Input type="number" placeholder="e.g., 10 (for 10%) or 500 (for ₹500)" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Applicable To</Label>
                    <div className="p-4 border rounded-md space-y-4 max-h-48 overflow-y-auto">
                        <div className="flex items-center space-x-2"><Checkbox id="sub-biz"/><Label htmlFor="sub-biz">Business Plan Subscription</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="sub-pro"/><Label htmlFor="sub-pro">Professional Plan Subscription</Label></div>
                        <h4 className="font-semibold pt-2 border-t">On-Demand Services</h4>
                        {allServices.map(service => (
                             <div key={service.id} className="flex items-center space-x-2">
                                <Checkbox id={`service-${service.id}`}/>
                                <Label htmlFor={`service-${service.id}`}>{service.name}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={() => {toast({title: "Coupon Created"}); setIsDialogOpen(false);}}>Save Coupon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Coupon Codes</CardTitle>
          <CardDescription>View, manage, and create discount codes for subscriptions and services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length > 0 ? coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono">{coupon.code}</TableCell>
                  <TableCell className="font-semibold flex items-center gap-1">
                      {coupon.type === 'percentage' ? <Percent className="size-4 text-muted-foreground"/> : <IndianRupee className="size-4 text-muted-foreground"/>}
                      {coupon.value}{coupon.type === 'percentage' && '%'}
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                  <TableCell>{format(coupon.expiryDate, 'dd MMM, yyyy')}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleAction("Edit", coupon.id)}><Edit className="mr-2"/>Edit Coupon</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleAction("Delete", coupon.id)}><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No coupons created yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}