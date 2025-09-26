
"use client";

import { useState, useContext, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, FileText, CheckCircle, FileDown, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AccountingContext } from "@/context/accounting-context";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import Link from "next/link";
import * as XLSX from 'xlsx';

const initialEmployees = [
    { id: "EMP001", name: "Ananya Sharma", designation: "Software Engineer", basic: 50000, hra: 25000, specialAllowance: 15000, pf: 1800, professionalTax: 200, incomeTax: 5000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "001122334455", bankIfsc: "HDFC0000123", section80C: 150000, section80D: 25000, houseRent: 300000 },
    { id: "EMP002", name: "Rohan Verma", designation: "Marketing Manager", basic: 60000, hra: 30000, specialAllowance: 20000, pf: 1800, professionalTax: 200, incomeTax: 7500, lwf: 25, loan: 2500, otherDeductions: 150, bankAccount: "112233445566", bankIfsc: "ICIC0000456", section80C: 100000, section80D: 0, houseRent: 0 },
    { id: "EMP003", name: "Priya Singh", designation: "HR Executive", basic: 40000, hra: 20000, specialAllowance: 10000, pf: 1800, professionalTax: 200, incomeTax: 3000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "223344556677", bankIfsc: "SBIN0000789", section80C: 75000, section80D: 15000, houseRent: 240000 },
];

const getFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 3; i++) {
        const startYear = currentYear - i;
        years.push(`${startYear}-${(startYear + 1).toString().slice(-2)}`);
    }
    return years;
};

const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
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

export default function RunPayrollPage() {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [financialYear, setFinancialYear] = useState('');
    const [month, setMonth] = useState('');
    const accountingContext = useContext(AccountingContext);
    
    useEffect(() => {
        setFinancialYear(getFinancialYears()[0]);
        setMonth(months[new Date().getMonth()]);
    }, []);
    
    const [payrollData, setPayrollData] = useState(initialEmployees.map(emp => ({...emp, ...calculateSalary(emp)})));
    
    const handleDeductionChange = (employeeId: string, field: 'loan' | 'otherDeductions', value: number) => {
        setPayrollData(prevData => {
            const newData = prevData.map(emp => {
                if (emp.id === employeeId) {
                    const updatedEmp = { ...emp, [field]: value };
                    return { ...updatedEmp, ...calculateSalary(updatedEmp) };
                }
                return emp;
            });
            return newData;
        });
    };

    const handleProcessPayroll = async () => {
        if (!accountingContext) return;
        setIsLoading(true);

        const { addJournalVoucher } = accountingContext;

        const totalGross = payrollData.reduce((acc, emp) => acc + emp.grossEarnings, 0);
        const totalNet = payrollData.reduce((acc, emp) => acc + emp.netSalary, 0);
        const totalPf = payrollData.reduce((acc, emp) => acc + emp.pf, 0);
        const totalPt = payrollData.reduce((acc, emp) => acc + emp.professionalTax, 0);
        const totalTds = payrollData.reduce((acc, emp) => acc + emp.incomeTax, 0);
        const totalLwf = payrollData.reduce((acc, emp) => acc + emp.lwf, 0);

        const salaryPayableVoucher = {
            id: `JV-SAL-${financialYear.replace('-', '')}-${month.toUpperCase()}`,
            date: format(new Date(), 'yyyy-MM-dd'),
            narration: `Salary for the month of ${month} ${financialYear}`,
            lines: [
                { account: '6010', debit: String(totalGross), credit: '0' }, // Salaries and Wages - Indirect
                { account: '2430', debit: '0', credit: String(totalNet) },    // Expenses Payable (Salary)
                { account: '2422', debit: '0', credit: String(totalTds + totalPf + totalPt + totalLwf) }, // TDS/Statutory Payable
            ],
            amount: totalGross,
        };
        
        try {
            await addJournalVoucher(salaryPayableVoucher as any);
            setIsLoading(false);
            setStep(2);
            toast({
                title: "Payroll Processed Successfully!",
                description: `Salary for ${month}, ${financialYear} has been processed and a journal voucher has been created.`,
            });
        } catch (error) {
            setIsLoading(false);
            toast({
                variant: 'destructive',
                title: "Failed to Post Journal Voucher",
                description: "There was an error creating the salary voucher.",
            });
        }
    };
    
    const totalNetSalary = payrollData.reduce((acc, emp) => acc + emp.netSalary, 0);

    const handleDownloadPayslip = () => {
        const emp = payrollData[0]; // For demo, use first employee
        if (!emp) return;

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Payslip", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`For the month of ${month} ${financialYear}`, 105, 28, { align: "center" });
        
        doc.line(14, 35, 196, 35);
        doc.text(`Employee Name: ${emp.name}`, 14, 42);
        doc.text(`Designation: ${emp.designation}`, 14, 48);
        doc.text(`Employee ID: ${emp.id}`, 140, 42);

        doc.line(14, 55, 196, 55);

        (doc as any).autoTable({
            startY: 60,
            head: [['Earnings', 'Amount (₹)', 'Deductions', 'Amount (₹)']],
            body: [
                ['Basic Salary', emp.basic.toFixed(2), 'Provident Fund (PF)', emp.pf.toFixed(2)],
                ['House Rent Allowance (HRA)', emp.hra.toFixed(2), 'Professional Tax (PT)', emp.professionalTax.toFixed(2)],
                ['Special Allowance', emp.specialAllowance.toFixed(2), 'Income Tax (TDS)', emp.incomeTax.toFixed(2)],
                ['', '', 'Labour Welfare Fund (LWF)', emp.lwf.toFixed(2)],
                ['', '', 'Loan/Advance', emp.loan.toFixed(2)],
                ['', '', 'Other Deductions', emp.otherDeductions.toFixed(2)],
            ],
            theme: 'grid',
            foot: [
                 [{ content: 'Gross Earnings', styles: { fontStyle: 'bold' } }, 
                  { content: emp.grossEarnings.toFixed(2), styles: { fontStyle: 'bold' } },
                  { content: 'Total Deductions', styles: { fontStyle: 'bold' } },
                  { content: emp.totalDeductions.toFixed(2), styles: { fontStyle: 'bold' } }],
            ]
        });
        
        let finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Net Salary: ₹${emp.netSalary.toFixed(2)}`, 14, finalY);

        doc.save(`Payslip_${emp.name.replace(' ', '_')}_${month}.pdf`);
        toast({ title: "Payslip Downloaded", description: `A sample payslip for ${emp.name} has been downloaded.` });
    };

    const handleDownloadBankTransfer = () => {
        const dataToExport = payrollData.map(emp => ({
            'Beneficiary Name': emp.name,
            'Beneficiary Account Number': emp.bankAccount,
            'Beneficiary Bank IFSC': emp.bankIfsc,
            'Amount': emp.netSalary.toFixed(2),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Transfer");
        XLSX.writeFile(workbook, `Bank_Transfer_${month}_${financialYear}.xlsx`);
        toast({ title: "Export Successful", description: "Bank Transfer sheet has been downloaded." });
    };


    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Review and Confirm Payroll</CardTitle>
                            <CardDescription>Review the calculated salary for each employee for the selected period. You can edit variable deductions like loans or advances before processing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-wrap gap-4 mb-6">
                                <div className="space-y-2">
                                    <Label>Financial Year</Label>
                                    <Select value={financialYear} onValueChange={setFinancialYear}>
                                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>{getFinancialYears().map(fy => <SelectItem key={fy} value={fy}>{fy}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                     <Label>Month</Label>
                                     <Select value={month} onValueChange={setMonth}>
                                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 self-end">
                                    <Button variant="outline"><Upload className="mr-2"/>Import Attendance</Button>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead className="text-right">Gross (₹)</TableHead>
                                        <TableHead className="text-right">Auto TDS (₹)</TableHead>
                                        <TableHead className="text-right">Loan/Adv (₹)</TableHead>
                                        <TableHead className="text-right">Others (₹)</TableHead>
                                        <TableHead className="text-right font-semibold">Net Salary (₹)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payrollData.map(emp => (
                                        <TableRow key={emp.id}>
                                            <TableCell>
                                                <div className="font-medium">{emp.name}</div>
                                                <div className="text-sm text-muted-foreground">{emp.id}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{emp.grossEarnings.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono">{emp.incomeTax.toFixed(2)}</TableCell>
                                            <TableCell><Input type="number" className="w-24 ml-auto text-right" value={emp.loan} onChange={e => handleDeductionChange(emp.id, 'loan', parseFloat(e.target.value) || 0)}/></TableCell>
                                            <TableCell><Input type="number" className="w-24 ml-auto text-right" value={emp.otherDeductions} onChange={e => handleDeductionChange(emp.id, 'otherDeductions', parseFloat(e.target.value) || 0)}/></TableCell>
                                            <TableCell className="text-right font-mono font-semibold">{emp.netSalary.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-right font-bold text-lg">Total Payout</TableCell>
                                        <TableCell className="text-right font-bold font-mono text-lg">₹{totalNetSalary.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button size="lg" onClick={handleProcessPayroll} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <CheckCircle className="mr-2"/>}
                                Confirm & Process Payroll
                            </Button>
                        </CardFooter>
                    </Card>
                );
            case 2:
                 return (
                    <Card>
                        <CardHeader className="items-center text-center">
                            <CheckCircle className="size-16 text-green-500" />
                            <CardTitle>Payroll for {month}, {financialYear} Completed!</CardTitle>
                            <CardDescription>A journal voucher for the salary payment has been automatically posted. You can now download outputs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="p-4 bg-muted/50 rounded-lg text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Total Salary Payout</p>
                            <p className="text-3xl font-bold font-mono">₹{totalNetSalary.toFixed(2)}</p>
                           </div>
                        </CardContent>
                         <CardFooter className="flex-col sm:flex-row gap-2 justify-center">
                            <Button variant="outline" onClick={handleDownloadPayslip}><FileDown className="mr-2"/>Download All Payslips</Button>
                            <Button variant="outline" onClick={handleDownloadBankTransfer}><FileDown className="mr-2"/>Download Bank Transfer Sheet</Button>
                             <Link href="/accounting/journal" passHref>
                                <Button variant="outline"><FileText className="mr-2"/>View Salary Journal Voucher</Button>
                             </Link>
                        </CardFooter>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
             <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold">Run Monthly Payroll</h1>
                <p className="text-muted-foreground">
                    Process salaries for your employees in a few simple steps.
                </p>
                </div>
            </div>
            {renderStep()}
        </div>
    );
}
