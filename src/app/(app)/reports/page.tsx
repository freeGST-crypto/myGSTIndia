import { PlaceholderPage } from "@/components/placeholder-page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Presentation } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Generate advanced financial and management reports.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Presentation className="text-primary"/> CMA Report Generator
                        </CardTitle>
                        <CardDescription>
                            Create a detailed Credit Monitoring Arrangement (CMA) report for business loan applications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/reports/cma-report" passHref>
                            <Button>
                                <span>Go to CMA Generator</span>
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                 <PlaceholderPage 
                    title="Sales Analysis"
                    description="Deep dive into your sales data with custom filters and visualizations. This feature is currently under construction."
                />
                 <PlaceholderPage 
                    title="Purchase Analysis"
                    description="Analyze your purchasing patterns and vendor performance. This feature is currently under construction."
                />
            </div>
        </div>
    );
}
