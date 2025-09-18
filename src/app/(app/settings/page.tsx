
import { PlaceholderPage } from "@/components/placeholder-page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Users, Briefcase } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
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
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Briefcase className="text-primary"/> Professional Profile
                        </CardTitle>
                        <CardDescription>
                            Manage your public profile, expertise, and firm details. (For Professionals)
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
            </div>
        </div>
    );
}
