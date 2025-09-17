
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDown } from "lucide-react";

const sampleTdsReportData = [
  {
    deductee: "Global Tech Inc.",
    pan: "ABCDE1234F",
    invoiceId: "INV-001",
    invoiceDate: "2024-05-15",
    invoiceAmount: 25000.0,
    tdsSection: "194J",
    tdsRate: 10,
    tdsAmount: 2500.0,
  },
  {
    deductee: "Innovate Solutions",
    pan: "FGHIJ5678K",
    invoiceId: "INV-002",
    invoiceDate: "2024-05-20",
    invoiceAmount: 15000.0,
    tdsSection: "194C",
    tdsRate: 1,
    tdsAmount: 150.0,
  },
];

export default function TdsTcsReportsPage() {
  const [reportType, setReportType] = useState("tds");
  const [period, setPeriod] = useState("monthly");
  const [month, setMonth] = useState("2024-05");
  const [quarter, setQuarter] = useState("q1");

  const generateReport = () => {
    console.log("Generating report with settings:", { reportType, period, month, quarter });
    // In a real app, this would trigger a data fetch and report generation
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">TDS/TCS Reports</h1>
        <p className="text-muted-foreground">
          Generate reports for TDS deducted on payments and TCS collected on sales.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Generation</CardTitle>
          <CardDescription>Select the report parameters to generate your report.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tds">TDS Report</SelectItem>
                <SelectItem value="tcs">TCS Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Period</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {period === 'monthly' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-04">April 2024</SelectItem>
                  <SelectItem value="2024-05">May 2024</SelectItem>
                  <SelectItem value="2024-06">June 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {period === 'quarterly' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Quarter</label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">Apr-Jun</SelectItem>
                  <SelectItem value="q2">Jul-Sep</SelectItem>
                  <SelectItem value="q3">Oct-Dec</SelectItem>
                  <SelectItem value="q4">Jan-Mar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={generateReport}>Generate Report</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{reportType.toUpperCase()} Report for {period === 'monthly' ? month : quarter.toUpperCase()}</CardTitle>
            <CardDescription>A summary of tax deducted/collected for the selected period.</CardDescription>
          </div>
          <Button variant="outline">
            <FileDown className="mr-2" />
            Export Report
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deductee/Collectee</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead className="text-right">Invoice Amount</TableHead>
                <TableHead>TDS/TCS Section</TableHead>
                <TableHead className="text-right">Rate (%)</TableHead>
                <TableHead className="text-right">Tax Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleTdsReportData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.deductee}</TableCell>
                  <TableCell>{row.pan}</TableCell>
                  <TableCell>{row.invoiceId}</TableCell>
                  <TableCell>{row.invoiceDate}</TableCell>
                  <TableCell className="text-right">₹{row.invoiceAmount.toFixed(2)}</TableCell>
                  <TableCell>{row.tdsSection}</TableCell>
                  <TableCell className="text-right">{row.tdsRate}%</TableCell>
                  <TableCell className="text-right">₹{row.tdsAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
