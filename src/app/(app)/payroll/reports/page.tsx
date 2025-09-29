
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

export default function PayrollReportsPage() {
    const [reportType, setReportType] = useState("payslip");
    const { toast } = useToast();

    const handleDownload = () => {
        toast({
            title: "Download Initiated",
            description: `Your ${reportType} report is being generated and will download shortly. (Simulation)`
        })
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Payroll Reports</h1>
                <p className="text-muted-foreground">
                    Generate and download various payroll and compliance reports.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Report Generation</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Report Type</label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payslip">All Payslips (PDF)</SelectItem>
                                <SelectItem value="payroll_summary">Payroll Summary (Excel)</SelectItem>
                                <SelectItem value="pf_challan">PF Challan (ECR)</SelectItem>
                                <SelectItem value="esi_challan">ESI Challan</SelectItem>
                                <SelectItem value="form_16">Form 16 Part A & B</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Month</label>
                         <Select defaultValue={String(new Date().getMonth())}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {months.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                         <Select defaultValue={String(new Date().getFullYear())}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button className="w-full" onClick={handleDownload}>
                            <Download className="mr-2"/>
                            Generate & Download
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

