"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Users, CalendarClock, UserSquare, BadgeDollarSign } from "lucide-react";
import Link from "next/link";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { ClientList } from "@/components/admin/client-list";
// We can import the sample data to make the dashboard stats dynamic
import { sampleSubscribers } from "@/app/(app)/admin/subscribers/page";
import { sampleUsersList } from "@/app/(app)/admin/users/page";
import { sampleAppointments } from "@/app/(app)/admin/appointments/page";
import { sampleProfessionals } from "@/app/(app)/admin/professionals/page";

type UserRole = "Super Admin" | "Professional";

export default function AdminDashboardPage() {
  // Simulate user role. In a real app, this would come from user context.
  const [userRole, setUserRole] = useState<UserRole>("Super Admin");

  const renderSuperAdminDashboard = () => {
    const proSubscribers = sampleSubscribers.filter(s => s.plan === 'Professional').length;
    const businessSubscribers = sampleSubscribers.filter(s => s.plan === 'Business').length;
    const pendingAppointments = sampleAppointments.filter(a => a.status === 'Pending').length;

    return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/subscribers">
            <AdminStatCard
            title="Paid Subscribers"
            mainValue={String(sampleSubscribers.length)}
            subValue={`${proSubscribers} Pro / ${businessSubscribers} Business`}
            icon={BadgeDollarSign}
            />
        </Link>
         <Link href="/admin/users">
            <AdminStatCard
            title="Total Users"
            mainValue={String(sampleUsersList.length)}
            subValue={`${sampleUsersList.filter(u => u.status === 'Pending Onboarding').length} new this month`}
            icon={Users}
            />
        </Link>
        <Link href="/admin/appointments">
            <AdminStatCard
            title="Pending Appointments"
            mainValue={String(pendingAppointments)}
            subValue={`${sampleAppointments.filter(a => a.preferredDate.toDateString() === new Date().toDateString()).length} new today`}
            icon={CalendarClock}
            />
        </Link>
        <Link href="/admin/professionals">
            <AdminStatCard
            title="Listed Professionals"
            mainValue={String(sampleProfessionals.length)}
            subValue="CA/CS/Advocates & more"
            icon={UserSquare}
            />
        </Link>
      </div>
      <ActivityFeed />
    </div>
  );
}

  const renderProfessionalDashboard = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Client Workspace Management</CardTitle>
          <CardDescription>
            Switch into a client's workspace to manage their account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ClientList />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users/> Full Client List</CardTitle>
            <CardDescription>For more advanced search and editing options, go to the full user management page.</CardDescription>
        </CardHeader>
        <CardContent>
            <Link href="/admin/users" passHref>
                <Button>
                    <span>Go to User Management</span>
                    <ArrowRight className="ml-2"/>
                </Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {userRole === "Super Admin"
              ? "Platform-wide overview and metrics."
              : "Manage your client portfolio."}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Viewing as:</span>
            <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {userRole === "Super Admin"
        ? renderSuperAdminDashboard()
        : renderProfessionalDashboard()}
    </div>
  );
}
