
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
  CalendarClock,
  UserSquare,
  BadgeDollarSign,
  Briefcase,
  BadgePercent,
  Wallet,
  ShieldCheck,
  Award,
  CreditCard,
  Heart,
  BookCopy,
  ShoppingCart,
  ShoppingBag,
  Loader2,
  GitCompareArrows,
  FileSpreadsheet,
  Building,
  TrendingUp,
  AreaChart,
  ConciergeBell,
  LayoutDashboard
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Header } from "@/components/layout/header";
import { AccountingProvider } from "@/context/accounting-context";


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
      { href: "/invoices", label: "Invoices", icon: Receipt },
      { href: "/purchases", label: "Purchases", icon: ShoppingCart },
      { href: "/purchases/purchase-orders", label: "Purchase Orders", icon: ShoppingBag },
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
      { href: "/accounting/vouchers", label: "Receipt & Payment Vouchers", icon: Wallet },
      { href: "/accounting/journal", label: "Journal Vouchers", icon: BookCopy },
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
    href: "/ca-certificates", 
    label: "CA Certificates", 
    icon: Award 
  },
  {
    href: "/legal-documents",
    label: "Legal Documents",
    icon: BookCopy,
  },
  {
    href: "/professional-services",
    label: "Professional Services",
    icon: ConciergeBell,
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
      { href: "/admin/certification-requests", label: "Certification Requests", icon: ShieldCheck },
      { href: "/admin/service-pricing", label: "Service Pricing", icon: CreditCard },
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
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Only run on client-side
    if (item.subItems) {
      const checkActive = (subItems: any[]): boolean => {
          return subItems.some(sub => 
              (sub.href && pathname.startsWith(sub.href)) || 
              (sub.subItems && checkActive(sub.subItems))
          );
      };
      setIsOpen(checkActive(item.subItems));
    }
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


const NavMenu = ({ items, pathname }: { items: any[], pathname: string }) => (
  <SidebarMenu>
    {items.map((item, index) => (
      <SidebarMenuItem key={index}>
        {item.subItems ? (
          <CollapsibleMenuItem item={item} pathname={pathname} />
        ) : (
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              className="w-full"
            >
              <item.icon className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        )}
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
);


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      );
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <AccountingProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <GstEaseLogo className="size-8 shrink-0" />
              <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
                GSTEase
              </span>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent>
              <NavMenu items={menuItems} pathname={pathname} />
          </SidebarContent>
          <SidebarFooter>
            {/* Footer content can go here if needed in the future */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AccountingProvider>
  );
}
