
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const samplePosts = [
    {
        id: "1",
        title: "Understanding Input Tax Credit (ITC) under GST",
        author: "Priya Mehta, CA",
        date: "2024-06-15",
        category: "GST",
        excerpt: "Input Tax Credit (ITC) is the backbone of the GST regime. This article breaks down the conditions for claiming ITC, common pitfalls to avoid, and best practices for reconciliation.",
        imageUrl: "https://picsum.photos/seed/blog1/600/400",
        imageHint: "tax documents calculator",
    },
    {
        id: "2",
        title: "The Importance of Accurate Bookkeeping for Startups",
        author: "Rohan Sharma, Accountant",
        date: "2024-06-10",
        category: "Finance",
        excerpt: "For startups, maintaining clean and accurate books is not just about compliance; it's about survival. Discover why proper bookkeeping from day one is crucial for fundraising, decision-making, and long-term success.",
        imageUrl: "https://picsum.photos/seed/blog2/600/400",
        imageHint: "ledger books desk",
    },
    {
        id: "3",
        title: "Navigating Cross-Border Transactions: A Guide to Form 15CA/CB",
        author: "Anjali Singh, CS",
        date: "2024-06-05",
        category: "International Trade",
        excerpt: "Making payments to foreign entities involves specific compliance requirements under the Income Tax Act. Learn about the significance of Form 15CA and 15CB and when you need to file them.",
        imageUrl: "https://picsum.photos/seed/blog3/600/400",
        imageHint: "globe currency",
    },
];

export default function BlogPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">GSTEase Blog</h1>
                <p className="mt-2 text-lg text-muted-foreground">Insights on Taxation, Finance, and International Trade from our experts.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {samplePosts.map(post => (
                    <Card key={post.id} className="flex flex-col overflow-hidden">
                        <div className="relative aspect-video">
                            <Image 
                                src={post.imageUrl} 
                                alt={post.title} 
                                layout="fill" 
                                objectFit="cover"
                                data-ai-hint={post.imageHint}
                            />
                        </div>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{post.category}</Badge>
                            </div>
                            <CardTitle className="mt-2 text-xl">{post.title}</CardTitle>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <User className="size-3"/>
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-3"/>
                                    <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{post.excerpt}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Link href="#" passHref>
                                <Button variant="outline">
                                    Read More <ArrowRight className="ml-2 size-4"/>
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
