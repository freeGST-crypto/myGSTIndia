
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, ChevronDown, Upload, Download, FileSpreadsheet, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const initialEmployees = [
    { id: "EMP001", name: "Ananya Sharma", designation: "Software Engineer", basic: 50000, hra: 25000, specialAllowance: 15000, pf: 1800, professionalTax: 200, incomeTax: 5000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "001122334455", bankIfsc: "HDFC0000123", uan: "101234567890", esi: "", pan: "ABCDE1234F", section80C: 150000, section80D: 25000, houseRent: 300000 },
    { id: "EMP002", name: "Rohan Verma", designation: "Marketing Manager", basic: 60000, hra: 30000, specialAllowance: 20000, pf: 1800, professionalTax: 200, incomeTax: 7500, lwf: 25, loan: 2500, otherDeductions: 150, bankAccount: "112233445566", bankIfsc: "ICIC0000456", uan: "109876543210", esi: "", pan: "FGHIJ5678K", section80C: 100000, section80D: 0, houseRent: 0 },
    { id: "EMP003", name: "Priya Singh", designation: "HR Executive", basic: 40000, hra: 20000, specialAllowance: 10000, pf: 1800, professionalTax: 200, incomeTax: 3000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "223344556677", bankIfsc: "SBIN0000789", uan: "102345678901", esi: "1234567", pan: "KLMNO9876P", section80C: 75000, section80D: 15000, houseRent: 240000 },
];

// Simplified tax calculation logic (New Regime)
const calculateTds = (emp: any) => {
    const grossAnnual = (emp.basic + emp.hra + emp.specialAllowance) * 12;
    const standardDeduction = 50000;
    const section80C = Math.min(emp.section80C || 0, 150000);
    const section80D = Math.min(emp.section80D || 0, 25000);

    let taxableIncome = grossAnnual - standardDeduction - section80C - section80D;
    
    // HRA Exemption (simplified)
    const hraReceived = emp.hra * 12;
    const rentPaid = emp.houseRent || 0;
    const hraExemption = Math.min(hraReceived, rentPaid - (emp.basic * 12 * 0.1));
    if(hraExemption > 0) taxableIncome -= hraExemption;


    let tax = 0;
    if (taxableIncome > 1500000) tax = (taxableIncome - 1500000) * 0.30 + 150000;
    else if (taxableIncome > 1200000) tax = (taxableIncome - 1200000) * 0.20 + 90000;
    else if (taxableIncome > 900000) tax = (taxableIncome - 900000) * 0.15 + 45000;
    else if (taxableIncome > 600000) tax = (taxableIncome - 600000) * 0.10 + 15000;
    else if (taxableIncome > 300000) tax = (taxableIncome - 300000) * 0.05;
    
    const totalTax = tax > 0 ? tax + (tax * 0.04) : 0; // Add 4% cess
    return totalTax / 12; // Monthly TDS
};


const calculateSalary = (emp: any) => {
    const autoTds = calculateTds(emp);
    const grossEarnings = emp.basic + emp.hra + emp.specialAllowance;
    const totalDeductions = (emp.pf || 0) + (emp.professionalTax || 0) + autoTds + (emp.lwf || 0) + (emp.loan || 0) + (emp.otherDeductions || 0);
    const netSalary = grossEarnings - totalDeductions;
    return { grossEarnings, totalDeductions, netSalary, incomeTax: autoTds };
};


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

  const handleExport = () => {
    const dataToExport = employees.map(emp => ({
        'Employee ID': emp.id,
        'Name': emp.name,
        'Designation': emp.designation,
        'PAN': emp.pan,
        'Aadhaar': emp.aadhaar,
        'Bank Account': emp.bankAccount,
        'Bank IFSC': emp.bankIfsc,
        'Basic Salary': emp.basic,
        'HRA': emp.hra,
        'Special Allowance': emp.specialAllowance,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, `Employee_Data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Successful", description: "Employee data has been exported to an Excel file." });
  };
  
    const handleDownloadTemplate = () => {
        const headers = "Employee ID,Name,Designation,PAN,Aadhaar,Bank Account,Bank IFSC,Basic Salary,HRA,Special Allowance";
        const exampleData = "EMP004,New Employee,Analyst,PQRST1234U,432198765432,334455667788,AXIS0000123,30000,15000,5000";
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleData}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "employee_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Template Downloaded", description: "The employee import template has been downloaded." });
    }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Add, view, and manage all your employee details, salary structures, and investment declarations.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Import/Export
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Employees
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export to CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2"/>Add Employee</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
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
                        <h3 className="font-semibold text-lg">Compensation Details (Monthly)</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Basic Salary (₹)</Label><Input type="number"/></div>
                            <div className="space-y-2"><Label>House Rent Allowance (HRA) (₹)</Label><Input type="number"/></div>
                            <div className="space-y-2"><Label>Special Allowance (₹)</Label><Input type="number"/></div>
                        </div>
                        <Separator/>
                         <h3 className="font-semibold text-lg">Investment Declarations (Annual)</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Section 80C Investment</Label><Input type="number" placeholder="e.g., 150000"/></div>
                            <div className="space-y-2"><Label>Section 80D (Medical)</Label><Input type="number" placeholder="e.g., 25000" /></div>
                            <div className="space-y-2"><Label>Annual Rent Paid</Label><Input type="number" placeholder="e.g., 300000" /></div>
                        </div>
                        <div className="pt-2"><Label>Upload Proofs</Label><Input type="file" multiple/></div>
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
                            <TableCell className="text-right font-mono">{calculateSalary(emp).netSalary.toFixed(2)}</TableCell>
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
