
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
  ArrowRightLeft,
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
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const sampleUsersList: any[] = [];

type User = {
    id: string;
    name: string;
    role: string;
    gstin: string;
    status: string;
    email: string;
    phone: string;
    pan: string;
    address: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
    },
};
type UserRole = "Super Admin" | "Professional";


export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState(sampleUsersList);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("Super Admin");

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

  const handleExport = () => {
    const dataToExport = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Role: user.role,
      GSTIN: user.gstin,
      PAN: user.pan,
      Status: user.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `Users_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({
        title: "Export Successful",
        description: "The user list has been exported to an Excel file."
    });
  };

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
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">User & Client Management</h1>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Viewing as:</span>
                <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
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
              <Button variant="outline" onClick={handleExport}>
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
                  {users.length > 0 ? users.map((user) => (
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
                          <ArrowRightLeft className="mr-2" /> Switch Workspace
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No users found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-8 mt-[76px]">
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
                {userRole === 'Super Admin' && (
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
                )}
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
                <Button className="w-full" onClick={() => toast({ title: "User Updated", description: "User details have been saved."})}>
                    Save Changes
                </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
