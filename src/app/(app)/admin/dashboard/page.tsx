
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
import { ArrowRight, BarChart, Users, Zap, FileText } from "lucide-react";
import Link from "next/link";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { ClientList } from "@/components/admin/client-list";

type UserRole = "Super Admin" | "Professional";

export default function AdminDashboardPage() {
  // Simulate user role. In a real app, this would come from user context.
  const [userRole, setUserRole] = useState<UserRole>("Super Admin");

  const renderSuperAdminDashboard = () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          title="Active Subscriptions"
          mainValue="1,250"
          subValue="850 Pro / 400 Business"
          icon={BarChart}
        />
        <AdminStatCard
          title="Today's Usage Metrics"
          items={[
            { label: "E-Way Bills", value: "45" },
            { label: "GSTR Reports", value: "22" },
            { label: "AI Features Used", value: "157" },
          ]}
          icon={Zap}
        />
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users/> Total Users</CardTitle>
                <CardDescription>Total registered users on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-3xl font-bold">2,480</p>
                <Link href="/admin/users" passHref>
                    <Button variant="outline">
                        <span>Go to User Management</span>
                        <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
      <ActivityFeed />
    </div>
  );

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
