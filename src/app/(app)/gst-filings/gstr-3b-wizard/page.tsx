
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
import { ArrowLeft, ArrowRight, Save, CircleDollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const initialStep1Data = [
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

const initialStep2Data = [
    {
        placeOfSupply: "Maharashtra",
        taxableValue: 120000.00,
        integratedTax: 21600.00,
    },
    {
        placeOfSupply: "Karnataka",
        taxableValue: 85000.00,
        integratedTax: 15300.00,
    }
];

const initialStep3Data = {
    importGoods: { igst: 15000, cess: 0 },
    importServices: { igst: 8000, cess: 0 },
    inwardReverseCharge: { igst: 1440, cgst: 0, sgst: 0, cess: 0 },
    inwardISD: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
    allOtherITC: { igst: 25000, cgst: 12000, sgst: 12000, cess: 500 },
    rule42_43: { igst: 800, cgst: 200, sgst: 200, cess: 0 },
    othersReversed: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
};

const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function Gstr3bWizardPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const [step1Data, setStep1Data] = useState(initialStep1Data);
  const handleStep1Change = (index: number, field: keyof typeof step1Data[0], value: string) => {
    const newData = [...step1Data];
    (newData[index] as any)[field] = parseFloat(value) || 0;
    setStep1Data(newData);
  };

  const [step2Data, setStep2Data] = useState(initialStep2Data);
  const handleStep2Change = (index: number, field: keyof typeof step2Data[0], value: string) => {
    const newData = [...step2Data];
    (newData[index] as any)[field] = value; // Can be string (for state) or number
    if (field !== 'placeOfSupply') {
        (newData[index] as any)[field] = parseFloat(value) || 0;
    }
    setStep2Data(newData);
  };
  const addStep2Row = () => setStep2Data([...step2Data, { placeOfSupply: "", taxableValue: 0, integratedTax: 0 }]);

  const [step3Data, setStep3Data] = useState(initialStep3Data);
  const handleStep3Change = (section: keyof typeof step3Data, field: 'igst' | 'cgst' | 'sgst' | 'cess', value: string) => {
      const newData = {...step3Data};
      (newData[section] as any)[field] = parseFloat(value) || 0;
      setStep3Data(newData);
  }


  const handleNext = () => {
    toast({
      title: `Step ${step} Saved!`,
      description: `Moving to Step ${step + 1}.`,
    });
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
     setStep(prev => prev - 1);
  };
  
  const handleProceedToPayment = () => {
      toast({
          title: "GSTR-3B Saved!",
          description: "Proceeding to tax payment calculation (not yet implemented)."
      })
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
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
                  {step1Data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Label className="font-normal">{row.description}</Label>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={row.taxableValue}
                          onChange={(e) => handleStep1Change(index, 'taxableValue', e.target.value)}
                        />
                      </TableCell>
                       <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={row.integratedTax}
                          onChange={(e) => handleStep1Change(index, 'integratedTax', e.target.value)}
                        />
                      </TableCell>
                       <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={row.centralTax}
                           onChange={(e) => handleStep1Change(index, 'centralTax', e.target.value)}
                        />
                      </TableCell>
                       <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={row.stateTax}
                           onChange={(e) => handleStep1Change(index, 'stateTax', e.target.value)}
                        />
                      </TableCell>
                       <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={row.cess}
                           onChange={(e) => handleStep1Change(index, 'cess', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleNext}>
                    Save & Continue
                    <ArrowRight className="ml-2" />
                </Button>
            </CardFooter>
          </Card>
        );
        case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Inter-state Supplies</CardTitle>
              <CardDescription>
                Table 3.2: Of the supplies shown in 3.1 (a) above, details of inter-State supplies made to unregistered persons, composition taxable persons and UIN holders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Place of Supply (State/UT)</TableHead>
                    <TableHead className="text-right">Total Taxable Value</TableHead>
                    <TableHead className="text-right">Amount of Integrated Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {step2Data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select value={row.placeOfSupply} onValueChange={(value) => handleStep2Change(index, 'placeOfSupply', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a State/UT"/>
                            </SelectTrigger>
                            <SelectContent>
                                {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={row.taxableValue}
                          onChange={(e) => handleStep2Change(index, 'taxableValue', e.target.value)}
                        />
                      </TableCell>
                       <TableCell>
                        <Input
                          type="number"
                          className="text-right"
                          value={row.integratedTax}
                          onChange={(e) => handleStep2Change(index, 'integratedTax', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-4" onClick={addStep2Row}>Add Row</Button>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2" /> Back
                </Button>
                <Button onClick={handleNext}>
                    Save & Continue
                    <ArrowRight className="ml-2" />
                </Button>
            </CardFooter>
          </Card>
        );
        case 3:
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Eligible ITC</CardTitle>
                        <CardDescription>Table 4: Details of Eligible Input Tax Credit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/2">Details</TableHead>
                                    <TableHead className="text-right">Integrated Tax</TableHead>
                                    <TableHead className="text-right">Central Tax</TableHead>
                                    <TableHead className="text-right">State/UT Tax</TableHead>
                                    <TableHead className="text-right">Cess</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="bg-muted/50"><TableCell colSpan={5} className="font-bold"> (A) ITC Available (whether in full or part)</TableCell></TableRow>
                                <TableRow><TableCell>(1) Import of goods</TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.importGoods.igst} onChange={(e) => handleStep3Change('importGoods', 'igst', e.target.value)} /></TableCell>
                                    <TableCell colSpan={2} className="bg-muted"></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.importGoods.cess} onChange={(e) => handleStep3Change('importGoods', 'cess', e.target.value)} /></TableCell>
                                </TableRow>
                                 <TableRow><TableCell>(2) Import of services</TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.importServices.igst} onChange={(e) => handleStep3Change('importServices', 'igst', e.target.value)} /></TableCell>
                                     <TableCell colSpan={2} className="bg-muted"></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.importServices.cess} onChange={(e) => handleStep3Change('importServices', 'cess', e.target.value)}/></TableCell>
                                </TableRow>
                                <TableRow><TableCell>(3) Inward supplies liable to reverse charge (other than 1 & 2 above)</TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardReverseCharge.igst} onChange={(e) => handleStep3Change('inwardReverseCharge', 'igst', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardReverseCharge.cgst} onChange={(e) => handleStep3Change('inwardReverseCharge', 'cgst', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardReverseCharge.sgst} onChange={(e) => handleStep3Change('inwardReverseCharge', 'sgst', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardReverseCharge.cess} onChange={(e) => handleStep3Change('inwardReverseCharge', 'cess', e.target.value)} /></TableCell>
                                </TableRow>
                                <TableRow><TableCell>(4) Inward supplies from ISD</TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardISD.igst} onChange={(e) => handleStep3Change('inwardISD', 'igst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardISD.cgst} onChange={(e) => handleStep3Change('inwardISD', 'cgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardISD.sgst} onChange={(e) => handleStep3Change('inwardISD', 'sgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.inwardISD.cess} onChange={(e) => handleStep3Change('inwardISD', 'cess', e.target.value)}/></TableCell>
                                </TableRow>
                                <TableRow><TableCell>(5) All other ITC</TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.allOtherITC.igst} onChange={(e) => handleStep3Change('allOtherITC', 'igst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.allOtherITC.cgst} onChange={(e) => handleStep3Change('allOtherITC', 'cgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.allOtherITC.sgst} onChange={(e) => handleStep3Change('allOtherITC', 'sgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.allOtherITC.cess} onChange={(e) => handleStep3Change('allOtherITC', 'cess', e.target.value)}/></TableCell>
                                </TableRow>

                                <TableRow className="bg-muted/50"><TableCell colSpan={5} className="font-bold">(B) ITC Reversed</TableCell></TableRow>
                                <TableRow><TableCell>(1) As per rules 42 & 43 of CGST Rules</TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.rule42_43.igst} onChange={(e) => handleStep3Change('rule42_43', 'igst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.rule42_43.cgst} onChange={(e) => handleStep3Change('rule42_43', 'cgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.rule42_43.sgst} onChange={(e) => handleStep3Change('rule42_43', 'sgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.rule42_43.cess} onChange={(e) => handleStep3Change('rule42_43', 'cess', e.target.value)}/></TableCell>
                                </TableRow>
                                <TableRow><TableCell>(2) Others</TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.othersReversed.igst} onChange={(e) => handleStep3Change('othersReversed', 'igst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.othersReversed.cgst} onChange={(e) => handleStep3Change('othersReversed', 'cgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.othersReversed.sgst} onChange={(e) => handleStep3Change('othersReversed', 'sgst', e.target.value)}/></TableCell>
                                    <TableCell><Input type="number" className="text-right" value={step3Data.othersReversed.cess} onChange={(e) => handleStep3Change('othersReversed', 'cess', e.target.value)}/></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2" /> Back
                        </Button>
                        <Button onClick={handleNext}>
                            Save & Continue
                            <ArrowRight className="ml-2" />
                        </Button>
                    </CardFooter>
                </Card>
            );
        case 4:
            return (
                <Card>
                     <CardHeader>
                        <CardTitle>Step 4: Confirm and Proceed</CardTitle>
                        <CardDescription>
                           You are about to finalize your GSTR-3B data. The next step is to calculate tax payment and file the return.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Final Check</AlertTitle>
                            <AlertDescription>
                                Please review all the data entered in the previous steps carefully. Once you proceed to payment, you cannot edit these details. This action is not yet implemented.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2" /> Back
                        </Button>
                        <Button onClick={handleProceedToPayment}>
                           <CircleDollarSign className="mr-2" />
                           Proceed to Payment
                        </Button>
                    </CardFooter>
                </Card>
            );
      default:
        return null;
    }
  }

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

      {renderStep()}
    </div>
  );
}

