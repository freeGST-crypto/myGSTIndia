
"use client";

import { useState, useMemo, useContext } from "react";
import { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, IndianRupee, Hash, Users, Package } from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatCard } from "@/components/dashboard/stat-card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

import { useAccountingContext } from "@/context/accounting-context";
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";


export default function SalesAnalysisPage() {
    const { journalVouchers, loading: journalLoading } = useAccountingContext();
    const [user] = useAuthState(auth);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const customersQuery = user ? query(collection(db, 'customers'), where("userId", "==", user.uid)) : null;
    const [customersSnapshot, customersLoading] = useCollection(customersQuery);
    const customers = useMemo(() => customersSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name })) || [], [customersSnapshot]);

    const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
    const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
    const items = useMemo(() => itemsSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name })) || [], [itemsSnapshot]);

    const filteredInvoices = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return [];
        return journalVouchers.filter(v => {
            if (!v || !v.id || !v.date) return false;
            const vDate = new Date(v.date);
            return v.id.startsWith("INV-") && !v.reverses && vDate >= dateRange.from! && vDate <= dateRange.to!;
        });
    }, [journalVouchers, dateRange]);

    const salesStats = useMemo(() => {
        const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const invoiceCount = filteredInvoices.length;
        const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : 0;
        return { totalSales, invoiceCount, avgInvoiceValue };
    }, [filteredInvoices]);

    const salesByCustomer = useMemo(() => {
        const customerSales: { [key: string]: number } = {};
        for (const inv of filteredInvoices) {
            if (inv.customerId) {
                if (!customerSales[inv.customerId]) customerSales[inv.customerId] = 0;
                customerSales[inv.customerId] += inv.amount;
            }
        }
        return Object.entries(customerSales)
            .map(([customerId, total]) => ({
                name: customers.find(c => c.id === customerId)?.name || 'Unknown',
                total,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5
    }, [filteredInvoices, customers]);
    
    const salesByItem = useMemo(() => {
        const itemSales: { [key: string]: { total: number, name: string } } = {};
        for (const inv of filteredInvoices) {
            const salesLine = inv.lines.find(l => l.account === '4010');
            if (salesLine) {
                 // Simplified: assumes one item per invoice from narration
                const itemNameMatch = inv.narration.match(/Sale of (.*?) to/);
                const itemName = itemNameMatch ? itemNameMatch[1] : 'Unknown Item';
                if (!itemSales[itemName]) itemSales[itemName] = { total: 0, name: itemName };
                itemSales[itemName].total += parseFloat(salesLine.credit);
            }
        }
         return Object.values(itemSales)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5
    }, [filteredInvoices]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Sales Analysis</h1>
                <p className="text-muted-foreground">Analyze your sales performance and trends.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                    <DateRangePicker onDateChange={setDateRange} initialDateRange={dateRange} />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Sales" value={`₹${salesStats.totalSales.toLocaleString('en-IN')}`} icon={IndianRupee} loading={journalLoading} />
                <StatCard title="Invoices Issued" value={String(salesStats.invoiceCount)} icon={Hash} loading={journalLoading} />
                <StatCard title="Average Invoice Value" value={`₹${salesStats.avgInvoiceValue.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} icon={IndianRupee} loading={journalLoading} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Top Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesByCustomer} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total" name="Sales" fill="var(--color-sales)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package className="text-primary"/> Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesByItem} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total" name="Sales" fill="var(--color-purchases)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
