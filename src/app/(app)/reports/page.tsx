
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Presentation, TrendingUp, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Financial & Management Reports</h1>
                <p className="text-muted-foreground">Generate advanced reports for loans, analysis, and management.</p>
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
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <TrendingUp className="text-primary"/> Sales Analysis
                        </CardTitle>
                        <CardDescription>
                            Deep dive into your sales data with custom filters and visualizations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Link href="/reports/sales-analysis" passHref>
                            <Button disabled variant="outline">Coming Soon</Button>
                        </Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <ShoppingCart className="text-primary"/> Purchase Analysis
                        </CardTitle>
                        <CardDescription>
                            Analyze your purchasing patterns and vendor performance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/reports/purchase-analysis" passHref>
                            <Button disabled variant="outline">Coming Soon</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
