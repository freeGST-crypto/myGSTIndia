"use client";

import * as React from "react";
import Link from "next/link";
import {
  Book,
  FileText,
  Gauge,
  Landmark,
  Receipt,
  Settings,
  Users,
  Warehouse,
  ChevronDown,
  Calculator,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { GstEaseLogo } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Gauge },
  {
    label: "Billing",
    icon: Receipt,
    subItems: [
      { href: "/invoices", label: "Invoices" },
      { href: "/purchases", label: "Purchases" },
    ],
  },
  { href: "/parties", label: "Parties", icon: Users },
  { href: "/items", label: "Items", icon: Warehouse },
  {
    label: "Compliance",
    icon: FileText,
    subItems: [
      { href: "/gst-filings", label: "GST Filings" },
      { href: "/reconciliation", label: "Reconciliation" },
    ],
  },
  {
    label: "Accounting",
    icon: Calculator,
    subItems: [
      { href: "/accounting/journal", label: "Journal Vouchers" },
      { href: "/accounting/ledgers", label: "Ledgers" },
    ],
  },
  { href: "/reports", label: "Reports", icon: Landmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <GstEaseLogo className="size-8" />
            <h1 className="text-xl font-semibold text-sidebar-primary">GSTEase</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) =>
              item.subItems ? (
                <Collapsible key={item.label} className="w-full">
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-between w-full rounded-md p-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="pl-6">
                      {item.subItems.map((sub) => (
                        <SidebarMenuItem key={sub.label}>
                          <Link href={sub.href} passHref legacyBehavior>
                            <SidebarMenuButton
                              isActive={pathname === sub.href}
                              asChild
                            >
                              <a>{sub.label}</a>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      asChild
                    >
                      <a>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2 bg-sidebar-border" />
          <p className="p-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
            © 2024 GSTEase Inc.
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card p-4 lg:h-[60px]">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
