
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

const reports = [
    { title: "PF ECR (Electronic Challan cum Return)", description: "Generate the ECR file for monthly PF return filing.", icon: FileText },
    { title: "ESI Monthly Contribution Return", description: "Prepare the monthly return for ESI contributions.", icon: FileText },
    { title: "Professional Tax (PT) Report", description: "Generate state-wise professional tax computation reports.", icon: FileText },
    { title: "Form 24Q (TDS on Salary)", description: "Prepare details required for quarterly TDS return on salaries.", icon: FileText },
];

export default function PayrollReportsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Payroll Compliance Reports</h1>
        <p className="text-muted-foreground">
          Generate statutory reports for PF, ESI, PT, and TDS.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map(report => (
            <Card key={report.title}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><report.icon className="text-primary"/>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button>
                        <Download className="mr-2"/>
                        Generate Report
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
