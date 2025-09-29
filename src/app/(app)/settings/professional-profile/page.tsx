
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, Upload } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function ProfessionalProfilePage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
        toast({
            title: "Profile Saved",
            description: "Your professional profile has been updated."
        });
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Professional Profile</h1>
                <p className="text-muted-foreground">This information will be visible to clients seeking professional services.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input defaultValue="Rohan Sharma"/>
                        </div>
                         <div className="space-y-2">
                            <Label>Firm Name</Label>
                            <Input defaultValue="Sharma & Associates"/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Professional Title / Qualification</Label>
                        <Input defaultValue="Chartered Accountant, B.Com"/>
                    </div>
                     <div className="space-y-2">
                        <Label>About / Bio</Label>
                        <Textarea className="min-h-24" placeholder="Write a brief bio..." defaultValue="A seasoned Chartered Accountant with over 10 years of experience in GST, income tax, and corporate advisory. Specializing in helping SMEs navigate the complex Indian tax landscape."/>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Branding & Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Image src="https://picsum.photos/seed/user/120/120" alt="Profile Picture" width={120} height={120} className="rounded-full border"/>
                        <div className="space-y-2">
                            <Label>Profile Picture</Label>
                            <Input type="file" className="max-w-xs"/>
                            <p className="text-xs text-muted-foreground">Recommended: Square image, at least 200x200px.</p>
                        </div>
                    </div>
                    <Separator/>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input type="email" defaultValue="rohan.sharma@example.com"/>
                        </div>
                         <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input type="tel" defaultValue="+91 98765 43210"/>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button onClick={handleSaveChanges}>
                        <Save className="mr-2"/>
                        Save Profile
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

