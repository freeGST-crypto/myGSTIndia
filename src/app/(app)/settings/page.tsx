
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Users, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from "@/lib/firebase";
import { doc } from "firebase/firestore";

const SUPER_ADMIN_EMAIL = 'smr@smr.com';

export default function SettingsPage() {
    const [user] = useAuthState(auth);
    const userDocRef = user ? doc(db, 'users', user.uid) : null;
    const [userData, loading, error] = useDocumentData(userDocRef);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin size-8 text-primary" />
            </div>
        );
    }
    
    const userRole = user?.email === SUPER_ADMIN_EMAIL ? 'super_admin' : userData?.userType;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your application and company settings.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Building className="text-primary"/> Company Branding
                        </CardTitle>
                        <CardDescription>
                            Manage your company logo, address, GSTIN, and default invoice terms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/settings/branding" passHref>
                            <Button>
                                <span>Go to Branding</span>
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Users className="text-primary"/> User Management
                        </CardTitle>
                        <CardDescription>
                            Invite and manage your team members and their roles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/settings/users" passHref>
                            <Button>
                                <span>Manage Users</span>
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                
                {userRole === 'professional' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                            <Briefcase className="text-primary"/> Professional Profile
                            </CardTitle>
                            <CardDescription>
                                Manage your public profile, expertise, and firm details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/settings/professional-profile" passHref>
                                <Button>
                                    <span>Update Profile</span>
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
