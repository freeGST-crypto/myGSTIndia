
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
import { useToast } from "@/hooks/use-toast";

const reports = [
    { id: "pf_ecr", title: "PF ECR (Electronic Challan cum Return)", description: "Generate the ECR file for monthly PF return filing." },
    { id: "esi_return", title: "ESI Monthly Contribution Return", description: "Prepare the monthly return for ESI contributions." },
    { id: "pt_report", title: "Professional Tax (PT) Report", description: "Generate state-wise professional tax computation reports." },
    { id: "form_24q", title: "Form 24Q (TDS on Salary)", description: "Prepare details required for quarterly TDS return on salaries." },
];

export default function PayrollReportsPage() {
  const { toast } = useToast();

  const handleGenerateReport = (reportId: string, reportTitle: string) => {
    let headers: string[];
    let data: (string | number)[][];
    let fileType: 'csv' | 'txt' = 'csv';
    
    // Simulate data generation based on report type
    switch (reportId) {
      case "pf_ecr":
        headers = ["UAN", "Member Name", "Gross Wages", "EPF Wages", "EPS Wages", "EDLI Wages", "EPF Contribution", "EPS Contribution", "EDLI Contribution"];
        data = [
          ["101234567890", "Ananya Sharma", 80000, 15000, 15000, 15000, 1800, 1250, 0],
          ["109876543210", "Rohan Verma", 110000, 15000, 15000, 15000, 1800, 1250, 0],
        ];
        fileType = 'txt'; // ECR is often a text file
        break;
      case "esi_return":
         headers = ["IP Number", "IP Name", "No of Days", "Total Wages", "IP Contribution"];
         data = [
            ["1234567", "Priya Singh", 31, 70000, 525],
         ];
        break;
      case "pt_report":
        headers = ["Employee Name", "Gross Salary", "PT Amount"];
        data = [
            ["Ananya Sharma", 80000, 200],
            ["Rohan Verma", 110000, 200],
            ["Priya Singh", 70000, 200],
        ];
        break;
      case "form_24q":
        headers = ["PAN", "Employee Name", "TDS Amount", "Date of Deduction"];
        data = [
            ["ABCDE1234F", "Ananya Sharma", 5000, "2024-07-31"],
            ["FGHIJ5678K", "Rohan Verma", 7500, "2024-07-31"],
        ];
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
    link.download = `${reportId}_report.${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Generated",
      description: `A sample ${reportTitle} file has been downloaded.`,
    });
  };

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
            <Card key={report.id}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => handleGenerateReport(report.id, report.title)}>
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
