
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GstEaseLogo } from "@/components/icons";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  "Quick Invoices",
  "Easy Purchases",
  "Automated Accounting",
  "Financial Reports",
  "GST Compliance",
  "CA Certificates",
  "Legal Documents",
  "And much more...",
];

export default function SplashScreen() {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 2000); // Change feature every 2 seconds

    return () => {
        clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <GstEaseLogo className="h-24 w-24 text-primary" />
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">GSTEase</h1>
            <p className="text-lg text-muted-foreground">Your All-in-One Compliance Partner</p>
        </div>
        <div className="mt-8 h-8 text-xl font-medium text-primary">
            <AnimatePresence mode="wait">
                <motion.div
                    key={features[index]}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    {features[index]}
                </motion.div>
            </AnimatePresence>
        </div>
         <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <Button asChild size="lg" className="w-full">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
                <Link href="/signup">Sign Up</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
