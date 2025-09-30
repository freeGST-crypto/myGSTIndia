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
import { Calculator, Library } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type EntityType = "individual_new" | "individual_old" | "company" | "firm";

const taxSlabs = {
    individual_new: [
        { limit: 300000, rate: 0 },
        { limit: 600000, rate: 0.05 },
        { limit: 900000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 },
    ],
    individual_old: [
        { limit: 250000, rate: 0 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 },
    ],
    company: [{ limit: Infinity, rate: 0.25 }], // Assuming domestic company u/s 115BAA
    firm: [{ limit: Infinity, rate: 0.30 }],
};

export default function AdvanceTax() {
  const { toast } = useToast();
  const [estimatedIncome, setEstimatedIncome] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [taxLiability, setTaxLiability] = useState<number | null>(null);
  const [entityType, setEntityType] = useState<EntityType>("individual_new");

  const calculateTax = () => {
    if (estimatedIncome <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Input",
            description: "Please enter a valid estimated income.",
        });
        return;
    }
    
    const isIndividual = entityType.startsWith("individual");
    const taxableIncome = isIndividual ? estimatedIncome - deductions : estimatedIncome;
    
    if (taxableIncome <= 0) {
        setTaxLiability(0);
        return;
    }
    
    const slabs = taxSlabs[entityType];
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
          <CardDescription>Enter your estimated annual income, total deductions, and assessee type.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="entity-type">Type of Entity</Label>
                <Select value={entityType} onValueChange={(value) => setEntityType(value as EntityType)}>
                    <SelectTrigger id="entity-type">
                        <SelectValue placeholder="Select an entity type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="individual_new">Individual (New Regime)</SelectItem>
                        <SelectItem value="individual_old">Individual (Old Regime)</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="firm">Partnership Firm / LLP</SelectItem>
                    </SelectContent>
                </Select>
            </div>
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
            <Label htmlFor="deductions">Total Deductions (e.g., 80C)</Label>
            <Input
              id="deductions"
              type="number"
              placeholder="e.g., 150000"
              value={deductions || ""}
              onChange={(e) => setDeductions(Number(e.target.value))}
              disabled={!entityType.startsWith("individual")}
            />
             {!entityType.startsWith("individual") && <p className="text-xs text-muted-foreground">Deductions are generally not applicable for this entity type in this calculation.</p>}
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
                                <TableCell>Not less than {inst.amount / (taxLiability || 1) * 100}% of advance tax</TableCell>
                                <TableCell className="text-right font-mono">₹{inst.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Library/> Tax Slab Reference</CardTitle>
            <CardDescription>Quick reference for applicable tax rates (excluding cess).</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="individual_new">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="individual_new">Individual (New)</TabsTrigger>
                    <TabsTrigger value="individual_old">Individual (Old)</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="firm">Firm/LLP</TabsTrigger>
                </TabsList>
                <TabsContent value="individual_new" className="pt-4">
                    <Table>
                        <TableHeader><TableRow><TableHead>Income Slab</TableHead><TableHead className="text-right">Tax Rate</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell>Up to ₹3,00,000</TableCell><TableCell className="text-right">Nil</TableCell></TableRow>
                            <TableRow><TableCell>₹3,00,001 to ₹6,00,000</TableCell><TableCell className="text-right">5%</TableCell></TableRow>
                            <TableRow><TableCell>₹6,00,001 to ₹9,00,000</TableCell><TableCell className="text-right">10%</TableCell></TableRow>
                            <TableRow><TableCell>₹9,00,001 to ₹12,00,000</TableCell><TableCell className="text-right">15%</TableCell></TableRow>
                            <TableRow><TableCell>₹12,00,001 to ₹15,00,000</TableCell><TableCell className="text-right">20%</TableCell></TableRow>
                            <TableRow><TableCell>Above ₹15,00,000</TableCell><TableCell className="text-right">30%</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </TabsContent>
                 <TabsContent value="individual_old" className="pt-4">
                    <Table>
                        <TableHeader><TableRow><TableHead>Income Slab</TableHead><TableHead className="text-right">Tax Rate</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell>Up to ₹2,50,000</TableCell><TableCell className="text-right">Nil</TableCell></TableRow>
                            <TableRow><TableCell>₹2,50,001 to ₹5,00,000</TableCell><TableCell className="text-right">5%</TableCell></TableRow>
                            <TableRow><TableCell>₹5,00,001 to ₹10,00,000</TableCell><TableCell className="text-right">20%</TableCell></TableRow>
                            <TableRow><TableCell>Above ₹10,00,000</TableCell><TableCell className="text-right">30%</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </TabsContent>
                 <TabsContent value="company" className="pt-4">
                    <p>For domestic companies opting for section 115BAA, the tax rate is 22% (+ 10% surcharge and 4% cess). Other domestic companies are generally taxed at 25% or 30% depending on turnover. This calculator uses a flat 25% for estimation.</p>
                </TabsContent>
                 <TabsContent value="firm" className="pt-4">
                    <p>Partnership firms and Limited Liability Partnerships (LLPs) are taxed at a flat rate of 30% on their total income, plus a 4% Health and Education Cess.</p>
                </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Disclaimer: This calculator is for estimation purposes only. Surcharges and specific conditions may apply. Consult a tax professional for exact calculations.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
