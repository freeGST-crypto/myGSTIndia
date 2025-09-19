
"use client";

import { useState, useMemo, useContext } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, IndianRupee, CreditCard, Users, Search } from "lucide-react";
import { FinancialSummaryChart } from "@/components/dashboard/financial-summary-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ComplianceCalendar } from "@/components/dashboard/compliance-calendar";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AccountingContext } from "@/context/accounting-context";
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from "react-firebase-hooks/auth";

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '₹0.00';
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

export default function DashboardContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const accountingContext = useContext(AccountingContext);

  if (!accountingContext) {
    return <div>Loading...</div>;
  }

  const { journalVouchers, loading: journalLoading } = accountingContext;
  const [user] = useAuthState(auth);

  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [customersSnapshot]);

  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    
    customers.forEach(c => balances[c.id] = 0);
    
    journalVouchers.forEach(voucher => {
        if (!voucher || !voucher.lines) return;
        voucher.lines.forEach(line => {
            if (!balances.hasOwnProperty(line.account)) {
                balances[line.account] = 0;
            }
            const debit = parseFloat(line.debit);
            const credit = parseFloat(line.credit);
            balances[line.account] += debit - credit;
        });
    });
    return balances;
  }, [journalVouchers, customers]);
  
  const totalReceivables = useMemo(() => {
    return customers.reduce((sum, customer) => sum + (accountBalances[customer.id] || 0), 0);
  }, [customers, accountBalances]);

  const totalPayables = accountBalances['2010'] || 0;
  const gstPayable = accountBalances['2110'] || 0;

  const invoices = useMemo(() => {
    return journalVouchers
        .filter(v => v && v.id && v.id.startsWith("JV-INV-"))
        .slice(0, 5)
        .map(v => ({
            invoice: v.id.replace("JV-", ""),
            customer: v.narration.replace("Sale to ", "").split(" via")[0],
            amount: formatCurrency(v.amount),
            status: "Pending",
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
            loading={journalLoading || customersLoading}
          />
        </Link>
        <Link href="/accounting/ledgers">
          <StatCard 
            title="Total Payables"
            value={formatCurrency(totalPayables)}
            icon={CreditCard}
            description="Balance in Accounts Payable"
             loading={journalLoading}
          />
        </Link>
        <Link href="/accounting/ledgers">
          <StatCard 
            title="Net Tax Liability"
            value={formatCurrency(gstPayable)}
            icon={DollarSign}
            description="Balance in GST Payable"
             loading={journalLoading}
          />
        </Link>
        <Link href="/parties">
          <StatCard 
            title="Active Customers"
            value={String(customers.length)}
            icon={Users}
            description={`${customers.length} total customers`}
             loading={customersLoading}
          />
        </Link>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <FinancialSummaryChart />
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
          <RecentActivity invoices={filteredInvoices} loading={journalLoading} />
        </CardContent>
      </Card>

    </div>
  );
}
