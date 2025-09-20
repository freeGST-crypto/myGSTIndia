
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";

export function Header() {
  // In a real app, this data would come from a user context or API call
  const companyInfo = {
    name: "GSTEase Solutions Pvt. Ltd.",
    gstin: "27ABCDE1234F1Z5",
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-baseline gap-4">
         <h1 className="text-xl font-semibold hidden md:block">{companyInfo.name}</h1>
         <p className="text-sm text-muted-foreground font-mono hidden lg:block">{companyInfo.gstin}</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex">
          <span>Made in India with Love</span>
          <Heart className="size-4 text-red-500 fill-red-500" />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
