
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const sampleEmployees = [
    { id: "EMP-001", name: "Rohan Sharma", designation: "Software Engineer", status: "Active" },
    { id: "EMP-002", name: "Priya Mehta", designation: "Product Manager", status: "Active" },
    { id: "EMP-003", name: "Anjali Singh", designation: "UX Designer", status: "Active" },
    { id: "EMP-004", name: "Vikram Rathod", designation: "QA Engineer", status: "Resigned" },
];

export default function PayrollEmployeesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-muted-foreground">Manage your employee master data.</p>
                </div>
                <Button>
                    <UserPlus className="mr-2"/>
                    Add New Employee
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sampleEmployees.map(emp => (
                                <TableRow key={emp.id}>
                                    <TableCell className="font-mono">{emp.id}</TableCell>
                                    <TableCell className="font-medium">{emp.name}</TableCell>
                                    <TableCell>{emp.designation}</TableCell>
                                    <TableCell>
                                        <Badge variant={emp.status === "Active" ? "default" : "destructive"}>
                                            {emp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem><FileText className="mr-2"/> View Profile</DropdownMenuItem>
                                                <DropdownMenuItem><Edit className="mr-2"/> Edit Employee</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/> Deactivate</DropdownMenuItem>
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
