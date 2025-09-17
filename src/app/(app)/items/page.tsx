
import { PlaceholderPage } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ItemsPage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="text-primary"/> 
                        AI-Powered HSN Code Suggestion
                    </CardTitle>
                    <CardDescription>
                        Not sure about the HSN code for your product or service? Use our AI tool to get an accurate suggestion.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Properly classifying your goods and services with the correct HSN/SAC code is crucial for GST compliance. Our intelligent assistant analyzes your item's description to recommend the most suitable code, helping you avoid errors in your tax filings.
                    </p>
                    <Link href="/items/suggest-hsn" passHref>
                        <Button>
                            <span>Launch HSN Suggester</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <PlaceholderPage 
                title="Products & Services"
                description="Manage your items, including products and services. You can add, edit, and view all your company's offerings here. This feature is currently under construction."
            />
        </div>
    );
}
