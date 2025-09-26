
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSignature, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

const getFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 3; i++) {
        const startYear = currentYear - i - 1;
        years.push(`${startYear}-${(startYear + 1).toString().slice(-2)}`);
    }
    return years;
};

const initialEmployees = [
    { id: "EMP001", name: "Ananya Sharma", pan: "ABCDE1234F", designation: "Software Engineer", grossSalary: 1068000, taxDeducted: 75000 },
    { id: "EMP002", name: "Rohan Verma", pan: "FGHIJ5678K", designation: "Marketing Manager", grossSalary: 1320000, taxDeducted: 110000 },
    { id: "EMP003", name: "Priya Singh", pan: "KLMNO9876P", designation: "HR Executive", grossSalary: 816000, taxDeducted: 45000 },
];

export default function Form16GeneratorPage() {
  const { toast } = useToast();
  const [financialYear, setFinancialYear] = useState(getFinancialYears()[0]);

  const handleGenerateForm16 = (employee: typeof initialEmployees[0]) => {
    const doc = new jsPDF();

    // Part A - TDS Certificate
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FORM 16", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("[See Rule 31(1)(a)]", 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.text("Part A", 14, 35);
    doc.text("Certificate under Section 203 of the Income-tax Act, 1961 for tax deducted at source on salary", 14, 42);

    (doc as any).autoTable({
        startY: 50,
        body: [
            ["Name and address of the Employer", "GSTEase Solutions Pvt. Ltd.\n123 Business Avenue, Commerce City, MH"],
            ["Name and address of the Employee", `${employee.name}\n[Employee Address]`],
            ["PAN of the Deductor", "COMPN1234X"],
            ["TAN of the Deductor", "DELC12345D"],
            ["PAN of the Employee", employee.pan],
            ["Assessment Year", `${parseInt(financialYear.split('-')[0]) + 1}-${parseInt(financialYear.split('-')[1]) + 1}`],
            ["Period with the Employer", `01-Apr-${financialYear.split('-')[0]} to 31-Mar-20${financialYear.split('-')[1]}`],
        ],
        theme: 'grid'
    });

    // Part B - Annexure to Part A
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Part B (Annexure)", 14, 20);

     (doc as any).autoTable({
        startY: 25,
        body: [
            [{ content: "1. Gross Salary", styles: { fontStyle: 'bold' } }, ""],
            ["(a) Salary as per provisions contained in sec. 17(1)", employee.grossSalary.toFixed(2)],
            ["(b) Value of perquisites u/s 17(2)", "0.00"],
            ["(c) Profits in lieu of salary u/s 17(3)", "0.00"],
            ["Total", employee.grossSalary.toFixed(2)],
            ["2. Less: Allowance to the extent exempt u/s 10", "0.00"],
            ["3. Balance (1 - 2)", employee.grossSalary.toFixed(2)],
            ["4. Deductions under section 16", ""],
            ["(a) Standard Deduction u/s 16(ia)", "50000.00"],
            ["5. Income chargeable under the head 'Salaries' (3-4)", (employee.grossSalary - 50000).toFixed(2)],
            ["6. Add: Any other income reported by the employee", "0.00"],
            ["7. Gross total income (5+6)", (employee.grossSalary - 50000).toFixed(2)],
            ["8. Deductions under Chapter VI-A", "0.00"],
            ["9. Total taxable income (7-8)", (employee.grossSalary - 50000).toFixed(2)],
            ["10. Tax on total income", employee.taxDeducted.toFixed(2)], // Simplified for demo
            ["11. Surcharge", "0.00"],
            ["12. Health and education cess @ 4%", (employee.taxDeducted * 0.04).toFixed(2)], // Simplified
            ["13. Total tax payable (10+11+12)", (employee.taxDeducted * 1.04).toFixed(2)],
            ["14. Tax deducted at source u/s 192", employee.taxDeducted.toFixed(2)],
        ],
        theme: 'grid'
    });

    doc.save(`Form16_${employee.name.replace(/\s/g, '_')}_${financialYear}.pdf`);
    toast({ title: "Form 16 Generated", description: `PDF for ${employee.name} has been downloaded.` });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
            <FileSignature className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Form 16 Generator</h1>
        <p className="text-muted-foreground">
          Generate TDS certificates for salaries paid to your employees.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
          <CardDescription>
            Choose the financial year for which you want to generate Form 16.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2 max-w-xs">
                <Label>Financial Year</Label>
                <Select value={financialYear} onValueChange={setFinancialYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {getFinancialYears().map(fy => <SelectItem key={fy} value={fy}>{fy}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>Generate Form 16 for employees for the financial year {financialYear}.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                            <TableCell className="font-mono">{emp.id}</TableCell>
                            <TableCell className="font-medium">{emp.name}</TableCell>
                            <TableCell>{emp.designation}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" onClick={() => handleGenerateForm16(emp)}>
                                    <Download className="mr-2"/>
                                    Generate
                                </Button>
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
