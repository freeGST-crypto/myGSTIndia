
"use client";

import { useState, useRef, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  FileDown,
  Printer,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import { format } from "date-fns";

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
  companyName: z.string().min(3, "Company name is required."),
  schemeName: z
    .string()
    .min(3, "Scheme name is required (e.g., 'ESOP Scheme 2024')."),
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

const PrintableGrantLetters = React.forwardRef<HTMLDivElement, { formData: FormData }>(({ formData }, ref) => {
    return (
        <div ref={ref}>
            {formData.grants.map(grant => {
                const employee = formData.employees.find(e => e.id === grant.employeeId);
                if (!employee) return null;
                return (
                    <div key={grant.employeeId} className="p-8 prose prose-sm break-before-page">
                        <h2 className="text-center font-bold">GRANT LETTER</h2>
                        <p>Date: {format(new Date(grant.grantDate), 'dd MMMM, yyyy')}</p>
                        <p>To, {employee.name}</p>
                        <p>Dear {employee.name},</p>
                        <p>We are pleased to inform you that you have been granted {grant.optionsGranted} stock options under the {formData.schemeName}.</p>
                        <p>The exercise price is ₹{grant.exercisePrice} per option.</p>
                        <p>These options will vest over {formData.vestingPeriodYears} years with a {formData.vestingCliffMonths}-month cliff.</p>
                        <p>Sincerely,</p>
                        <p>The Board of Directors</p>
                        <p>{formData.companyName}</p>
                    </div>
                )
            })}
        </div>
    )
});
PrintableGrantLetters.displayName = "PrintableGrantLetters";


export default function EsopGrantWizardPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const printRef = useRef(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "Acme Innovations Pvt. Ltd.",
      schemeName: "ESOP Scheme 2024",
      employees: mockEmployees,
      grants: mockEmployees
        .filter((e) => e.isSelected)
        .map((e) => ({
          employeeId: e.id,
          optionsGranted: 1000,
          exercisePrice: 10,
          grantDate: new Date().toISOString().split("T")[0],
        })),
      vestingStartDate: new Date().toISOString().split("T")[0],
      vestingPeriodYears: 4,
      vestingCliffMonths: 12,
      vestingFrequency: "Quarterly",
      exerciseWindowYears: 5,
    },
  });

  const watchEmployees = form.watch("employees");
  const selectedEmployees = watchEmployees.filter((e) => e.isSelected);

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "grants",
  });

  useEffect(() => {
    const selectedIds = new Set(selectedEmployees.map((e) => e.id));
    const currentGrants = form.getValues("grants");

    const newGrants = selectedEmployees.map((emp) => {
      const existingGrant = currentGrants.find(
        (g) => g.employeeId === emp.id
      );
      return (
        existingGrant || {
          employeeId: emp.id,
          optionsGranted: 1000,
          exercisePrice: 10,
          grantDate: new Date().toISOString().split("T")[0],
        }
      );
    });

    replace(newGrants);
  }, [selectedEmployees.length, form, replace]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () =>
      toast({
        title: "Documents Generated",
        description: "Grant letters have been sent to your printer or saved as PDF.",
      }),
  });
  
  const handleExportCsv = () => {
    const data = form.getValues('grants').map(grant => {
        const employee = form.getValues('employees').find(e => e.id === grant.employeeId);
        return {
            "Employee Name": employee?.name,
            "Options Granted": grant.optionsGranted,
            "Grant Date": grant.grantDate,
            "Exercise Price": grant.exercisePrice,
            "Vesting Start": form.getValues('vestingStartDate'),
            "Vesting Period (Yrs)": form.getValues('vestingPeriodYears'),
            "Cliff (Mths)": form.getValues('vestingCliffMonths'),
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vesting Schedule");
    XLSX.writeFile(workbook, `Vesting_Schedule_${form.getValues('schemeName').replace(/\\s+/g, '_')}.xlsx`);
    toast({ title: "Export Successful", description: "The vesting schedule has been downloaded." });
  };


  const processStep = async () => {
    setStep((prev) => prev + 1);
    if (step < 7) {
      toast({
        title: `Step ${step} Completed`,
        description: `Proceeding to step ${step + 1}.`,
      });
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Scheme Details</CardTitle>
              <CardDescription>
                Define the basic details of your company and the ESOP scheme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schemeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ESOP Scheme Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ESOP Scheme 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="button" onClick={processStep}>
                Next <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Employee / Beneficiary Selection</CardTitle>
              <CardDescription>
                Select the employees who will receive the ESOP grant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.getValues("employees").map((employee, index) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Checkbox
                          checked={employee.isSelected}
                          onCheckedChange={(checked) => {
                            const employees = form.getValues("employees");
                            employees[index].isSelected = !!checked;
                            form.setValue("employees", employees, {
                              shouldDirty: true,
                            });
                            form.trigger("employees");
                          }}
                        />
                      </TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>{employee.employeeType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button type="button" onClick={processStep}>
                Next <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Grant Details</CardTitle>
              <CardDescription>
                Define the number of options and price for each selected
                employee.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>No. of Options</TableHead>
                    <TableHead>Exercise Price (₹)</TableHead>
                    <TableHead>Grant Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.getValues("grants").map((grant, index) => {
                    const employee = form
                      .getValues("employees")
                      .find((e) => e.id === grant.employeeId);
                    return (
                      <TableRow key={grant.employeeId}>
                        <TableCell>{employee?.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={grant.optionsGranted}
                            onChange={(e) =>
                              form.setValue(
                                `grants.${index}.optionsGranted`,
                                Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={grant.exercisePrice}
                            onChange={(e) =>
                              form.setValue(
                                `grants.${index}.exercisePrice`,
                                Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            defaultValue={grant.grantDate}
                            onChange={(e) =>
                              form.setValue(
                                `grants.${index}.grantDate`,
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button type="button" onClick={processStep}>
                Next <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Vesting Schedule</CardTitle>
              <CardDescription>
                Define the schedule for earning the options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vestingStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vesting Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vestingPeriodYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Vesting Period (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vestingCliffMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vesting Cliff (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        No options vest before this period.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vestingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vesting Frequency (Post-Cliff)</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Annually">Annually</SelectItem>
                        </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button type="button" onClick={processStep}>
                Next <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 5: Exercise & Expiry</CardTitle>
              <CardDescription>
                Define rules for when and how employees can exercise their
                vested options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="exerciseWindowYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Window (Years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      The period after vesting during which the employee can
                      exercise their options.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Method of Exercise</FormLabel>
                <Input defaultValue="Online portal via GSTEase" />
              </FormItem>
              <FormItem>
                <FormLabel>Tax Obligations</FormLabel>
                <Textarea defaultValue="The difference between the Fair Market Value (FMV) on the date of exercise and the exercise price is treated as a perquisite and is subject to income tax." />
              </FormItem>
            </CardContent>
            <CardFooter className="justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button type="button" onClick={processStep}>
                Review <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 6:
        const formDataRev = form.getValues();
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 6: Review & Confirmation</CardTitle>
              <CardDescription>
                Review the consolidated summary of the ESOP grant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Exercise Price</TableHead>
                    <TableHead>Vesting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formDataRev.grants.map((grant) => {
                    const employee = formDataRev.employees.find(
                      (e) => e.id === grant.employeeId
                    );
                    return (
                      <TableRow key={grant.employeeId}>
                        <TableCell>{employee?.name}</TableCell>
                        <TableCell>{grant.optionsGranted}</TableCell>
                        <TableCell>₹{grant.exercisePrice}</TableCell>
                        <TableCell>
                          {formDataRev.vestingPeriodYears} years (
                          {formDataRev.vestingCliffMonths}-month cliff)
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2" /> Back
              </Button>
              <Button type="button" onClick={processStep}>
                Confirm & Proceed <Check className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 7:
        return (
          <Card>
            <CardHeader className="text-center items-center">
              <Check className="size-12 p-2 bg-green-100 text-green-600 rounded-full" />
              <CardTitle>Ready to Generate Documents</CardTitle>
              <CardDescription>
                Your ESOP grant details are confirmed. You can now generate the
                grant letters and export the schedule.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center gap-4">
              <Button onClick={handlePrint}>
                <Printer className="mr-2" /> Generate & Email Grant Letters
              </Button>
              <Button variant="outline" onClick={handleExportCsv}>
                <FileDown className="mr-2" /> Export Vesting Schedule (CSV)
              </Button>
            </CardFooter>
             {/* This div is only for the print job, it's not visible on screen */}
            <div className="hidden">
                 <PrintableGrantLetters ref={printRef} formData={form.getValues()} />
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link
        href="/legal-documents"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Document Selection
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">ESOP Grant Wizard</h1>
        <p className="text-muted-foreground">
          Follow the steps to grant stock options to your employees.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-8">{renderStep()}</form>
      </Form>
    </div>
  );
}
