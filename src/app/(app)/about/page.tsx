
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Gem, Goal, Users } from "lucide-react";
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image 
                    src="https://picsum.photos/seed/about/1200/400" 
                    alt="Our Team"
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="office team"
                />
                <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground text-center">About GSTEase</h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Goal /> Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground">
                        Our mission is to simplify financial compliance and management for businesses and professionals across India. We believe that by leveraging technology and automation, we can empower our users to focus on what they do best: growing their business. GSTEase is designed to be an intuitive, all-in-one platform that makes complex tasks like GST filing, accounting, and legal documentation effortless and accurate.
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gem /> Our Values</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full"><Users className="text-primary"/></div>
                            <div>
                                <h3 className="font-semibold">Customer-Centric</h3>
                                <p className="text-sm text-muted-foreground">Our users are at the heart of everything we do. We are committed to building solutions that solve real-world problems.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full"><Building className="text-primary"/></div>
                            <div>
                                <h3 className="font-semibold">Simplicity in Design</h3>
                                <p className="text-sm text-muted-foreground">We strive to make complex processes simple and intuitive, ensuring a seamless user experience.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full"><Goal className="text-primary"/></div>
                            <div>
                                <h3 className="font-semibold">Integrity and Accuracy</h3>
                                <p className="text-sm text-muted-foreground">We are committed to the highest standards of data accuracy and integrity to build trust and ensure compliance.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> The Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            GSTEase is built by a passionate team of chartered accountants, software engineers, and tax experts dedicated to revolutionizing the financial tech landscape in India. Our combined expertise ensures that our platform is not only technologically advanced but also grounded in a deep understanding of India's complex financial regulations.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
