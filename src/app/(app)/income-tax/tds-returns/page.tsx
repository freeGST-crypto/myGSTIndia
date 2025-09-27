
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

  const tcsTransactions = useMemo(() => {
     return journalVouchers
        .filter(v => v && v.id && v.lines && v.id.startsWith("INV-") && v.lines.some(l => l.account === '2423'))
        .map(v => {
            const tcsLine = v.lines.find(l => l.account === '2423');
            return {
                id: v.id,
                date: v.date,
                party: v.narration.split(" to ")[1] || "N/A",
                amount: v.amount,
                tcs: parseFloat(tcsLine?.credit || '0'),
                section: "206C(1H)"
            };
        });
  }, [journalVouchers, financialYear, quarter]);

  
  const totalTdsPayable = useMemo(() => tdsTransactions.reduce((acc, t) => acc + t.tds, 0), [tdsTransactions]);
  const totalTcsPayable = useMemo(() => tcsTransactions.reduce((acc, t) => acc + t.tcs, 0), [tcsTransactions]);


  const handlePayNow = (type: 'TDS' | 'TCS') => {
    const challan = type === 'TDS' ? '281' : '281'; // TCS also uses 281 for corporate/non-corporate deductees
    window.open("https://eportal.incometax.gov.in/iec/foservices/#/e-pay-tax-prelogin/user-details", "_blank");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">TDS &amp; TCS Returns</h1>
        <p className="text-muted-foreground">
          Prepare and manage your TDS/TCS returns.
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
        
         <div className="grid md:grid-cols-2 gap-4">
            <StatCard 
                title="Total TDS Payable for the Quarter"
                value={`₹${totalTdsPayable.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                loading={loading}
            />
             <StatCard 
                title="Total TCS Payable for the Quarter"
                value={`₹${totalTcsPayable.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                loading={loading}
            />
        </div>

        <Tabs defaultValue="tds">
            <TabsList className="grid w-full grid-cols-2 max-w-lg">
                <TabsTrigger value="tds">TDS Returns (24Q, 26Q, 27Q)</TabsTrigger>
                <TabsTrigger value="tcs">TCS Return (27EQ)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tds" className="space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Form 26Q Details (Non-Salary)</CardTitle>
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
                 </Card>
                 <Card>
                    <CardHeader><CardTitle>Other TDS Forms</CardTitle></CardHeader>
                    <CardContent className="text-center text-muted-foreground p-10">
                        <p>Form 24Q (Salary TDS) will be populated from the Payroll module.</p>
                        <p>Form 27Q (Non-Resident TDS) will be populated from payments to non-resident vendors.</p>
                    </CardContent>
                     <CardFooter className="justify-end gap-2">
                        <Button onClick={() => handlePayNow('TDS')}><IndianRupee className="mr-2"/>Pay TDS (Challan 281)</Button>
                        <Button variant="outline"><FileJson className="mr-2"/>Generate FVU File</Button>
                    </CardFooter>
                 </Card>
            </TabsContent>
            
            <TabsContent value="tcs">
                 <Card>
                    <CardHeader>
                        <CardTitle>Form 27EQ Details</CardTitle>
                        <CardDescription>TCS collected on sale of goods.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Party Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead className="text-right">Transaction Amount</TableHead>
                                    <TableHead className="text-right">TCS Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tcsTransactions.length > 0 ? tcsTransactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{tx.party}</TableCell>
                                        <TableCell>{format(new Date(tx.date), "dd-MM-yyyy")}</TableCell>
                                        <TableCell>{tx.section}</TableCell>
                                        <TableCell className="text-right">₹{tx.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">₹{tx.tcs.toLocaleString()}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No TCS transactions found for this period.</TableCell></TableRow>
                                )}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell colSpan={4} className="text-right">Total TCS for 27EQ</TableCell>
                                    <TableCell className="text-right">₹{totalTcsPayable.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Button onClick={() => handlePayNow('TCS')}><IndianRupee className="mr-2"/>Pay TCS (Challan 281)</Button>
                        <Button variant="outline"><FileJson className="mr-2"/>Generate FVU File</Button>
                    </CardFooter>
                 </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

    