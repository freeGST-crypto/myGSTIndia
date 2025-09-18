
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
  FilePlus,
  FileMinus,
  Library,
  Scale,
  BookOpen,
  Shield,
  Presentation,
  CalendarPlus,
  ReceiptText,
  ShoppingCart,
  FileSpreadsheet,
  GitCompareArrows,
  BookCopy,
  BookPlus,
  TrendingUp,
  Building,
  LayoutDashboard,
  AreaChart,
  CalendarClock,
  UserSquare,
  BadgeDollarSign,
  Briefcase,
  BadgePercent,
  Wallet,
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


// --- Menu Items Definition ---
// The following array defines the structure of the sidebar navigation.
// Comments indicate the intended user roles for each section.

const menuItems = [
  // == COMMON FEATURES (For both Business Owners & Professionals) ==
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/pricing", label: "Pricing", icon: BadgeDollarSign },
  {
    label: "Billing",
    icon: Receipt,
    subItems: [
      { href: "/invoices", label: "Invoices", icon: ReceiptText },
      { href: "/purchases", label: "Purchases", icon: ShoppingCart },
      { href: "/billing/credit-notes", label: "Credit Notes", icon: FilePlus },
      { href: "/billing/debit-notes", label: "Debit Notes", icon: FileMinus },
    ],
  },
  { href: "/parties", label: "Parties", icon: Users },
  { href: "/items", label: "Items", icon: Warehouse },
  {
    label: "Compliance",
    icon: FileText,
    subItems: [
      { href: "/gst-filings", label: "GST Filings", icon: FileSpreadsheet },
      { href: "/reconciliation", label: "Reconciliation", icon: GitCompareArrows },
      { href: "/compliance/tds-tcs-reports", label: "TDS/TCS Reports", icon: BookCopy },
    ],
  },
  {
    label: "Accounting",
    icon: Calculator,
    subItems: [
      { href: "/accounting/chart-of-accounts", label: "Chart of Accounts", icon: Library },
      { href: "/accounting/journal", label: "Journal Vouchers", icon: BookPlus },
      { href: "/accounting/ledgers", label: "General Ledger", icon: Book },
      { href: "/accounting/trial-balance", label: "Trial Balance", icon: Scale },
      {
        label: "Financial Statements",
        icon: BookOpen,
        subItems: [
          { href: "/accounting/financial-statements/profit-and-loss", label: "Profit & Loss", icon: TrendingUp },
          { href: "/accounting/financial-statements/balance-sheet", label: "Balance Sheet", icon: Landmark },
        ],
      },
    ],
  },
  {
    label: "Reports",
    icon: AreaChart,
    subItems: [
        { href: "/reports/cma-report", label: "CMA Report Generator", icon: Presentation },
    ],
  },
  {
    href: "/legal-documents",
    label: "Legal Documents",
    icon: BookCopy,
  },
  { 
    href: "/book-appointment", 
    label: "Book Appointment", 
    icon: CalendarPlus 
  },

  // == PROFESSIONAL / ADMIN FEATURES ==
  // This section is intended for Professionals (to manage their clients) and Super Admins.
  // It would be hidden from Direct Business Owners.
  {
    label: "Admin",
    icon: Shield,
    subItems: [
      { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/appointments", label: "Appointments", icon: CalendarClock },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/professionals", label: "Professionals", icon: UserSquare },
      { href: "/admin/subscribers", label: "Subscribers", icon: BadgeDollarSign },
    ],
  },

  // == COMMON SETTINGS ==
  { 
    label: "Settings", 
    icon: Settings,
    subItems: [
      { href: "/settings/branding", label: "Company Branding", icon: Building },
      { href: "/settings/users", label: "User Management", icon: Users },
    ],
  },
];

const CollapsibleMenuItem = ({ item, pathname }: { item: any, pathname: string }) => {
  const [isOpen, setIsOpen] = React.useState(
    item.subItems.some((sub: any) => 
      (sub.href && pathname.startsWith(sub.href)) || 
      (sub.subItems && sub.subItems.some((ss: any) => ss.href && pathname.startsWith(ss.href)))
    )
  );

  React.useEffect(() => {
    const checkActive = (subItems: any[]): boolean => {
        return subItems.some(sub => 
            (sub.href && pathname.startsWith(sub.href)) || 
            (sub.subItems && checkActive(sub.subItems))
        );
    };
    setIsOpen(checkActive(item.subItems));
  }, [pathname, item.subItems]);


  return (
    <Collapsible className="w-full" open={isOpen} onOpenChange={setIsOpen}>
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
          <NavMenu items={item.subItems} pathname={pathname}/>
        </CollapsibleContent>
    </Collapsible>
  );
};


const NavMenu = ({ items, pathname }: { items: any[], pathname: string }) => {
  return (
    <SidebarMenu>
      {items.map((item) =>
        item.subItems ? (
          <SidebarMenuItem key={item.label}>
             <CollapsibleMenuItem item={item} pathname={pathname} />
          </SidebarMenuItem>
        ) : (
          <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                as={Link}
                href={item.href}
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                {item.icon && <item.icon />}
                <span>{item.label}</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
};


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
          <NavMenu items={menuItems} pathname={pathname}/>
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
            {/* This header title can be made dynamic later */}
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
