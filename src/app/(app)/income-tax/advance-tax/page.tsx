
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IndianRupee, Calculator, FileText, TrendingUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AccountingContext } from "@/context/accounting-context";
import { allAccounts } from "@/lib/accounts";

const taxSlabs = [
  { limit: 300000, rate: 0, description: "Up to ₹3,00,000" },
  { limit: 600000, rate: 0.05, description: "₹3,00,001 to ₹6,00,000" },
  { limit: 900000, rate: 0.10, description: "₹6,00,001 to ₹9,00,000" },
  { limit: 1200000, rate: 0.15, description: "₹9,00,001 to ₹12,00,000" },
  { limit: 1500000, rate: 0.20, description: "₹12,00,001 to ₹15,00,000" },
  { limit: Infinity, rate: 0.30, description: "Above ₹15,00,000" },
];

export default function AdvanceTaxCalculatorPage() {
  const { toast } = useToast();
  const { journalVouchers, loading } = useContext(AccountingContext)!;
  
  const currentPbt = useMemo(() => {
    const balances: Record<string, number> = {};
    allAccounts.forEach(acc => { balances[acc.code] = 0; });
    journalVouchers.forEach(v => v.lines.forEach(l => {
      if (!balances.hasOwnProperty(l.account)) balances[l.account] = 0;
      balances[l.account] += (parseFloat(l.debit) - parseFloat(l.credit));
    }));
    
    const revenue = allAccounts.filter(a => a.type === 'Revenue' || a.type === 'Other Income').reduce((sum, acc) => sum - balances[acc.code], 0);
    const expenses = allAccounts.filter(a => a.type === 'Expense' || a.type === 'Cost of Goods Sold').reduce((sum, acc) => sum + balances[acc.code], 0);
    
    return revenue - expenses;
  }, [journalVouchers]);

  const [estimatedProfit, setEstimatedProfit] = useState(0);
  const [adjustments, setAdjustments] = useState(0);
  const [advanceTax, setAdvanceTax] = useState({
    total: 0,
    installments: [
      { date: "June 15", amount: 0, percentage: 15 },
      { date: "September 15", amount: 0, percentage: 45 },
      { date: "December 15", amount: 0, percentage: 75 },
      { date: "March 15", amount: 0, percentage: 100 },
    ],
  });
  
  // Effect to update estimated profit when current PBT from books changes
  useState(() => {
    setEstimatedProfit(currentPbt > 0 ? currentPbt : 0);
  });

  const calculateTax = () => {
    const taxableIncome = estimatedProfit + adjustments;
    if (taxableIncome <= 0) {
      setAdvanceTax({ total: 0, installments: advanceTax.installments.map(i => ({...i, amount: 0})) });
      toast({ title: "No Tax Liability", description: "Estimated income is not in the taxable range."});
      return;
    }

    let tax = 0;
    let remainingIncome = taxableIncome;
    let lastLimit = 0;

    for (const slab of taxSlabs) {
      if (remainingIncome > 0 && slab.limit > lastLimit) {
        const taxableInSlab = Math.min(remainingIncome, slab.limit - lastLimit);
        tax += taxableInSlab * slab.rate;
        remainingIncome -= taxableInSlab;
        lastLimit = slab.limit;
      }
    }
    
    // Add health and education cess
    const healthAndEducationCess = tax * 0.04;
    const totalTax = tax + healthAndEducationCess;

    setAdvanceTax({
      total: totalTax,
      installments: advanceTax.installments.map(inst => ({
        ...inst,
        amount: (totalTax * inst.percentage) / 100,
      })),
    });

    toast({
      title: "Tax Liability Calculated",
      description: "Advance tax installments have been computed.",
    });
  };

  const handlePayNow = () => {
    window.open("https://eportal.incometax.gov.in/iec/foservices/#/e-pay-tax-prelogin/user-details", "_blank");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Advance Tax Calculator</h1>
        <p className="text-muted-foreground">
          Estimate your advance tax liability for the current financial year.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Estimation</CardTitle>
          <CardDescription>Profit from your books is pre-filled. Adjust it to project for the full year.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp/> Current Profit from Books</p>
                <p className="text-2xl font-bold">{currentPbt.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
              </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profit">Estimated Annual Profit Before Tax (₹)</Label>
              <Input
                id="profit"
                type="number"
                value={estimatedProfit}
                onChange={(e) => setEstimatedProfit(Number(e.target.value))}
                placeholder="Projected profit for the full year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustments">Adjustments (₹)</Label>
              <Input
                id="adjustments"
                type="number"
                value={adjustments}
                onChange={(e) => setAdjustments(Number(e.target.value))}
                placeholder="e.g., Disallowed expenses, other income"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={calculateTax}>
            <Calculator className="mr-2" />
            Calculate Advance Tax
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Advance Tax Liability</CardTitle>
          <CardDescription>
            Based on your estimates, here is your advance tax installment schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground">Total Estimated Tax for the Year</p>
                <p className="text-4xl font-bold font-mono">₹{advanceTax.total.toLocaleString('en-IN')}</p>
            </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advanceTax.installments.map((inst, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Due by {inst.date}</p>
                <p className="font-bold text-lg">₹{inst.amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">({inst.percentage}% of total)</p>
              </div>
            ))}
          </div>
           <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>How to Pay</AlertTitle>
            <AlertDescription>
                You can pay your advance tax using Challan ITNS 280 on the official Income Tax portal.
                Click the button below to go to the payment page.
            </AlertDescription>
          </Alert>
           <Alert variant="default" className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Calculation Logic Used</AlertTitle>
            <AlertDescription>
              The calculation is based on the New Tax Regime slabs and includes a 4% Health & Education Cess. The slabs are:
              <ul className="list-disc pl-5 mt-2">
                {taxSlabs.map(slab => <li key={slab.description}>{slab.description}: {slab.rate * 100}%</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
            <Button onClick={handlePayNow}>
                <IndianRupee className="mr-2"/>
                Pay Advance Tax (Challan 280)
            </Button>
        </CardFooter>
      </Card>

    </div>
  );
}
