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
import { FileDown, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

// Generates a list of financial years
const getFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        const startYear = currentYear - i;
        years.push(`${startYear}-${startYear + 1}`);
    }
    return years;
};


export default function TdsReturns() {
  const [financialYear, setFinancialYear] = useState(getFinancialYears()[0]);
  const [formType, setFormType] = useState("26q");
  const [quarter, setQuarter] = useState("q1");

  const getReturnStatus = () => {
    // This is a placeholder. In a real app, you'd fetch this from a database.
    if (financialYear === getFinancialYears()[0] && (quarter === "q1" || quarter === "q2")) {
      return { status: "Filed", filedOn: "2024-07-31" };
    }
    return { status: "Due", filedOn: "Not Applicable" };
  };
  
  const returnStatus = getReturnStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">TDS & TCS Returns</h1>
        <p className="text-muted-foreground">
          Prepare, review, and download your TDS/TCS returns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Filing Status</CardTitle>
          <CardDescription>Select the return type and period to check status or prepare a new return.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Financial Year</label>
            <Select value={financialYear} onValueChange={setFinancialYear}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {financialYears.map(fy => <SelectItem key={fy} value={fy}>{fy}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Form Type</label>
            <Select value={formType} onValueChange={setFormType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="26q">Form 26Q (TDS on payments other than salary)</SelectItem>
                <SelectItem value="24q">Form 24Q (TDS on salary)</SelectItem>
                 <SelectItem value="27q">Form 27Q (TDS on payments to non-residents)</SelectItem>
                 <SelectItem value="27eq">Form 27EQ (TCS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quarter</label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="q1">Q1 (Apr-Jun)</SelectItem>
                <SelectItem value="q2">Q2 (Jul-Sep)</SelectItem>
                <SelectItem value="q3">Q3 (Oct-Dec)</SelectItem>
                <SelectItem value="q4">Q4 (Jan-Mar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Return for {quarter.toUpperCase()}, {financialYear}</CardTitle>
          <CardDescription>Form {formType.toUpperCase()}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-6 border rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className={`text-2xl font-bold ${returnStatus.status === 'Filed' ? 'text-green-600' : 'text-orange-500'}`}>{returnStatus.status}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Filed On</p>
                    <p className="text-lg font-medium">{returnStatus.filedOn}</p>
                </div>
                 <div className="flex gap-2">
                    <Link href="/income-tax/tds-tcs-reports">
                        <Button variant="outline">View Report</Button>
                    </Link>
                    <Button><FileSpreadsheet className="mr-2"/> Prepare Return</Button>
                 </div>
            </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                This utility helps you prepare the return data. You will need to use a filing utility to upload the final FVU file to the income tax portal.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
