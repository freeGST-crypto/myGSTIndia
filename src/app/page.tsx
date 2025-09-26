
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GstEaseLogo } from "@/components/icons";
import { AnimatePresence, motion } from "framer-motion";

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
    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, (features.length + 1) * 2000); // Wait for all features to display + 1 cycle

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 2000); // Change feature every 2 seconds

    return () => {
        clearTimeout(redirectTimer);
        clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <GstEaseLogo className="h-24 w-24 text-primary" />
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">GSTEase</h1>
            <p className="text-lg text-muted-foreground">Your All-in-One Compliance Partner</p>
        </div>
        <div className="mt-8 h-8 text-center text-xl font-medium text-primary">
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
      </div>
    </div>
  );
}
