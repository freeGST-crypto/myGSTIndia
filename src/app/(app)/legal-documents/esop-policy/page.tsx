
"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Printer, PlusCircle, Trash2, Check, UserCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useReactToPrint } from "react-to-print";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  designation: z.string(),
  department: z.string(),
  employeeType: z.enum(["Full-time", "Part-time", "Consultant"]),
  isSelected: z.boolean().default(false),
});

const grantSchema = z.object({
  employeeId: z.string(),
  optionsGranted: z.coerce.number().positive(),
  exercisePrice: z.coerce.number().min(0),
  grantDate: z.string().refine((val) => !isNaN(Date.parse(val))),
});

const formSchema = z.object({
    employees: z.array(employeeSchema),
    grants: z.array(grantSchema),
    vestingStartDate: z.string().refine((val) => !isNaN(Date.parse(val))),
    vestingPeriodYears: z.coerce.number().positive().default(4),
    vestingCliffMonths: z.coerce.number().min(0).default(12),
    vestingFrequency: z.enum(["Monthly", "Quarterly", "Annually"]).default("Quarterly"),
    exerciseWindowYears: z.coerce.number().positive().default(5),
});

type FormData = z.infer<typeof formSchema>;
type Employee = z.infer<typeof employeeSchema>;

// Mock data
const mockEmployees: Employee[] = [
    { id: 'EMP001', name: 'Ananya Sharma', email: 'ananya.s@example.com', designation: 'Lead Engineer', department: 'Technology', employeeType: 'Full-time', isSelected: true },
    { id: 'EMP002', name: 'Rohan Verma', email: 'rohan.v@example.com', designation: 'Product Manager', department: 'Product', employeeType: 'Full-time', isSelected: true },
    { id: 'EMP003', name: 'Priya Singh', email: 'priya.s@example.com', designation: 'Senior Designer', department: 'Design', employeeType: 'Full-time', isSelected: false },
    { id: 'EMP004', name: 'Vikram Reddy', email: 'vikram.r@example.com', designation: 'Marketing Consultant', department: 'Marketing', employeeType: 'Consultant', isSelected: false },
];


export default function EsopGrantWizardPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        employees: mockEmployees,
        grants: mockEmployees.filter(e => e.isSelected).map(e => ({
            employeeId: e.id,
            optionsGranted: 1000,
            exercisePrice: 10,
            grantDate: new Date().toISOString().split('T')[0],
        })),
        vestingStartDate: new Date().toISOString().split('T')[0],
        vestingPeriodYears: 4,
        vestingCliffMonths: 12,
        vestingFrequency: "Quarterly",
        exerciseWindowYears: 5,
    },
  });

  const watchEmployees = form.watch("employees");
  const selectedEmployees = watchEmployees.filter(e => e.isSelected);

  const { fields, update } = useFieldArray({
      control: form.control,
      name: "grants"
  });

  // Sync grants array with selected employees
  useState(() => {
    const selectedIds = new Set(selectedEmployees.map(e => e.id));
    const currentGrantIds = new Set(form.getValues('grants').map(g => g.employeeId));

    const toAdd = selectedEmployees.filter(e => !currentGrantIds.has(e.id));
    const toRemove = Array.from(currentGrantIds).filter(id => !selectedIds.has(id));

    if (toRemove.length > 0) {
        const grants = form.getValues('grants');
        const newGrants = grants.filter(g => !toRemove.includes(g.employeeId));
        form.setValue('grants', newGrants);
    }
    if (toAdd.length > 0) {
        const grants = form.getValues('grants');
        const newGrants = toAdd.map(e => ({
            employeeId: e.id,
            optionsGranted: 1000,
            exercisePrice: 10,
            grantDate: new Date().toISOString().split('T')[0],
        }));
        form.setValue('grants', [...grants, ...newGrants]);
    }
  });


  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const processStep = async () => {
    // Validation logic can be added here per step if needed
    setStep(prev => prev + 1);
    if (step < 6) {
      toast({ title: `Step ${step} Completed`, description: `Proceeding to step ${step + 1}.` });
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader><CardTitle>Step 1: Employee / Beneficiary Selection</CardTitle><CardDescription>Select the employees who will receive the ESOP grant.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>Name</TableHead><TableHead>Designation</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {form.getValues('employees').map((employee, index) => (
                             <TableRow key={employee.id}>
                                <TableCell><Checkbox checked={employee.isSelected} onCheckedChange={(checked) => {
                                    const employees = form.getValues('employees');
                                    employees[index].isSelected = !!checked;
                                    form.setValue('employees', employees, {shouldDirty: true});
                                    // Trigger re-render
                                    form.trigger('employees');
                                }} /></TableCell>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.designation}</TableCell>
                                <TableCell>{employee.employeeType}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-end"><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader><CardTitle>Step 2: Grant Details</CardTitle><CardDescription>Define the number of options and price for each selected employee.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>No. of Options</TableHead><TableHead>Exercise Price (₹)</TableHead><TableHead>Grant Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                         {form.getValues('grants').map((grant, index) => {
                             const employee = form.getValues('employees').find(e => e.id === grant.employeeId);
                             return (
                                <TableRow key={grant.employeeId}>
                                    <TableCell>{employee?.name}</TableCell>
                                    <TableCell><Input type="number" defaultValue={grant.optionsGranted} onChange={e => update(index, {...grant, optionsGranted: Number(e.target.value)})}/></TableCell>
                                    <TableCell><Input type="number" defaultValue={grant.exercisePrice} onChange={e => update(index, {...grant, exercisePrice: Number(e.target.value)})}/></TableCell>
                                    <TableCell><Input type="date" defaultValue={grant.grantDate} onChange={e => update(index, {...grant, grantDate: e.target.value})}/></TableCell>
                                </TableRow>
                             )
                         })}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Vesting Schedule</CardTitle><CardDescription>Define the schedule for earning the options.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="vestingStartDate" render={({ field }) => ( <FormItem><FormLabel>Vesting Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="vestingPeriodYears" render={({ field }) => ( <FormItem><FormLabel>Total Vesting Period (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="vestingCliffMonths" render={({ field }) => ( <FormItem><FormLabel>Vesting Cliff (Months)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>No options vest before this period.</FormDescription><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="vestingFrequency" render={({ field }) => ( <FormItem><FormLabel>Vesting Frequency (Post-Cliff)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Annually">Annually</SelectItem></SelectContent></Select><FormMessage /></FormItem> )}/>
                 </div>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Next <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 4:
         return (
          <Card>
            <CardHeader><CardTitle>Step 4: Exercise & Expiry</CardTitle><CardDescription>Define rules for when and how employees can exercise their vested options.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={form.control} name="exerciseWindowYears" render={({ field }) => ( <FormItem><FormLabel>Exercise Window (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>The period after vesting during which the employee can exercise their options.</FormDescription><FormMessage /></FormItem> )}/>
                 <FormItem><FormLabel>Method of Exercise</FormLabel><Input defaultValue="Online portal via GSTEase" /></FormItem>
                 <FormItem><FormLabel>Tax Obligations</FormLabel><Textarea defaultValue="The difference between the Fair Market Value (FMV) on the date of exercise and the exercise price is treated as a perquisite and is subject to income tax." /></FormItem>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Review <ArrowRight className="ml-2"/></Button></CardFooter>
          </Card>
        );
      case 5:
        const formData = form.getValues();
        return (
          <Card>
            <CardHeader><CardTitle>Step 5: Review & Confirmation</CardTitle><CardDescription>Review the consolidated summary of the ESOP grant.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Options</TableHead><TableHead>Exercise Price</TableHead><TableHead>Vesting</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {formData.grants.map(grant => {
                            const employee = formData.employees.find(e => e.id === grant.employeeId);
                            return (
                                <TableRow key={grant.employeeId}>
                                    <TableCell>{employee?.name}</TableCell>
                                    <TableCell>{grant.optionsGranted}</TableCell>
                                    <TableCell>₹{grant.exercisePrice}</TableCell>
                                    <TableCell>{formData.vestingPeriodYears} years ({formData.vestingCliffMonths}-month cliff)</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-between"><Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button><Button type="button" onClick={processStep}>Confirm & Proceed <Check className="ml-2"/></Button></CardFooter>
          </Card>
        );
       case 6:
        return (
            <Card>
                <CardHeader className="text-center items-center">
                    <Check className="size-12 p-2 bg-green-100 text-green-600 rounded-full"/>
                    <CardTitle>Ready to Generate Documents</CardTitle>
                    <CardDescription>Your ESOP grant details are confirmed. You can now generate the grant letters and export the schedule.</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center gap-4">
                    <Button><Printer className="mr-2"/> Generate & Email Grant Letters</Button>
                    <Button variant="outline"><FileDown className="mr-2"/> Export Vesting Schedule (CSV)</Button>
                </CardFooter>
            </Card>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Document Selection
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">ESOP Grant Wizard</h1>
        <p className="text-muted-foreground">Follow the steps to grant stock options to your employees.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}
