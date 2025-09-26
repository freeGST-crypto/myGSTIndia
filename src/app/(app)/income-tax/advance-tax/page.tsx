
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IndianRupee, Calculator, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const taxSlabs = [
  { limit: 300000, rate: 0 },
  { limit: 600000, rate: 0.05 },
  { limit: 900000, rate: 0.10 },
  { limit: 1200000, rate: 0.15 },
  { limit: 1500000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
];

export default function AdvanceTaxCalculatorPage() {
  const { toast } = useToast();
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

  const calculateTax = () => {
    const taxableIncome = estimatedProfit + adjustments;
    if (taxableIncome <= 0) {
      setAdvanceTax({ total: 0, installments: advanceTax.installments.map(i => ({...i, amount: 0})) });
      return;
    }

    let tax = 0;
    let remainingIncome = taxableIncome;
    let lastLimit = 0;

    for (const slab of taxSlabs) {
      if (remainingIncome > 0) {
        const taxableInSlab = Math.min(remainingIncome, slab.limit - lastLimit);
        tax += taxableInSlab * slab.rate;
        remainingIncome -= taxableInSlab;
        lastLimit = slab.limit;
      }
    }
    
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profit">Estimated Profit Before Tax (₹)</Label>
              <Input
                id="profit"
                type="number"
                value={estimatedProfit}
                onChange={(e) => setEstimatedProfit(Number(e.target.value))}
                placeholder="From your P&L projections"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustments">Adjustments (₹)</Label>
              <Input
                id="adjustments"
                type="number"
                value={adjustments}
                onChange={(e) => setAdjustments(Number(e.target.value))}
                placeholder="e.g., Disallowed expenses"
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
