
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
import { ShoppingCart, IndianRupee, Hash, Users, Package } from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatCard } from "@/components/dashboard/stat-card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

import { useAccountingContext } from "@/context/accounting-context";
import { db, auth } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from "react-firebase-hooks/auth";


export default function PurchaseAnalysisPage() {
    const { journalVouchers, loading: journalLoading } = useAccountingContext();
    const [user] = useAuthState(auth);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const vendorsQuery = user ? query(collection(db, 'vendors'), where("userId", "==", user.uid)) : null;
    const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
    const vendors = useMemo(() => vendorsSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name })) || [], [vendorsSnapshot]);

    const itemsQuery = user ? query(collection(db, 'items'), where("userId", "==", user.uid)) : null;
    const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
    const items = useMemo(() => itemsSnapshot?.docs.map(doc => ({ id: doc.id, name: doc.data().name })) || [], [itemsSnapshot]);

    const filteredPurchases = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return [];
        return journalVouchers.filter(v => {
            const vDate = new Date(v.date);
            return v.id.startsWith("BILL-") && !v.reverses && vDate >= dateRange.from! && vDate <= dateRange.to!;
        });
    }, [journalVouchers, dateRange]);

    const purchaseStats = useMemo(() => {
        const totalPurchases = filteredPurchases.reduce((sum, bill) => sum + bill.amount, 0);
        const billCount = filteredPurchases.length;
        const avgBillValue = billCount > 0 ? totalPurchases / billCount : 0;
        return { totalPurchases, billCount, avgBillValue };
    }, [filteredPurchases]);

    const purchasesByVendor = useMemo(() => {
        const vendorPurchases: { [key: string]: number } = {};
        for (const bill of filteredPurchases) {
            if (bill.vendorId) {
                if (!vendorPurchases[bill.vendorId]) vendorPurchases[bill.vendorId] = 0;
                vendorPurchases[bill.vendorId] += bill.amount;
            }
        }
        return Object.entries(vendorPurchases)
            .map(([vendorId, total]) => ({
                name: vendors.find(v => v.id === vendorId)?.name || 'Unknown',
                total,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5
    }, [filteredPurchases, vendors]);
    
    const purchasesByItem = useMemo(() => {
        const itemPurchases: { [key: string]: { total: number, name: string } } = {};
        for (const bill of filteredPurchases) {
            const purchaseLine = bill.lines.find(l => l.account === '5050');
            if (purchaseLine) {
                 // Simplified: assumes one item per bill from narration
                const itemNameMatch = bill.narration.match(/Purchase of (.*?) from/);
                const itemName = itemNameMatch ? itemNameMatch[1] : 'Unknown Item';
                if (!itemPurchases[itemName]) itemPurchases[itemName] = { total: 0, name: itemName };
                itemPurchases[itemName].total += parseFloat(purchaseLine.debit);
            }
        }
         return Object.values(itemPurchases)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5
    }, [filteredPurchases]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Purchase Analysis</h1>
                <p className="text-muted-foreground">Analyze your purchasing trends and vendor performance.</p>
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
                <StatCard title="Total Purchases" value={`₹${purchaseStats.totalPurchases.toLocaleString('en-IN')}`} icon={IndianRupee} loading={journalLoading} />
                <StatCard title="Bills Recorded" value={String(purchaseStats.billCount)} icon={Hash} loading={journalLoading} />
                <StatCard title="Average Bill Value" value={`₹${purchaseStats.avgBillValue.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} icon={IndianRupee} loading={journalLoading} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Top Vendors</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={purchasesByVendor} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total" name="Purchases" fill="var(--color-sales)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package className="text-primary"/> Top Purchased Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={purchasesByItem} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total" name="Purchases" fill="var(--color-purchases)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
