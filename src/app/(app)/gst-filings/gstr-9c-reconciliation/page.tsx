
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, Upload, GitCompareArrows, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Gstr9cPage() {
  const [auditedFinancials, setAuditedFinancials] = useState<File | null>(null);
  const [gstr9Data, setGstr9Data] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleReconcile = () => {
    if (!auditedFinancials || !gstr9Data) {
      toast({
        variant: "destructive",
        title: "Files Missing",
        description: "Please upload both audited financials and GSTR-9 data.",
      });
      return;
    }
    setIsLoading(true);
    // Simulate AI reconciliation process
    setTimeout(() => {
      setReport(
        "AI Reconciliation Report:\n\n1. Turnover Mismatch: Audited P&L shows turnover of Rs. 1.25 Cr, whereas GSTR-9 reports Rs. 1.22 Cr. Potential Reason: Unreconciled credit notes. Action: Review credit note register against GSTR-1 amendments.\n\n2. ITC Mismatch: ITC claimed in GSTR-9 (Rs. 18.5 Lacs) is higher than ITC as per books (Rs. 18.2 Lacs). Potential Reason: ITC on capital goods not capitalized correctly. Action: Review fixed asset register and corresponding invoices."
      );
      setIsLoading(false);
      toast({ title: "Reconciliation Complete" });
    }, 2000);
  };

  return (
    <div className="space-y-8">
        <Link href="/gst-filings" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to GST Filings
        </Link>
        <div className="text-center">
            <h1 className="text-3xl font-bold">GSTR-9C Reconciliation</h1>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                Reconcile your audited annual financial statements with your GSTR-9 annual return.
            </p>
        </div>

        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Upload Documents for Reconciliation</CardTitle>
                <CardDescription>
                    Provide your audited financials (in .xlsx format) and your GSTR-9 JSON or CSV file.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="audited-financials">Audited Financials (.xlsx)</Label>
                    <Input id="audited-financials" type="file" accept=".xlsx" onChange={e => setAuditedFinancials(e.target.files?.[0] || null)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="gstr9-data">GSTR-9 Data (.json, .csv)</Label>
                    <Input id="gstr9-data" type="file" accept=".json,.csv" onChange={e => setGstr9Data(e.target.files?.[0] || null)} />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleReconcile} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <GitCompareArrows className="mr-2"/>}
                    Run AI Reconciliation
                 </Button>
            </CardFooter>
        </Card>
        
        {report && (
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>AI-Generated Reconciliation Report</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Alert>
                        <Wand2 className="h-4 w-4" />
                        <AlertTitle>Preliminary Findings</AlertTitle>
                        <AlertDescription className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                            {report}
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        Note: This is a preliminary report. The final GSTR-9C must be certified by a Chartered Accountant or Cost Accountant.
                    </p>
                </CardFooter>
            </Card>
        )}
    </div>
  );
}
