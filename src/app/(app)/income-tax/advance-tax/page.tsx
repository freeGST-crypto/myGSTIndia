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
import { Calculator } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const taxSlabs = {
    new: [
        { limit: 300000, rate: 0 },
        { limit: 600000, rate: 0.05 },
        { limit: 900000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 },
    ],
    old: [
        { limit: 250000, rate: 0 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 },
    ],
};

export default function AdvanceTax() {
  const { toast } = useToast();
  const [estimatedIncome, setEstimatedIncome] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [taxLiability, setTaxLiability] = useState<number | null>(null);

  const calculateTax = () => {
    if (estimatedIncome <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Input",
            description: "Please enter a valid estimated income.",
        });
        return;
    }

    const taxableIncome = estimatedIncome - deductions;
    if (taxableIncome <= 0) {
        setTaxLiability(0);
        return;
    }
    
    // For simplicity, we'll use the new tax regime. A real app would allow regime selection.
    const slabs = taxSlabs.new;
    let tax = 0;
    let remainingIncome = taxableIncome;
    let previousLimit = 0;

    for (const slab of slabs) {
        if (remainingIncome > 0) {
            const taxableInSlab = Math.min(remainingIncome, slab.limit - previousLimit);
            tax += taxableInSlab * slab.rate;
            remainingIncome -= taxableInSlab;
            previousLimit = slab.limit;
        }
    }
    
    // Health and Education Cess @ 4%
    const totalTax = tax * 1.04;
    setTaxLiability(totalTax);

    toast({
        title: "Tax Calculated",
        description: `Your estimated tax liability is ₹${totalTax.toFixed(2)}.`
    });
  };

  const installments = taxLiability !== null ? [
      { due: "15th June", amount: taxLiability * 0.15 },
      { due: "15th September", amount: taxLiability * 0.45 },
      { due: "15th December", amount: taxLiability * 0.75 },
      { due: "15th March", amount: taxLiability * 1.00 },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Advance Tax Calculator</h1>
        <p className="text-muted-foreground">
          Estimate and plan your advance tax payments for the financial year.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income & Deductions</CardTitle>
          <CardDescription>Enter your estimated annual income and total deductions.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="income">Estimated Annual Income (₹)</Label>
            <Input
              id="income"
              type="number"
              placeholder="e.g., 1500000"
              value={estimatedIncome || ""}
              onChange={(e) => setEstimatedIncome(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deductions">Total Deductions (e.g., 80C) (₹)</Label>
            <Input
              id="deductions"
              type="number"
              placeholder="e.g., 150000"
              value={deductions || ""}
              onChange={(e) => setDeductions(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={calculateTax}>
            <Calculator className="mr-2" />
            Calculate Tax Liability
          </Button>
        </CardFooter>
      </Card>
      
      {taxLiability !== null && (
          <Card>
              <CardHeader>
                  <CardTitle>Advance Tax Installments</CardTitle>
                  <CardDescription>
                    Your estimated total tax liability is <strong>₹{taxLiability.toFixed(2)}</strong>.
                    Below are the installment due dates and cumulative amounts to be paid.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Installment Percentage</TableHead>
                            <TableHead className="text-right">Cumulative Amount Payable</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {installments.map(inst => (
                             <TableRow key={inst.due}>
                                <TableCell className="font-medium">{inst.due}</TableCell>
                                <TableCell>Not less than {inst.amount / taxLiability * 100}% of advance tax</TableCell>
                                <TableCell className="text-right font-mono">₹{inst.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
