
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
  LayoutDashboard,
  MailWarning,
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
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';
import { Header } from "@/components/layout/header";
import { ClientOnly } from "@/components/client-only";
import { AccountingProvider } from "@/context/accounting-context";
import { Suspense } from "react";

const SUPER_ADMIN_UID = 'CUxyL5ioNjcQbVNszXhWGAFKS2y2';

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge, roles: ['business', 'professional', 'super_admin'] },
  { href: "/pricing", label: "Pricing", icon: BadgeDollarSign, roles: ['business', 'professional', 'super_admin'] },
  {
    label: "Billing",
    icon: Receipt,
    roles: ['business', 'professional'],
    subItems: [
      { href: "/billing/invoices", label: "Invoices", icon: Receipt, roles: ['business', 'professional'] },
      { href: "/purchases", label: "Purchases", icon: ShoppingCart, roles: ['business', 'professional'] },
      { href: "/purchases/purchase-orders", label: "Purchase Orders", icon: ShoppingBag, roles: ['business', 'professional'] },
      { href: "/billing/credit-notes", label: "Credit Notes", icon: FilePlus, roles: ['business', 'professional'] },
      { href: "/billing/debit-notes", label: "Debit Notes", icon: FileMinus, roles: ['business', 'professional'] },
    ],
  },
  { href: "/parties", label: "Parties", icon: Users, roles: ['business', 'professional'] },
  { href: "/items", label: "Items", icon: Warehouse, roles: ['business', 'professional'] },
  {
    label: "Compliance",
    icon: FileText,
    roles: ['business', 'professional'],
    subItems: [
      { href: "/gst-filings", label: "GST Filings", icon: FileSpreadsheet, roles: ['business', 'professional'] },
      { href: "/reconciliation", label: "Reconciliation", icon: GitCompareArrows, roles: ['business', 'professional'] },
      { href: "/compliance/tds-tcs-reports", label: "TDS/TCS Reports", icon: BookCopy, roles: ['business', 'professional'] },
    ],
  },
  { href: "/notices", label: "Handle Notices", icon: MailWarning, roles: ['business', 'professional'] },
  {
    label: "Accounting",
    icon: Calculator,
    roles: ['business', 'professional'],
    subItems: [
      { href: "/accounting/chart-of-accounts", label: "Chart of Accounts", icon: Library, roles: ['business', 'professional'] },
      { href: "/accounting/vouchers", label: "Receipt & Payment Vouchers", icon: Wallet, roles: ['business', 'professional'] },
      { href: "/accounting/journal", label: "Journal Vouchers", icon: BookCopy, roles: ['business', 'professional'] },
      { href: "/accounting/ledgers", label: "General Ledger", icon: Book, roles: ['business', 'professional'] },
      { href: "/accounting/trial-balance", label: "Trial Balance", icon: Scale, roles: ['business', 'professional'] },
      {
        label: "Financial Statements",
        icon: BookOpen,
        roles: ['business', 'professional'],
        subItems: [
          { href: "/accounting/financial-statements/profit-and-loss", label: "Profit & Loss", icon: TrendingUp, roles: ['business', 'professional'] },
          { href: "/accounting/financial-statements/balance-sheet", label: "Balance Sheet", icon: Landmark, roles: ['business', 'professional'] },
        ],
      },
    ],
  },
  {
    label: "Reports",
    icon: AreaChart,
    roles: ['business', 'professional'],
    subItems: [
        { href: "/reports/cma-report", label: "CMA Report Generator", icon: Presentation, roles: ['business', 'professional'] },
    ],
  },
   { 
    href: "/ca-certificates", 
    label: "CA Certificates", 
    icon: Award,
    roles: ['business', 'professional']
  },
  {
    href: "/legal-documents",
    label: "Legal Documents",
    icon: Shield,
    roles: ['business', 'professional']
  },
  {
    href: "/professional-services",
    label: "Professional Services",
    icon: ConciergeBell,
    roles: ['business', 'professional', 'super_admin']
  },
  {
    href: "/admin/dashboard",
    label: "Client Workspace",
    icon: Briefcase,
    roles: ['professional'],
  },
  {
    label: "Admin",
    icon: ShieldCheck,
    roles: ['super_admin'],
    subItems: [
        { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, roles: ['super_admin']},
        { href: "/admin/subscribers", label: "Subscribers", icon: BadgeDollarSign, roles: ['super_admin']},
        { href: "/admin/users", label: "All Users", icon: Users, roles: ['super_admin']},
        { href: "/admin/professionals", label: "Professionals", icon: UserSquare, roles: ['super_admin']},
        { href: "/admin/appointments", label: "Appointments", icon: CalendarClock, roles: ['super_admin']},
        { href: "/admin/notices", label: "Submitted Notices", icon: MailWarning, roles: ['super_admin']},
        { href: "/admin/service-pricing", label: "On-Demand Pricing", icon: CreditCard, roles: ['super_admin']},
        { href: "/admin/certification-requests", label: "Certification Requests", icon: FileSignature, roles: ['super_admin']},
    ]
  },
  { 
    label: "Settings", 
    icon: Settings,
    roles: ['business', 'professional', 'super_admin'],
    subItems: [
      { href: "/settings/branding", label: "Company Branding", icon: Building, roles: ['business', 'professional', 'super_admin'] },
      { href: "/settings/users", label: "User Management", icon: Users, roles: ['business', 'professional', 'super_admin'] },
      { href: "/settings/professional-profile", label: "Professional Profile", icon: Briefcase, roles: ['professional'] },
    ],
  },
];

const CollapsibleMenuItem = ({ item, pathname }: { item: any, pathname: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
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

function filterMenuByRole(menu: any[], role: string): any[] {
  return menu
    .map(item => {
      if (!item.roles || !item.roles.includes(role)) {
        return null;
      }

      if (item.subItems) {
        const filteredSubItems = filterMenuByRole(item.subItems, role);
        if (filteredSubItems.length > 0) {
          return { ...item, subItems: filteredSubItems };
        }
        return item.href ? { ...item, subItems: undefined } : null;
      }
      
      return item;
    })
    .filter(Boolean) as any[];
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  
  const userDocRef = user ? doc(db, 'users', user.uid) : null;
  const [userData, userLoading] = useDocumentData(userDocRef);

  const getRole = () => {
    if (!user) return null;
    if (user.uid === SUPER_ADMIN_UID) return 'super_admin';
    return userData?.userType || 'business';
  }
  
  const userRole = getRole();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || userLoading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      );
  }

  if (!user || !userRole) {
    return null;
  }
  
  const menuItems = filterMenuByRole(allMenuItems, userRole);

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
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 sm:p-6">
            <ClientOnly>
                <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}>
                  {children}
                </Suspense>
            </ClientOnly>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AccountingProvider>
  );
}
