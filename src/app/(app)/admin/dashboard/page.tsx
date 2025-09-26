
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, CalendarClock, UserSquare, BadgeDollarSign, Loader2, ShieldCheck, UserCog } from "lucide-react";
import Link from "next/link";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { ClientList } from "@/components/admin/client-list";
import { sampleSubscribers } from "@/app/(app)/admin/subscribers/page";
import { sampleUsersList } from "@/app/(app)/admin/users/page";
import { sampleAppointments } from "@/app/(app)/admin/appointments/page";
import { sampleProfessionals } from "@/app/(app)/admin/professionals/page";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRoleSimulator } from "@/context/role-simulator-context";

const SUPER_ADMIN_UID = 'CUxyL5ioNjcQbVNszXhWGAFKS2y2';

export default function AdminDashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const userDocRef = user ? doc(db, 'users', user.uid) : null;
  const [userData, loadingUser] = useDocumentData(userDocRef);
  const { simulatedRole, setSimulatedRole } = useRoleSimulator();

  const getRole = () => {
    if (!user) return 'business'; // Default to business if not logged in for viewing purposes
    if (user.uid === SUPER_ADMIN_UID) return 'super_admin';
    return userData?.userType || 'business'; 
  }
  
  const userRole = getRole();
  // The selectedRole state now comes from the context
  const selectedRole = simulatedRole || userRole;

  const handleRoleChange = (role: string) => {
    setSimulatedRole(role);
  }

  if (loadingAuth || loadingUser) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>
  }

  const roleInfo = {
    super_admin: {
        icon: ShieldCheck,
        title: "Super Admin Role",
        description: "You have full platform access. The 'Admin' menu in the sidebar is visible, allowing you to manage users, subscribers, pricing, and all platform settings."
    },
    professional: {
        icon: UserCog,
        title: "Professional Role",
        description: "You have access to all business features plus the 'Client Workspace' menu to manage your clients. You do not see the 'Admin' panel."
    },
    business: {
        icon: Users,
        title: "Business Role",
        description: "You have access to all features for managing a single business, such as Billing and Accounting. You do not see 'Admin' or 'Client Workspace' menus."
    }
  }

  const CurrentRoleInfo = roleInfo[selectedRole as keyof typeof roleInfo];

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
  
  const renderBusinessDashboard = () => (
    <div className="space-y-8">
      <p>This page is primarily for 'professional' and 'super_admin' roles. As a 'business' user, your main dashboard is your homepage.</p>
        <Link href="/dashboard" passHref>
            <Button>Go to Main Dashboard</Button>
        </Link>
    </div>
  );


  const renderDashboard = () => {
    switch (selectedRole) {
        case 'super_admin':
            return renderSuperAdminDashboard();
        case 'professional':
            return renderProfessionalDashboard();
        case 'business':
            return renderBusinessDashboard();
        default:
            return <p>You do not have a valid role to view this dashboard.</p>;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {selectedRole === 'super_admin' && 'Admin Dashboard'}
            {selectedRole === 'professional' && 'Client Workspace'}
            {selectedRole === 'business' && 'Business Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {selectedRole === 'professional'
              ? "Manage your client portfolio."
              : selectedRole === 'super_admin'
              ? "Platform-wide overview and metrics."
              : "Your business at a glance."
            }
          </p>
        </div>
      </div>
      
       <Card>
          <CardHeader>
              <CardTitle>View As Role (Simulator)</CardTitle>
              <CardDescription>Select a role to see how the application sidebar and dashboard changes. Your actual permissions are based on your logged-in account ({userRole}).</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="max-w-xs space-y-2">
                <Label htmlFor="role-simulator">Simulate Role</Label>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role-simulator"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </CardContent>
       </Card>

       {CurrentRoleInfo && (
        <Alert>
          <CurrentRoleInfo.icon className="h-4 w-4" />
          <AlertTitle>You are viewing as: {CurrentRoleInfo.title}</AlertTitle>
          <AlertDescription>{CurrentRoleInfo.description}</AlertDescription>
        </Alert>
      )}

      {renderDashboard()}

    </div>
  );
}
