
"use client";

import { useState, useMemo } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, IndianRupee, CreditCard, Users, Search } from "lucide-react";
import { MarketingCarousel } from "@/components/dashboard/marketing-carousel";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ComplianceCalendar } from "@/components/dashboard/compliance-calendar";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const invoices = [
  {
    invoice: "INV001",
    customer: "Global Tech Inc.",
    amount: "₹25,000.00",
    status: "Paid",
  },
  {
    invoice: "INV002",
    customer: "Innovate Solutions",
    amount: "₹15,000.00",
    status: "Draft",
  },
  {
    invoice: "INV003",
    customer: "Quantum Leap",
    amount: "₹35,000.00",
    status: "Paid",
  },
  {
    invoice: "INV004",
    customer: "Synergy Corp",
    amount: "₹45,000.00",
    status: "Overdue",
  },
  {
    invoice: "INV005",
    customer: "Apex Enterprises",
    amount: "₹55,000.00",
    status: "Paid",
  },
];


export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(invoice =>
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoice.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/invoices">
          <StatCard 
            title="Total Receivables"
            value="₹1,25,430.50"
            icon={IndianRupee}
            description="+20.1% from last month"
          />
        </Link>
        <Link href="/purchases">
          <StatCard 
            title="Total Payables"
            value="₹45,231.89"
            icon={CreditCard}
            description="+18.1% from last month"
          />
        </Link>
        <Link href="/gst-filings">
          <StatCard 
            title="Net Tax Liability"
            value="₹8,750.00"
            icon={DollarSign}
            description="For this month"
          />
        </Link>
        <Link href="/parties">
          <StatCard 
            title="Active Customers"
            value="+57"
            icon={Users}
            description="+12 since last month"
          />
        </Link>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <MarketingCarousel />
        </div>
        <div>
            <ComplianceCalendar />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Search &amp; Recent Activity</CardTitle>
          <CardDescription>Quickly find recent invoices or see an overview of the latest activity.</CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search recent invoices..."
              className="pl-8 sm:w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <RecentActivity invoices={filteredInvoices} />
        </CardContent>
      </Card>

    </div>
  );
}
