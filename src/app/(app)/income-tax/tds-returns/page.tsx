
"use client";

import { useState, useMemo, useContext } from "react";
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
  TableFooter
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, IndianRupee } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AccountingContext } from "@/context/accounting-context";
import { format } from "date-fns";

const getFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        const startYear = currentYear - i;
        years.push(`${startYear}-${(startYear + 1).toString().slice(-2)}`);
    }
    return years;
};

const quarters = [
    { value: "q1", label: "Q1 (Apr-Jun)" },
    { value: "q2", label: "Q2 (Jul-Sep)" },
    { value: "q3", label: "Q3 (Oct-Dec)" },
    { value: "q4", label: "Q4 (Jan-Mar)" },
];

export default function TdsReturnsPage() {
  const [financialYear, setFinancialYear] = useState(getFinancialYears()[0]);
  const [quarter, setQuarter] = useState("q1");
  const { journalVouchers, loading } = useContext(AccountingContext)!;

  const tdsTransactions = useMemo(() => {
    // This is a simplified simulation. A real implementation would parse TDS details
    // from purchase and payment vouchers within the selected quarter.
    const purchaseTds = journalVouchers
        .filter(v => v && v.id && v.id.startsWith("BILL-") && v.narration?.toLowerCase().includes("tds"))
        .map(v => ({
            id: v.id,
            date: v.date,
            party: v.narration.split("from ")[1] || "N/A",
            amount: v.amount,
            tds: v.amount * 0.1, // Simulate 10% TDS
            section: "194J"
        }));

    const paymentTds = journalVouchers
        .filter(v => v && v.id && v.id.startsWith("PV-") && v.narration?.toLowerCase().includes("tds"))
         .map(v => ({
            id: v.id,
            date: v.date,
            party: v.narration.split("to ")[1] || "N/A",
            amount: v.amount,
            tds: v.amount * 0.01, // Simulate 1% TDS
            section: "194C"
        }));
    
    return [...purchaseTds, ...paymentTds];

  }, [journalVouchers, financialYear, quarter]);
  
  const totalTdsPayable = useMemo(() => tdsTransactions.reduce((acc, t) => acc + t.tds, 0), [tdsTransactions]);

  const handlePayNow = () => {
    window.open("https://eportal.incometax.gov.in/iec/foservices/#/e-pay-tax-prelogin/user-details", "_blank");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">TDS Returns</h1>
        <p className="text-muted-foreground">
          Prepare and manage your TDS returns for salary and non-salary payments.
        </p>
      </div>
      
       <Card>
            <CardHeader>
                <CardTitle>Select Filing Period</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Financial Year</label>
                    <Select value={financialYear} onValueChange={setFinancialYear}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{getFinancialYears().map(fy => <SelectItem key={fy} value={fy}>{fy}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Quarter</label>
                    <Select value={quarter} onValueChange={setQuarter}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{quarters.map(q => <SelectItem key={q.value} value={q.label}>{q.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <StatCard 
            title="Total TDS Payable for the Quarter"
            value={`₹${totalTdsPayable.toLocaleString('en-IN')}`}
            icon={IndianRupee}
            description="Consolidated from salary, vendor payments, and purchase bills."
            loading={loading}
        />

        <Tabs defaultValue="26q">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
                <TabsTrigger value="24q">Form 24Q (Salary)</TabsTrigger>
                <TabsTrigger value="26q">Form 26Q (Non-Salary)</TabsTrigger>
                <TabsTrigger value="27q">Form 27Q (Non-Resident)</TabsTrigger>
            </TabsList>

            <TabsContent value="26q">
                 <Card>
                    <CardHeader>
                        <CardTitle>Form 26Q Details</CardTitle>
                        <CardDescription>TDS deducted on payments to resident vendors and suppliers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Party Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead className="text-right">Transaction Amount</TableHead>
                                    <TableHead className="text-right">TDS Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tdsTransactions.length > 0 ? tdsTransactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{tx.party}</TableCell>
                                        <TableCell>{format(new Date(tx.date), "dd-MM-yyyy")}</TableCell>
                                        <TableCell>{tx.section}</TableCell>
                                        <TableCell className="text-right">₹{tx.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">₹{tx.tds.toLocaleString()}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No TDS transactions found for this period.</TableCell></TableRow>
                                )}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell colSpan={4} className="text-right">Total TDS for 26Q</TableCell>
                                    <TableCell className="text-right">₹{totalTdsPayable.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Button onClick={handlePayNow}><IndianRupee className="mr-2"/>Pay TDS (Challan 281)</Button>
                        <Button variant="outline"><FileJson className="mr-2"/>Generate FVU File</Button>
                    </CardFooter>
                 </Card>
            </TabsContent>
            {/* Other tabs can be implemented similarly */}
            <TabsContent value="24q">
                 <Card><CardContent className="p-10 text-center text-muted-foreground">Form 24Q (Salary TDS) will be populated from the Payroll module.</CardContent></Card>
            </TabsContent>
            <TabsContent value="27q">
                 <Card><CardContent className="p-10 text-center text-muted-foreground">Form 27Q (Non-Resident TDS) details will appear here.</CardContent></Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
