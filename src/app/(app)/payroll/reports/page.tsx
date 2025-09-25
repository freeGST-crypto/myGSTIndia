
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
import { Download, FileText, IndianRupee, Landmark, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/dashboard/stat-card";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';


const initialEmployees = [
    { id: "EMP001", name: "Ananya Sharma", designation: "Software Engineer", basic: 50000, hra: 25000, specialAllowance: 15000, pf: 1800, professionalTax: 200, incomeTax: 5000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "001122334455", bankIfsc: "HDFC0000123", uan: "101234567890", esi: "", pan: "ABCDE1234F" },
    { id: "EMP002", name: "Rohan Verma", designation: "Marketing Manager", basic: 60000, hra: 30000, specialAllowance: 20000, pf: 1800, professionalTax: 200, incomeTax: 7500, lwf: 25, loan: 2500, otherDeductions: 150, bankAccount: "112233445566", bankIfsc: "ICIC0000456", uan: "109876543210", esi: "", pan: "FGHIJ5678K" },
    { id: "EMP003", name: "Priya Singh", designation: "HR Executive", basic: 40000, hra: 20000, specialAllowance: 10000, pf: 1800, professionalTax: 200, incomeTax: 3000, lwf: 25, loan: 0, otherDeductions: 0, bankAccount: "223344556677", bankIfsc: "SBIN0000789", uan: "102345678901", esi: "1234567", pan: "KLMNO9876P" },
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
    let worksheet: XLSX.WorkSheet;
    
    switch (reportId) {
      case "pf_ecr":
        const ecrData = payrollData.map(emp => {
            const epfWages = Math.min(emp.basic, 15000);
            const employeeContribution = epfWages * 0.12;
            const employerPensionContribution = Math.min(epfWages * 0.0833, 1250);
            const employerPfContribution = (epfWages * 0.12) - employerPensionContribution;

            return [
                emp.uan,
                emp.name,
                emp.grossEarnings,
                epfWages, // EPF Wages
                epfWages, // EPS Wages
                epfWages, // EDLI Wages
                (employeeContribution + employerPfContribution).toFixed(2), // EPF Contribution
                employerPensionContribution.toFixed(2), // EPS Contribution
                0, // EPF-EPS Difference
                0, // NCP Days
                0, // Refund of Advances
            ].join('#~#')
        }).join('\n');
        
        const ecrContent = ecrData;
        const ecrBlob = new Blob([ecrContent], { type: 'text/plain;charset=utf-8' });
        const ecrUrl = URL.createObjectURL(ecrBlob);
        const ecrLink = document.createElement('a');
        ecrLink.href = ecrUrl;
        ecrLink.download = `PF_ECR_${month}_${year}.txt`;
        document.body.appendChild(ecrLink);
        ecrLink.click();
        document.body.removeChild(ecrLink);
        URL.revokeObjectURL(ecrUrl);
        toast({ title: "PF ECR Generated", description: `A .txt file for ${reportMonth} has been downloaded.` });
        return;

      case "esi_return":
        worksheet = XLSX.utils.json_to_sheet(payrollData.filter(e => e.esi).map(emp => ({
            "IP Number": emp.esi,
            "IP Name": emp.name,
            "No of Days": 30, // Assuming 30 days
            "Total Wages": emp.grossEarnings,
            "IP Contribution": emp.grossEarnings * 0.0075
        })));
        break;
      case "pt_report":
        worksheet = XLSX.utils.json_to_sheet(payrollData.map(emp => ({
            "Employee ID": emp.id,
            "PAN": emp.pan,
            "Employee Name": emp.name,
            "Gross Salary": emp.grossEarnings,
            "PT Amount": emp.professionalTax
        })));
        break;
      case "form_24q":
        worksheet = XLSX.utils.json_to_sheet(payrollData.map(emp => ({
            "PAN": emp.pan,
            "Employee Name": emp.name,
            "TDS Amount": emp.incomeTax,
            "Date of Deduction": format(new Date(parseInt(year), parseInt(month)-1, 28), 'yyyy-MM-dd')
        })));
        break;
      default:
        toast({ variant: "destructive", title: "Invalid Report Type" });
        return;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);
    XLSX.writeFile(workbook, `${reportId}_${month}_${year}.xlsx`);
    
    toast({
      title: "Report Generated",
      description: `${reportTitle} for ${reportMonth} has been downloaded.`,
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
