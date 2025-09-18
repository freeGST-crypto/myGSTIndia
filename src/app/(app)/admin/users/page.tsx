
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Input } from "@/components/ui/input";
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  User,
  Switch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const sampleUsers = [
  {
    id: "USR-001",
    name: "Rohan Sharma",
    role: "Professional",
    gstin: "27ABCDE1234F1Z5",
    status: "Active",
    email: "rohan.sharma@ca-firm.com",
    phone: "9876543210",
    pan: "ABCDE1234F",
    address: {
      line1: "123 Business Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  },
  {
    id: "USR-002",
    name: "Priya Mehta",
    role: "Business",
    gstin: "29FGHIJ5678K1Z6",
    status: "Active",
    email: "priya.mehta@enterprise.com",
    phone: "9123456789",
    pan: "FGHIJ5678K",
    address: {
      line1: "456 Commerce Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
    },
  },
  {
    id: "USR-003",
    name: "Anjali Singh",
    role: "Business",
    gstin: "07LMNOP1234Q1Z9",
    status: "Pending Onboarding",
    email: "anjali.singh@startup.io",
    phone: "8765432109",
    pan: "LMNOP1234Q",
    address: {
      line1: "789 Innovation Hub",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    },
  },
];

type User = (typeof sampleUsers)[0];

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState(sampleUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSwitchWorkspace = (userName: string) => {
    toast({
      title: `Switched to ${userName}'s Workspace`,
      description: `You are now managing account for ${userName}. Be careful!`,
    });
    // In a real app, this would trigger a context switch or redirect.
  };
  
  const handleSelectUser = (userId: string) => {
      const user = users.find(u => u.id === userId);
      setSelectedUser(user || null);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case "Pending Onboarding":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>User & Client Management</CardTitle>
            <CardDescription>
              Search, view, and manage all users on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, phone, or GSTIN..."
                  className="pl-8 sm:w-full"
                />
              </div>
              <Button variant="outline">
                <FileSpreadsheet className="mr-2" />
                Export to CSV
              </Button>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} onClick={() => handleSelectUser(user.id)} className="cursor-pointer">
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.role}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {user.gstin}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                              e.stopPropagation();
                              handleSwitchWorkspace(user.name);
                          }}
                        >
                          <Switch className="mr-2" /> Switch Workspace
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User /> {selectedUser ? 'Edit User' : 'Select a User'}
            </CardTitle>
            <CardDescription>
              {selectedUser ? `Viewing details for ${selectedUser.name}` : 'Select a user from the list to view and edit their details.'}
            </CardDescription>
          </CardHeader>
          {selectedUser && (
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input defaultValue={selectedUser.name}/>
                </div>
                 <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue={selectedUser.phone}/>
                </div>
                 <div className="space-y-2">
                    <Label>Role (Super Admin Only)</Label>
                     <Select defaultValue={selectedUser.role} >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Super Admin">Super Admin</SelectItem>
                            <SelectItem value="Professional">Professional</SelectItem>
                             <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Separator/>
                <div className="space-y-2">
                    <Label>GSTIN</Label>
                    <Input defaultValue={selectedUser.gstin}/>
                </div>
                <div className="space-y-2">
                    <Label>PAN</Label>
                    <Input defaultValue={selectedUser.pan}/>
                </div>
                <Separator/>
                <div className="space-y-2">
                    <Label>Billing Address</Label>
                    <Input placeholder="Address Line 1" defaultValue={selectedUser.address.line1}/>
                    <Input placeholder="City" defaultValue={selectedUser.address.city}/>
                    <Input placeholder="State" defaultValue={selectedUser.address.state}/>
                    <Input placeholder="Pincode" defaultValue={selectedUser.address.pincode}/>
                </div>
                <Button className="w-full">Save Changes</Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
