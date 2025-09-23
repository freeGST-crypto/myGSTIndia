
"use client";

import { useState, useMemo, useContext, memo } from "react";
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
import { allAccounts } from "@/lib/accounts";
import { MarketingCarousel } from "@/components/dashboard/marketing-carousel";
import { ShortcutGuide } from "@/components/dashboard/shortcut-guide";

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '₹0.00';
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function DashboardContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const accountingContext = useContext(AccountingContext);
  const [user] = useAuthState(auth);
  
  if (!accountingContext) {
    // This can happen briefly on initial load or if context is not provided
    return <div>Loading Accounting Data...</div>;
  }

  const { journalVouchers, loading: journalLoading } = accountingContext;

  const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
  const [customersSnapshot, customersLoading] = useCollection(customersQuery);
  const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [customersSnapshot]);

  const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
  const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
  const vendors = useMemo(() => vendorsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [], [vendorsSnapshot]);


  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    
    // Initialize all accounts from lists
    allAccounts.forEach(acc => { balances[acc.code] = 0; });
    customers.forEach(c => { if(c.id) balances[c.id] = 0; });
    vendors.forEach(v => { if(v.id) balances[v.id] = 0; });
    
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
  }, [journalVouchers, customers, vendors]);
  
  const totalReceivables = useMemo(() => {
    return customers.reduce((sum, customer) => {
        if (customer.id && accountBalances[customer.id]) {
            // Receivables are debit balances
            return sum + accountBalances[customer.id];
        }
        return sum;
    }, 0);
  }, [customers, accountBalances]);

  const totalPayables = useMemo(() => {
    return vendors.reduce((sum, vendor) => {
      if (vendor.id && accountBalances[vendor.id]) {
        // Payables are credit balances, so they will be negative in our calculation
        return sum - accountBalances[vendor.id];
      }
      return sum;
    }, 0);
  }, [vendors, accountBalances]);
  
  const gstPayable = accountBalances['2110'] ? -accountBalances['2110'] : 0; // GST Payable is a credit balance

  const invoices = useMemo(() => {
    return journalVouchers
        .filter(v => v && v.id && v.id.startsWith("INV-"))
        .slice(0, 5)
        .map(v => ({
            invoice: v.id,
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
      <MarketingCarousel />
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
             loading={journalLoading || vendorsLoading}
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
             <ShortcutGuide />
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

export default memo(DashboardContent);

