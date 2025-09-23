
"use client";

import { useState, useContext } from "react";
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
import { ArrowLeft, ArrowRight, FileText, CheckCircle, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AccountingContext } from "@/context/accounting-context";

const initialEmployees = [
    { id: "EMP001", name: "Ananya Sharma", designation: "Software Engineer", basic: 50000, hra: 25000, specialAllowance: 15000, pf: 1800, professionalTax: 200, incomeTax: 5000, lwf: 25, loan: 0, otherDeductions: 0 },
    { id: "EMP002", name: "Rohan Verma", designation: "Marketing Manager", basic: 60000, hra: 30000, specialAllowance: 20000, pf: 1800, professionalTax: 200, incomeTax: 7500, lwf: 25, loan: 2500, otherDeductions: 150 },
    { id: "EMP003", name: "Priya Singh", designation: "HR Executive", basic: 40000, hra: 20000, specialAllowance: 10000, pf: 1800, professionalTax: 200, incomeTax: 3000, lwf: 25, loan: 0, otherDeductions: 0 },
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

const calculateSalary = (emp: typeof initialEmployees[0]) => {
    const grossEarnings = emp.basic + emp.hra + emp.specialAllowance;
    const totalDeductions = emp.pf + emp.professionalTax + emp.incomeTax + emp.lwf + emp.loan + emp.otherDeductions;
    const netSalary = grossEarnings - totalDeductions;
    return { grossEarnings, totalDeductions, netSalary };
};

export default function RunPayrollPage() {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [financialYear, setFinancialYear] = useState(getFinancialYears()[0]);
    const [month, setMonth] = useState(months[new Date().getMonth()]);
    const accountingContext = useContext(AccountingContext);
    
    const [payrollData, setPayrollData] = useState(initialEmployees.map(emp => ({...emp, ...calculateSalary(emp)})));
    
    const handleDeductionChange = (employeeId: string, field: 'incomeTax' | 'lwf' | 'loan' | 'otherDeductions', value: number) => {
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
                { account: '5020', debit: String(totalGross), credit: '0' }, // Debit Salaries and Wages
                { account: '2010', debit: '0', credit: String(totalNet) },    // Credit Accounts Payable (as Salary Payable)
                { account: '2130', debit: '0', credit: String(totalPf + totalTds + totalLwf + totalPt) }, // Credit TDS/Statutory Payable
            ],
            amount: totalGross,
        };
        
        try {
            await addJournalVoucher(salaryPayableVoucher);
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
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead className="text-right">Gross (₹)</TableHead>
                                        <TableHead className="text-right">Income Tax (₹)</TableHead>
                                        <TableHead className="text-right">LWF (₹)</TableHead>
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
                                            <TableCell><Input type="number" className="w-24 ml-auto text-right" value={emp.incomeTax} onChange={e => handleDeductionChange(emp.id, 'incomeTax', parseFloat(e.target.value) || 0)} /></TableCell>
                                            <TableCell><Input type="number" className="w-20 ml-auto text-right" value={emp.lwf} onChange={e => handleDeductionChange(emp.id, 'lwf', parseFloat(e.target.value) || 0)}/></TableCell>
                                            <TableCell><Input type="number" className="w-24 ml-auto text-right" value={emp.loan} onChange={e => handleDeductionChange(emp.id, 'loan', parseFloat(e.target.value) || 0)}/></TableCell>
                                            <TableCell><Input type="number" className="w-24 ml-auto text-right" value={emp.otherDeductions} onChange={e => handleDeductionChange(emp.id, 'otherDeductions', parseFloat(e.target.value) || 0)}/></TableCell>
                                            <TableCell className="text-right font-mono font-semibold">{emp.netSalary.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-right font-bold text-lg">Total Payout</TableCell>
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
                            <CardDescription>A journal voucher for the salary payment has been automatically posted.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="p-4 bg-muted/50 rounded-lg text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Total Salary Payout</p>
                            <p className="text-3xl font-bold font-mono">₹{totalNetSalary.toFixed(2)}</p>
                           </div>
                        </CardContent>
                         <CardFooter className="flex-col sm:flex-row gap-2 justify-center">
                            <Button variant="outline"><FileDown className="mr-2"/>Download Payslips (All)</Button>
                            <Button variant="outline"><FileText className="mr-2"/>View Salary Journal Voucher</Button>
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
