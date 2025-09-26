
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SocialShareButtons } from "@/components/social-share-buttons";

export const samplePosts = [
    {
        id: "1",
        title: "Understanding Input Tax Credit (ITC) under GST",
        author: "Priya Mehta, CA",
        date: "2024-06-15",
        category: "GST",
        excerpt: "Input Tax Credit (ITC) is the backbone of the GST regime. This article breaks down the conditions for claiming ITC, common pitfalls to avoid, and best practices for reconciliation.",
        content: [
            "Input Tax Credit (ITC) is the tax that a business pays on a purchase and that it can use to reduce its tax liability when it makes a sale. In other words, businesses can reduce their tax liability by claiming credit to the extent of GST paid on purchases. It is a mechanism to avoid 'tax on tax' (cascading taxes).",
            "To claim ITC, a registered person must meet several conditions. These include being in possession of a tax invoice or debit note, having received the goods or services, the tax charged having been actually paid to the government, and having filed the necessary GST returns. It's crucial for businesses to meticulously document and verify these conditions for every claim.",
            "Common pitfalls include clerical errors in invoices, mismatches between GSTR-1 and GSTR-2B, and non-payment of tax by the supplier. Regular reconciliation is the key to maximizing your ITC claim and avoiding notices from the tax department. Use tools like GSTEase to automate this process and ensure compliance."
        ],
        imageUrl: "https://picsum.photos/seed/blog1/600/400",
        imageHint: "tax documents calculator",
        shareUrl: "/blog/1"
    },
    {
        id: "2",
        title: "The Importance of Accurate Bookkeeping for Startups",
        author: "Rohan Sharma, Accountant",
        date: "2024-06-10",
        category: "Finance",
        excerpt: "For startups, maintaining clean and accurate books is not just about compliance; it's about survival. Discover why proper bookkeeping from day one is crucial for fundraising, decision-making, and long-term success.",
        content: [
            "For startups, accurate bookkeeping is the bedrock of financial health and investor confidence. It provides a clear picture of your business's performance, enabling informed strategic decisions. Without it, you're flying blind, unable to track cash flow, manage expenses, or forecast growth.",
            "Clean financial records are non-negotiable when it comes to fundraising. Investors will conduct due diligence, and organized books demonstrate professionalism, transparency, and a solid understanding of your business's financial position. It builds trust and significantly increases your chances of securing investment.",
            "Beyond fundraising, proper accounting is essential for tax compliance, budgeting, and identifying areas for cost-saving. Implementing a robust system from day one, even with simple tools, saves immense headaches down the line and sets your startup on a path to sustainable growth."
        ],
        imageUrl: "https://picsum.photos/seed/blog2/600/400",
        imageHint: "ledger books desk",
        shareUrl: "/blog/2"
    },
    {
        id: "3",
        title: "Navigating Cross-Border Transactions: A Guide to Form 15CA/CB",
        author: "Anjali Singh, CS",
        date: "2024-06-05",
        category: "International Trade",
        excerpt: "Making payments to foreign entities involves specific compliance requirements under the Income Tax Act. Learn about the significance of Form 15CA and 15CB and when you need to file them.",
        content: [
            "When an Indian resident makes a payment to a non-resident, they must ensure that any applicable taxes are deducted at source (TDS). Form 15CA is a declaration filed by the remitter, used as a tool by the Income Tax Department to track foreign remittances and their taxability.",
            "Form 15CB is a certificate issued by a Chartered Accountant. It is required when the remittance amount exceeds Rs. 5 lakh in a financial year and the payment is taxable in India. The CA certifies the details of the payment, TDS rates, and compliance with the provisions of the Income-tax Act and any applicable Double Taxation Avoidance Agreement (DTAA).",
            "There are four parts to Form 15CA. Part A is for remittances not exceeding Rs. 5 lakh that are taxable. Part B is for remittances exceeding Rs. 5 lakh that are taxable, requiring a Form 15CB certificate. Part C is for remittances that are not taxable. Part D is for remittances that are not taxable under domestic law, but are taxable under DTAA. Understanding which part to file is crucial for compliance."
        ],
        imageUrl: "https://picsum.photos/seed/blog3/600/400",
        imageHint: "globe currency",
        shareUrl: "/blog/3"
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
                        <CardFooter className="flex justify-between items-center">
                             <Link href={`/blog/${post.id}`} passHref>
                                <Button variant="outline">
                                    Read More <ArrowRight className="ml-2 size-4"/>
                                </Button>
                            </Link>
                             <SocialShareButtons url={post.shareUrl} title={post.title} />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
