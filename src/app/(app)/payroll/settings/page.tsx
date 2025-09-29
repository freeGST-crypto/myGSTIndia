
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function PayrollSettingsPage() {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Payroll Settings</h1>
                <p className="text-muted-foreground">Configure your organization's payroll components and rules.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Statutory Components</CardTitle>
                    <CardDescription>Enable and configure statutory deductions for your employees.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="pf-enabled" defaultChecked/>
                        <Label htmlFor="pf-enabled">Enable Provident Fund (PF)</Label>
                    </div>
                    <div className="space-y-2 pl-6">
                        <Label>PF Number</Label>
                        <Input defaultValue="MH/BOM/1234567/000/1234567"/>
                    </div>
                     <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="esi-enabled" defaultChecked/>
                        <Label htmlFor="esi-enabled">Enable Employee State Insurance (ESI)</Label>
                    </div>
                     <div className="space-y-2 pl-6">
                        <Label>ESI Number</Label>
                        <Input defaultValue="12345678901234567"/>
                    </div>
                     <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="pt-enabled"/>
                        <Label htmlFor="pt-enabled">Enable Professional Tax (PT)</Label>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Salary Components</CardTitle>
                    <CardDescription>Manage earnings and deduction components for your salary structure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">This section would allow adding/editing salary components like Basic, HRA, Special Allowance, etc. (Functionality under development).</p>
                </CardContent>
                 <CardFooter className="justify-end">
                    <Button>
                        <Save className="mr-2"/>
                        Save Settings
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
