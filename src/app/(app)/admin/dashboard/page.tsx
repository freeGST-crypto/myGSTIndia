
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
import { ArrowRight, Users, CalendarClock, UserSquare, BadgeDollarSign } from "lucide-react";
import Link from "next/link";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { ClientList } from "@/components/admin/client-list";
import { sampleSubscribers } from "@/app/(app)/admin/subscribers/page";
import { sampleUsersList } from "@/app/(app)/admin/users/page";
import { sampleAppointments } from "@/app/(app)/admin/appointments/page";
import { sampleProfessionals } from "@/app/(app)/admin/professionals/page";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { auth, db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

const SUPER_ADMIN_UID = 'CUxyL5ioNjcQbVNszXhWGAFKS2y2';

export default function AdminDashboardPage() {
  const [user] = useAuthState(auth);
  
  const getRole = () => {
    if (!user) return null;
    if (user.uid === SUPER_ADMIN_UID) return 'super_admin';
    // This is a simplification. In a real app, you'd fetch this from your DB.
    // For this page, we primarily differentiate super_admin from professional.
    return 'professional'; 
  }
  
  const userRole = getRole();

  if (!user) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>
  }

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
            {userRole === 'professional'
              ? "Manage your client portfolio."
              : "Platform-wide overview and metrics."
              }
          </p>
        </div>
      </div>

      {userRole === 'professional' ? renderProfessionalDashboard() : renderSuperAdminDashboard()}
    </div>
  );
}
