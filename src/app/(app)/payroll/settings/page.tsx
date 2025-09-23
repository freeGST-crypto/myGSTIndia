
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Save, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { states } from "@/lib/states";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  pfEnabled: z.boolean().default(true),
  pfEmployeeContribution: z.coerce.number().min(0).max(100).default(12),
  pfEmployerContribution: z.coerce.number().min(0).max(100).default(12),
  pfUniversalAccountNumber: z.string().optional(),
  
  esiEnabled: z.boolean().default(true),
  esiEmployeeContribution: z.coerce.number().min(0).max(100).default(0.75),
  esiEmployerContribution: z.coerce.number().min(0).max(100).default(3.25),
  esiCodeNumber: z.string().optional(),
  
  ptEnabled: z.boolean().default(true),
  ptRegistrationNumber: z.string().optional(),
  ptState: z.string().min(2, "State is required for PT."),
  
  incomeTaxEnabled: z.boolean().default(true),
  tanNumber: z.string().optional(),

  lwfEnabled: z.boolean().default(true),
  lwfRegistrationNumber: z.string().optional(),
  lwfState: z.string().optional(),

  gratuityEnabled: z.boolean().default(true),
  gratuityAccrualRate: z.coerce.number().min(0).max(100).default(4.81),
  
  bonusEnabled: z.boolean().default(true),
  bonusRate: z.coerce.number().min(0).max(100).default(8.33),
  
  insuranceEnabled: z.boolean().default(true),
  employerInsuranceContribution: z.coerce.number().min(0).default(500),
});

export default function PayrollSettingsPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pfEnabled: true,
      pfEmployeeContribution: 12,
      pfEmployerContribution: 12,
      esiEnabled: true,
      esiEmployeeContribution: 0.75,
      esiEmployerContribution: 3.25,
      ptEnabled: true,
      ptState: "Maharashtra",
      incomeTaxEnabled: true,
      lwfEnabled: true,
      lwfState: "Maharashtra",
      gratuityEnabled: true,
      gratuityAccrualRate: 4.81,
      bonusEnabled: true,
      bonusRate: 8.33,
      insuranceEnabled: true,
      employerInsuranceContribution: 500,
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Saving payroll settings:", values);
    toast({
      title: "Settings Saved",
      description: "Your payroll settings have been updated successfully.",
    });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Payroll Settings</h1>
        <p className="text-muted-foreground">
          Configure statutory components and company-wide payroll preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Statutory Components</CardTitle>
                    <CardDescription>
                        Enable and configure PF, ESI, and other statutory settings for your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Provident Fund (PF) Section */}
                    <div>
                        <FormField
                            control={form.control}
                            name="pfEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Provident Fund (PF)</FormLabel>
                                    <FormDescription>Manage employee and employer PF contributions.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch("pfEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                <FormField control={form.control} name="pfUniversalAccountNumber" render={({ field }) => (<FormItem><FormLabel>Company PF Account Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="pfEmployeeContribution" render={({ field }) => (<FormItem><FormLabel>Employee Contribution (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="pfEmployerContribution" render={({ field }) => (<FormItem><FormLabel>Employer Contribution (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Employee State Insurance (ESI) Section */}
                    <div>
                        <FormField
                            control={form.control}
                            name="esiEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Employee State Insurance (ESI)</FormLabel>
                                    <FormDescription>Applicable for employees with gross salary up to ₹21,000.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                         {form.watch("esiEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                <FormField control={form.control} name="esiCodeNumber" render={({ field }) => (<FormItem><FormLabel>ESI Code Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="esiEmployeeContribution" render={({ field }) => (<FormItem><FormLabel>Employee Contribution (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="esiEmployerContribution" render={({ field }) => (<FormItem><FormLabel>Employer Contribution (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                            </div>
                        )}
                    </div>
                     {/* Professional Tax (PT) Section */}
                    <div>
                        <FormField
                            control={form.control}
                            name="ptEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Professional Tax (PT)</FormLabel>
                                    <FormDescription>State-specific tax deducted from employee salary.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                         {form.watch("ptEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                 <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="ptRegistrationNumber" render={({ field }) => (<FormItem><FormLabel>PT Registration Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="ptState" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                 </div>
                            </div>
                        )}
                    </div>
                     {/* Income Tax (TDS) Section */}
                    <div>
                        <FormField
                            control={form.control}
                            name="incomeTaxEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Income Tax (TDS)</FormLabel>
                                    <FormDescription>Manage TDS deductions on employee salaries.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch("incomeTaxEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                <FormField control={form.control} name="tanNumber" render={({ field }) => (<FormItem><FormLabel>TAN (Tax Deduction and Collection Account Number)</FormLabel><FormControl><Input placeholder="e.g. ABCD12345E" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                        )}
                    </div>
                     {/* Labour Welfare Fund (LWF) Section */}
                    <div>
                        <FormField
                            control={form.control}
                            name="lwfEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Labour Welfare Fund (LWF)</FormLabel>
                                    <FormDescription>State-specific contribution for employee welfare.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch("lwfEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="lwfRegistrationNumber" render={({ field }) => (<FormItem><FormLabel>LWF Registration Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="lwfState" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Employer Contributions & Provisions</CardTitle>
                    <CardDescription>Configure other CTC components like Gratuity, Insurance, and Bonus.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div>
                        <FormField
                            control={form.control}
                            name="gratuityEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Gratuity</FormLabel>
                                    <FormDescription>Enable automatic accrual for gratuity provision.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch("gratuityEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                <FormField control={form.control} name="gratuityAccrualRate" render={({ field }) => (<FormItem><FormLabel>Gratuity Accrual Rate (% of Basic)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Standard rate is ~4.81%.</FormDescription><FormMessage /></FormItem>)}/>
                            </div>
                        )}
                    </div>
                      <div>
                        <FormField
                            control={form.control}
                            name="insuranceEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Group Medical/Accident Insurance</FormLabel>
                                    <FormDescription>Set the employer's contribution towards insurance.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch("insuranceEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                <FormField control={form.control} name="employerInsuranceContribution" render={({ field }) => (<FormItem><FormLabel>Employer's Monthly Contribution (₹ per employee)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                        )}
                    </div>
                     <div>
                        <FormField
                            control={form.control}
                            name="bonusEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Bonus / Ex-gratia</FormLabel>
                                    <FormDescription>Define the bonus policy for provisions.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch("bonusEnabled") && (
                            <div className="space-y-4 pt-4 pl-4 border-l border-r border-b rounded-b-lg p-4">
                                <FormField control={form.control} name="bonusRate" render={({ field }) => (<FormItem><FormLabel>Statutory Bonus Rate (% of Basic, up to a ceiling)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Minimum is 8.33% as per the Payment of Bonus Act.</FormDescription><FormMessage /></FormItem>)}/>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payslip Branding</CardTitle>
                    <CardDescription>Customize the appearance of your employee payslips.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Company Logo for Payslips</Label>
                        <Input type="file" accept="image/*" />
                        <FormDescription>This logo will appear on all generated payslips. Recommended: rectangular logo.</FormDescription>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit"><Save className="mr-2"/>Save All Settings</Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
    </div>
  );
}
