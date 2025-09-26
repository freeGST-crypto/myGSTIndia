"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GstEaseLogo } from "@/components/icons";
import { Loader2 } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <GstEaseLogo className="h-24 w-24 text-primary animate-pulse" />
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">GSTEase</h1>
            <p className="text-lg text-muted-foreground">Your All-in-One Compliance Partner</p>
        </div>
        <Loader2 className="mt-8 h-6 w-6 animate-spin" />
      </div>
    </div>
  );
}
