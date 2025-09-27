
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Users, IndianRupee, FileText, Settings, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PayrollDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Payroll Dashboard</h1>
        <p className="text-muted-foreground">An overview of your organization's payroll.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Active Employees" value="3" icon={Users} description="Total employees on payroll" />
        <StatCard title="Last Month's Payroll" value="₹2,64,000.00" icon={IndianRupee} description="Total salary disbursed" />
        <StatCard title="Next Payroll Date" value="July 31, 2024" icon={FileText} description="For the month of July" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Manage Employees</CardTitle>
                <CardDescription>Add, edit, or view employee information and salary structures.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Maintain an up-to-date record of all your team members.</p>
            </CardContent>
            <CardFooter>
                 <Link href="/payroll/employees" passHref>
                    <Button>
                        <span>Go to Employees</span>
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Run Payroll</CardTitle>
                <CardDescription>Process salaries, generate payslips, and manage payouts.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">Run your monthly payroll cycle in just a few steps.</p>
            </CardContent>
            <CardFooter>
                 <Link href="/payroll/run-payroll" passHref>
                    <Button>
                        <span>Run Monthly Payroll</span>
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings /> Payroll Settings</CardTitle>
                <CardDescription>Configure your company's statutory and salary settings.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">Set up PF, ESI, professional tax, and other payroll defaults.</p>
            </CardContent>
            <CardFooter>
                 <Link href="/payroll/settings" passHref>
                    <Button>
                        <span>Configure Settings</span>
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
      </div>

    </div>
  );
}

    