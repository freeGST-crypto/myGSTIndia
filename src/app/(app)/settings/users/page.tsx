
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const sampleUsers = [
  { id: "user-001", name: "Rohan Sharma", email: "rohan.sharma@example.com", role: "Admin", status: "Active" },
  { id: "user-002", name: "Priya Mehta", email: "priya.mehta@example.com", role: "Accountant", status: "Active" },
  { id: "user-003", name: "Anjali Singh", email: "anjali.singh@example.com", role: "Sales Manager", status: "Invited" },
];

export default function UserManagementPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState(sampleUsers);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("viewer");

  const handleAction = (action: string, userId: string) => {
    toast({
        title: `Action: ${action}`,
        description: `This is a placeholder for ${action} on user ${userId}.`
    });
  }

  const handleSendInvite = () => {
    if (!newUserEmail || !newUserRole) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter an email and select a role."
        });
        return;
    }
    // Simulate adding an invited user
    const newUser = {
        id: `user-${Date.now()}`,
        name: "Pending Invitation",
        email: newUserEmail,
        role: newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1),
        status: "Invited",
    };
    setUsers(prev => [...prev, newUser]);
    toast({
        title: "Invitation Sent",
        description: `${newUserEmail} has been invited to join as a ${newUser.role}.`
    });
    setIsInviteDialogOpen(false);
    setNewUserEmail("");
    setNewUserRole("viewer");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Invite, manage, and set permissions for users in your organization.
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <UserPlus className="mr-2"/>
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite a New User</DialogTitle>
                    <DialogDescription>
                        Enter the user's email and assign them a role. They will receive an email invitation to join.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="user-email">Email Address</Label>
                        <Input id="user-email" type="email" placeholder="name@example.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                     </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select value={newUserRole} onValueChange={setNewUserRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                <SelectItem value="accountant">Accountant (Billing & Accounting)</SelectItem>
                                <SelectItem value="sales">Sales (Billing only)</SelectItem>
                                <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </div>
                <DialogFooter>
                     <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSendInvite}>Send Invitation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>User List</CardTitle>
              <CardDescription>A list of all users with access to this organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                             <TableCell>
                                <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === "Active" ? "bg-green-600" : ""}>
                                    {user.status}
                                </Badge>
                             </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => handleAction("Edit", user.id)}><Edit className="mr-2"/>Edit Role</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onSelect={() => handleAction("Delete", user.id)}>
                                            <Trash2 className="mr-2"/>Remove User
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
