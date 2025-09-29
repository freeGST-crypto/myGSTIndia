
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Calendar } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export const samplePosts = [
    {
        id: "1",
        title: "Decoding GSTR-1 and GSTR-3B: A Guide to Reconciliation",
        description: "Understanding the nuances between GSTR-1 and GSTR-3B is crucial for every business. Dive deep into the common causes of mismatches and how to resolve them effectively to ensure seamless GST compliance.",
        author: "Priya Mehta, CA",
        date: "2024-07-28",
        category: "GST",
        imageUrl: "https://images.unsplash.com/photo-1554224155-1696413565d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmaW5hbmNpYWwlMjBkb2N1bWVudHN8ZW58MHx8fHwxNzU4ODgxMTM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        imageHint: "financial documents",
        shareUrl: "/blog/1"
    },
    {
        id: "2",
        title: "The Ultimate Guide to Choosing the Right Business Structure in India",
        description: "Sole Proprietorship, Partnership, LLP, or a Private Limited Company? Making the right choice at the start can save you from future headaches. We break down the pros and cons of each structure.",
        author: "Rohan Sharma, CS",
        date: "2024-07-25",
        category: "Business Registration",
        imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN0cmF0ZWd5JTIwbWVldGluZ3xlbnwwfHx8fDE3NTg4ODE0ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        imageHint: "business strategy meeting",
        shareUrl: "/blog/2"
    },
    {
        id: "3",
        title: "5 Common Mistakes to Avoid When Filing Your Income Tax Return",
        description: "Tax season doesn't have to be stressful. Learn about the five most common errors taxpayers make and how you can avoid them to ensure a smooth, penalty-free filing experience this year.",
        author: "Anjali Singh, Tax Consultant",
        date: "2024-07-22",
        category: "Income Tax",
        imageUrl: "https://images.unsplash.com/photo-1589949692098-26d0d752de8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx0YXglMjBjYWxjdWxhdG9yfGVufDB8fHx8MTc1ODg4MTQ4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
        imageHint: "tax calculator",
        shareUrl: "/blog/3"
    }
];

export default function BlogPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">ZenithBooks Blog</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Insights on finance, compliance, and business growth in India.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {samplePosts.map(post => (
                    <Card key={post.id} className="flex flex-col overflow-hidden">
                        <div className="relative aspect-video">
                           <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.imageHint} />
                        </div>
                        <CardHeader>
                            <Badge variant="secondary" className="w-fit">{post.category}</Badge>
                            <CardTitle className="mt-2">{post.title}</CardTitle>
                             <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                                <div className="flex items-center gap-1"><User className="size-3"/> {post.author}</div>
                                <div className="flex items-center gap-1"><Calendar className="size-3"/> {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}</div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{post.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/blog/${post.id}`} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                                Read More <ArrowRight className="size-4"/>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

