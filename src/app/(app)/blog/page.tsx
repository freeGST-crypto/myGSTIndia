
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SocialShareButtons } from "@/components/social-share-buttons";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const samplePosts = [
    {
        id: "4",
        title: "India's New Big Four: Answering the Call for a Self-Reliant Nation",
        author: "The ZenithBooks Team",
        date: "2024-06-25",
        category: "National Vision",
        excerpt: "Prime Minister Modi's call for Indian firms to rival the 'Big Four' is more than a statement—it's a mission. Discover how technology is empowering a million smaller firms to collectively become the new titans of the industry.",
        content: [
            "In a powerful address, Prime Minister Narendra Modi articulated a vision that resonates with the core of our national ambition: for India to have its own 'Big Four' in accounting and professional services. This isn't just about replacing foreign names with Indian ones; it's a call to build institutions that are globally competitive, technologically advanced, and deeply rooted in the Indian ethos. The dominance of a few global firms is being challenged not by a few large competitors, but by the collective might of a million smaller, tech-enabled Indian firms.",
            "The dream of an 'Aatmanirbhar Bharat' (Self-Reliant India) finds its most potent expression in the services sector. For decades, Indian professionals have been the backbone of global corporations. Now, it's time to build our own tables, not just have a seat at theirs. The challenge is immense—the Big Four have scale, legacy, and vast resources. But the opportunity is even greater. The Indian economy is on a trajectory of unprecedented growth, and it needs an advisory and compliance ecosystem that is agile, accessible, and aligned with its unique needs.",
            "This is where technology becomes the great equalizer. At ZenithBooks, we believe we are not just building software; we are building the digital infrastructure for this revolution. Our platform is designed to arm every local CA, advocate, and tax professional with the same cutting-edge tools that were once the exclusive domain of large corporations. By unifying compliance, automating complex processes, and providing AI-powered insights, we are empowering a distributed network of experts to deliver world-class service. The future isn't a new 'Big Four'; it's a 'Big Million', and ZenithBooks is proud to be their platform of choice."
        ],
        imageUrl: PlaceHolderImages.find(p => p.id === 'blog-4')?.imageUrl || "https://picsum.photos/seed/blog4/600/400",
        imageHint: PlaceHolderImages.find(p => p.id === 'blog-4')?.imageHint || "indian leader",
        shareUrl: "/blog/4"
    },
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
        imageUrl: "https://images.unsplash.com/photo-1512167976388-41fe84d0e691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHx0YXglMjBkb2N1bWVudHN8ZW58MHx8fHwxNzU4ODgwOTc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        imageHint: "tax documents",
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
        imageUrl: "https://images.unsplash.com/photo-1588859959931-39983ccaff7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxhY2NvdW50aW5nJTIwY2hhcnRzfGVufDB8fHx8MTc1ODg4MDk3OXww&ixlib=rb-4.1.0&q=80&w=1080",
        imageHint: "accounting charts",
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
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold">ZenithBooks Blog</h1>
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
