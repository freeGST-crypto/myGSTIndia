import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, IndianRupee, CreditCard, Users } from "lucide-react";
import { MarketingCarousel } from "@/components/dashboard/marketing-carousel";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ComplianceCalendar } from "@/components/dashboard/compliance-calendar";
import Link from "next/link";

export default function DashboardPage() {
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

      <div>
        <RecentActivity />
      </div>

    </div>
  );
}
