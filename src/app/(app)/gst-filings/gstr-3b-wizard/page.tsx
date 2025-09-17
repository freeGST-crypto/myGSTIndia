
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const initialData = [
  {
    description: "(a) Outward taxable supplies (other than zero rated, nil rated and exempted)",
    taxableValue: 525000.00,
    integratedTax: 94500.00,
    centralTax: 0,
    stateTax: 0,
    cess: 0,
  },
  {
    description: "(b) Outward taxable supplies (zero rated)",
    taxableValue: 50000.00,
    integratedTax: 0,
    centralTax: 0,
    stateTax: 0,
    cess: 0,
  },
  {
    description: "(c) Other outward supplies (nil rated, exempted)",
    taxableValue: 12000.00,
    integratedTax: 0,
    centralTax: 0,
    stateTax: 0,
    cess: 0,
  },
  {
    description: "(d) Inward supplies (liable to reverse charge)",
    taxableValue: 8000.00,
    integratedTax: 1440.00,
    centralTax: 0,
    stateTax: 0,
    cess: 0,
  },
  {
    description: "(e) Non-GST outward supplies",
    taxableValue: 0,
    integratedTax: 0,
    centralTax: 0,
    stateTax: 0,
    cess: 0,
  },
];

export default function Gstr3bWizardPage() {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);

  const handleInputChange = (index: number, field: keyof typeof data[0], value: string) => {
    const newData = [...data];
    (newData[index] as any)[field] = parseFloat(value) || 0;
    setData(newData);
  };

  const handleSaveAndContinue = () => {
    // In a real app, this would save the data and move to the next step
    toast({
      title: "Step 1 Saved!",
      description: "Moving to Step 2: Inter-state supplies (not yet implemented).",
    });
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <Link href="/gst-filings" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2" />
            Back to GST Filings
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">GSTR-3B Filing Wizard</h1>
          <p className="text-muted-foreground">Period: May 2024</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Outward and Inward Supplies</CardTitle>
          <CardDescription>
            Table 3.1: Details of Outward Supplies and inward supplies liable to reverse charge.
            <br />
            Review the auto-populated data and make any necessary adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Nature of Supplies</TableHead>
                <TableHead className="text-right">Total Taxable Value</TableHead>
                <TableHead className="text-right">Integrated Tax</TableHead>
                <TableHead className="text-right">Central Tax</TableHead>
                <TableHead className="text-right">State/UT Tax</TableHead>
                <TableHead className="text-right">Cess</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Label className="font-normal">{row.description}</Label>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="text-right"
                      value={row.taxableValue}
                      onChange={(e) => handleInputChange(index, 'taxableValue', e.target.value)}
                    />
                  </TableCell>
                   <TableCell>
                    <Input
                      type="number"
                      className="text-right"
                      value={row.integratedTax}
                      onChange={(e) => handleInputChange(index, 'integratedTax', e.target.value)}
                    />
                  </TableCell>
                   <TableCell>
                    <Input
                      type="number"
                      className="text-right"
                      value={row.centralTax}
                       onChange={(e) => handleInputChange(index, 'centralTax', e.target.value)}
                    />
                  </TableCell>
                   <TableCell>
                    <Input
                      type="number"
                      className="text-right"
                      value={row.stateTax}
                       onChange={(e) => handleInputChange(index, 'stateTax', e.target.value)}
                    />
                  </TableCell>
                   <TableCell>
                    <Input
                      type="number"
                      className="text-right"
                      value={row.cess}
                       onChange={(e) => handleInputChange(index, 'cess', e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleSaveAndContinue}>
                <Save className="mr-2" />
                Save & Continue
                <ArrowRight className="ml-2" />
            </Button>
        </CardFooter>
      </Card>>
    </div>
  );
}
