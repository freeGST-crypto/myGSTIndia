
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, IndianRupee, Landmark, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/dashboard/stat-card";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';


const initialEmployees = [
    { id: "EMP001", name: "Ananya Sharma", designation: "Software Engineer", basic: 50000, hra: 25000, specialAllowance: 15000, pf: 1800, professionalTax: 200, incomeTax: 5000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "001122334455", bankIfsc: "HDFC0000123", uan: "101234567890", esi: "" },
    { id: "EMP002", name: "Rohan Verma", designation: "Marketing Manager", basic: 60000, hra: 30000, specialAllowance: 20000, pf: 1800, professionalTax: 200, incomeTax: 7500, lwf: 25, loan: 2500, otherDeductions: 150, bankAccount: "112233445566", bankIfsc: "ICIC0000456", uan: "109876543210", esi: "" },
    { id: "EMP003", name: "Priya Singh", designation: "HR Executive", basic: 40000, hra: 20000, specialAllowance: 10000, pf: 1800, professionalTax: 200, incomeTax: 3000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "223344556677", bankIfsc: "SBIN0000789", uan: "102345678901", esi: "1234567" },
];

const calculateSalary = (emp: any) => {
    const grossEarnings = emp.basic + emp.hra + emp.specialAllowance;
    const totalDeductions = emp.pf + emp.professionalTax + emp.incomeTax + emp.lwf + emp.loan + emp.otherDeductions;
    const netSalary = grossEarnings - totalDeductions;
    return { grossEarnings, totalDeductions, netSalary };
};

const payrollData = initialEmployees.map(emp => ({...emp, ...calculateSalary(emp)}));

const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
    { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" }
];


export default function PayrollReportsPage() {
  const { toast } = useToast();
  const [month, setMonth] = useState(format(new Date(), 'MM'));
  const [year, setYear] = useState(format(new Date(), 'yyyy'));

  const reportMonth = `${months.find(m => m.value === month)?.label}, ${year}`;
  
  const summary = {
      totalSalary: payrollData.reduce((acc, emp) => acc + emp.netSalary, 0),
      totalPf: payrollData.reduce((acc, emp) => acc + emp.pf * 2, 0), // Employee + Employer
      totalEsi: payrollData.reduce((acc, emp) => emp.esi ? acc + ((emp.grossEarnings * 0.0075) + (emp.grossEarnings * 0.0325)) : acc, 0),
      totalTds: payrollData.reduce((acc, emp) => acc + emp.incomeTax, 0),
  }


  const handleGenerateReport = (reportId: string, reportTitle: string) => {
    let headers: string[];
    let data: (string | number)[][];
    let fileType: 'csv' | 'txt' = 'csv';
    
    switch (reportId) {
      case "pf_ecr":
        headers = ["UAN", "Member Name", "Gross Wages", "EPF Wages", "EPS Wages", "EDLI Wages", "EPF Contribution", "EPS Contribution", "EDLI Contribution"];
        data = payrollData.map(emp => [
            emp.uan,
            emp.name,
            emp.grossEarnings,
            emp.basic <= 15000 ? emp.basic : 15000,
            emp.basic <= 15000 ? emp.basic : 15000,
            emp.basic <= 15000 ? emp.basic : 15000,
            emp.pf, // Employee share
            1250,   // EPS share (capped)
            0       // EDLI share (employer side)
        ]);
        fileType = 'txt';
        break;
      case "esi_return":
         headers = ["IP Number", "IP Name", "No of Days", "Total Wages", "IP Contribution"];
         data = payrollData.filter(e => e.esi).map(emp => [
            emp.esi,
            emp.name,
            30, // Assuming 30 days for simplicity
            emp.grossEarnings,
            emp.grossEarnings * 0.0075 // Employee ESI contribution
         ]);
        break;
      case "pt_report":
        headers = ["Employee Name", "Gross Salary", "PT Amount"];
        data = payrollData.map(emp => [
            emp.name,
            emp.grossEarnings,
            emp.professionalTax
        ]);
        break;
      case "form_24q":
        headers = ["PAN", "Employee Name", "TDS Amount", "Date of Deduction"];
        data = payrollData.map(emp => [
            emp.pan,
            emp.name,
            emp.incomeTax,
            format(new Date(parseInt(year), parseInt(month)-1, 28), 'yyyy-MM-dd')
        ]);
        break;
      default:
        toast({ variant: "destructive", title: "Invalid Report Type" });
        return;
    }

    let fileContent = headers.join(fileType === 'txt' ? '#' : ',') + '\n';
    data.forEach(row => {
        fileContent += row.join(fileType === 'txt' ? '#' : ',') + '\n';
    });

    const blob = new Blob([fileContent], { type: `text/${fileType}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportId}_${month}_${year}.${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Generated",
      description: `A ${reportTitle} file for ${reportMonth} has been downloaded.`,
    });
  };

  const reports = [
    { id: "pf_ecr", title: "PF ECR (Electronic Challan cum Return)", description: "Generate the ECR file for monthly PF return filing.", icon: Landmark },
    { id: "esi_return", title: "ESI Monthly Contribution Return", description: "Prepare the monthly return for ESI contributions.", icon: Landmark },
    { id: "pt_report", title: "Professional Tax (PT) Report", description: "Generate state-wise professional tax computation reports.", icon: FileText },
    { id: "form_24q", title: "Form 24Q (TDS on Salary)", description: "Prepare details required for quarterly TDS return on salaries.", icon: Percent },
];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Payroll Compliance Reports</h1>
        <p className="text-muted-foreground">
          Generate statutory reports for PF, ESI, PT, and TDS for a selected month.
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Select Period</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{[...Array(3)].map((_, i) => <SelectItem key={i} value={String(new Date().getFullYear() - i)}>{String(new Date().getFullYear() - i)}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Salary Disbursed" value={`₹${summary.totalSalary.toLocaleString('en-IN')}`} icon={IndianRupee} description={`For ${reportMonth}`} />
        <StatCard title="PF Contribution" value={`₹${summary.totalPf.toLocaleString('en-IN')}`} icon={Landmark} description="Employee + Employer" />
        <StatCard title="ESI Contribution" value={`₹${summary.totalEsi.toLocaleString('en-IN')}`} icon={Landmark} description="Employee + Employer" />
        <StatCard title="TDS on Salary" value={`₹${summary.totalTds.toLocaleString('en-IN')}`} icon={Percent} description="Total tax deducted" />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Download Reports</CardTitle>
            <CardDescription>Select a report to generate and download for {reportMonth}.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            {reports.map(report => (
                <div key={report.id} className="p-4 border rounded-lg flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <report.icon className="size-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleGenerateReport(report.id, report.title)}>
                        <Download className="mr-2"/>
                        Generate
                    </Button>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
