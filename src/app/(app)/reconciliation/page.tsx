import { PlaceholderPage } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, GitCompareArrows } from "lucide-react";

export default function ReconciliationPage() {
    return (
        <div className="space-y-8">
            <PlaceholderPage 
                title="AI-Powered Reconciliation"
                description="Leverage AI to compare documents, identify discrepancies, and ensure compliance. Upload your files below to get started."
            />
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileUp className="text-primary"/> AI-Powered ITC Reconciliation</CardTitle>
                        <CardDescription>Upload your GSTR-2B CSV and purchase bills to identify discrepancies.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="gstr2b">GSTR-2B (.csv)</Label>
                            <Input id="gstr2b" type="file" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="purchases">Purchase Bills (JSON/CSV)</Label>
                            <Input id="purchases" type="file" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Reconcile ITC</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GitCompareArrows className="text-primary"/> AI-Powered GSTR Comparison</CardTitle>
                        <CardDescription>Compare GSTR-1 and GSTR-3B filings to find variances and get suggestions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="gstr1">GSTR-1 (.csv)</Label>
                            <Input id="gstr1" type="file" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="gstr3b">GSTR-3B (.csv)</Label>
                            <Input id="gstr3b" type="file" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Compare Filings</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
