
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { GstEaseLogo } from "../icons";

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
      <div className="ml-auto flex items-center gap-2">
        <UserNav />
      </div>
    </header>
  );
}
