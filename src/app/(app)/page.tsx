
"use client";

import { useState, useMemo, useContext } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, IndianRupee, CreditCard, Users, Search } from "lucide-react";
import { MarketingCarousel } from "@/components/dashboard/marketing-carousel";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ComplianceCalendar } from "@/components/dashboard/compliance-calendar";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AccountingContext } from "@/context/accounting-context";
import { allAccounts } from "@/lib/accounts";

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { journalVouchers } = useContext(AccountingContext)!;
  
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    allAccounts.forEach(acc => {
        balances[acc.code] = 0;
    });

    journalVouchers.forEach(voucher => {
        voucher.lines.forEach(line => {
            if (balances.hasOwnProperty(line.account)) {
                const accountType = allAccounts.find(a => a.code === line.account)?.type;
                const debit = parseFloat(line.debit);
                const credit = parseFloat(line.credit);

                if (accountType === 'Asset' || accountType === 'Expense') {
                    balances[line.account] += debit - credit;
                } else { // Liability, Equity, Revenue
                    balances[line.account] += credit - debit;
                }
            }
        });
    });
    return balances;
  }, [journalVouchers]);
  
  const totalReceivables = accountBalances['1210'] || 0;
  const totalPayables = accountBalances['2010'] || 0;
  const gstPayable = accountBalances['2110'] || 0;


  const invoices = useMemo(() => {
    return journalVouchers
        .filter(v => v.narration.startsWith("Sale to"))
        .slice(0, 5)
        .map(v => ({
            invoice: v.id.replace("JV-", ""),
            customer: v.narration.replace("Sale to ", "").split(" via")[0],
            amount: formatCurrency(v.amount),
            status: "Pending", // Status logic to be implemented later
        }));
  }, [journalVouchers]);


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
        <Link href="/accounting/ledgers">
          <StatCard 
            title="Total Receivables"
            value={formatCurrency(totalReceivables)}
            icon={IndianRupee}
            description="Balance in Accounts Receivable"
          />
        </Link>
        <Link href="/accounting/ledgers">
          <StatCard 
            title="Total Payables"
            value={formatCurrency(totalPayables)}
            icon={CreditCard}
            description="Balance in Accounts Payable"
          />
        </Link>
        <Link href="/accounting/ledgers">
          <StatCard 
            title="Net Tax Liability"
            value={formatCurrency(gstPayable)}
            icon={DollarSign}
            description="Balance in GST Payable"
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
              className="pl-8 w-full md:w-1/3"
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
