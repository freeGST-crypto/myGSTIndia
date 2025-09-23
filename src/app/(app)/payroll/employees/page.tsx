
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const initialEmployees = [
    { id: "EMP001", name: "Ananya Sharma", designation: "Software Engineer", basic: 50000, hra: 25000, specialAllowance: 15000, pf: 1800, professionalTax: 200, netSalary: 88000 },
    { id: "EMP002", name: "Rohan Verma", designation: "Marketing Manager", basic: 60000, hra: 30000, specialAllowance: 20000, pf: 1800, professionalTax: 200, netSalary: 108000 },
    { id: "EMP003", name: "Priya Singh", designation: "HR Executive", basic: 40000, hra: 20000, specialAllowance: 10000, pf: 1800, professionalTax: 200, netSalary: 68000 },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAction = (action: 'Edit' | 'Delete', employeeId: string) => {
    toast({
        title: `Action: ${action}`,
        description: `This would ${action.toLowerCase()} employee ${employeeId}. This functionality is a placeholder.`
    })
  };

  const handleAddEmployee = () => {
    toast({ title: "Employee Added", description: "The new employee details have been saved." });
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Add, view, and manage all your employee details.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2"/>Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                 <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>Enter the details for the new employee.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Employee Name</Label><Input/></div>
                        <div className="space-y-2"><Label>Personal Email</Label><Input type="email"/></div>
                        <div className="space-y-2"><Label>Phone Number</Label><Input/></div>
                        <div className="space-y-2"><Label>Date of Birth</Label><Input type="date"/></div>
                    </div>
                     <Separator/>
                    <h3 className="font-semibold text-lg">Employment Details</h3>
                     <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Employee ID</Label><Input/></div>
                        <div className="space-y-2"><Label>Date of Joining</Label><Input type="date"/></div>
                        <div className="space-y-2"><Label>Designation</Label><Input/></div>
                        <div className="space-y-2"><Label>Department</Label><Input/></div>
                        <div className="space-y-2"><Label>Work Location</Label><Input/></div>
                    </div>
                     <Separator/>
                     <h3 className="font-semibold text-lg">Compensation Details</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Annual CTC (₹)</Label><Input type="number"/></div>
                        <div className="space-y-2"><Label>Pay Frequency</Label>
                          <Select defaultValue="monthly">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Salary components (monthly basis):</p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Basic Salary (₹)</Label><Input type="number"/></div>
                        <div className="space-y-2"><Label>House Rent Allowance (HRA) (₹)</Label><Input type="number"/></div>
                        <div className="space-y-2"><Label>Special Allowance (₹)</Label><Input type="number"/></div>
                    </div>
                     <Separator/>
                     <h3 className="font-semibold text-lg">Attendance &amp; Leave Policy</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Working Days per Month</Label><Input type="number" defaultValue="22"/></div>
                         <div className="space-y-2"><Label>Leave Policy</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Assign a policy"/></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard Policy</SelectItem>
                              <SelectItem value="senior">Senior Staff Policy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                     </div>
                     <Separator/>
                     <h3 className="font-semibold text-lg">Statutory & Bank Details</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>PAN</Label><Input/></div>
                        <div className="space-y-2"><Label>Aadhaar Number</Label><Input/></div>
                        <div className="space-y-2"><Label>Bank Account Number</Label><Input/></div>
                        <div className="space-y-2"><Label>Bank IFSC Code</Label><Input/></div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddEmployee}>Save Employee</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>A list of all employees in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Net Salary (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono">{emp.id}</TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell className="text-right font-mono">{emp.netSalary.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleAction("Edit", emp.id)}><Edit className="mr-2"/>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleAction("Delete", emp.id)}><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
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
