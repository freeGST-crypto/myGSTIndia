

"use client";

import * as React from "react";
import Link from "next/link";
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
  useSidebar,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { 
    GstEaseLogo, Book, FileText, Gauge, Landmark, Receipt, Settings, Users, 
    Warehouse, ChevronDown, Calculator, FilePlus, FileMinus, Library, Scale, 
    BookOpen, Shield, Presentation, CalendarClock, UserSquare, BadgeDollarSign, 
    Briefcase, BadgePercent, Wallet, ShieldCheck, Award, CreditCard, Heart, 
    BookCopy, ShoppingCart, ShoppingBag, Loader2, GitCompareArrows, FileSpreadsheet, 
    Building, TrendingUp, AreaChart, ConciergeBell, LayoutDashboard, MailWarning, 
    FileSignature, Newspaper, Info, Contact, Keyboard, PieChart, Boxes, Weight, 
    Target, UserCog, FileArchive 
} from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from '@/lib/firebase';
import { doc } from "firebase/firestore";
import { Header } from "@/components/layout/header";
import { ClientOnly } from "@/components/client-only";
import { AccountingProvider } from "@/context/accounting-context";
import { Suspense, useEffect } from "react";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Fab } from "@/components/layout/fab";

const SUPER_ADMIN_UID = 'CUxyL5ioNjcQbVNszXhWGAFKS2y2';

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge, roles: ['business', 'professional', 'super_admin'] },
  {
    label: "Billing",
    icon: Receipt,
    roles: ['business', 'professional'],
    subItems: [
      { href: "/billing/invoices", label: "Invoices", icon: Receipt, roles: ['business', 'professional'] },
      { href: "/billing/sales-orders", label: "Sales Orders", icon: ShoppingBag, roles: ['business', 'professional'] },
      { href: "/purchases", label: "Purchases", icon: ShoppingCart, roles: ['business', 'professional'] },
      { href: "/purchases/purchase-orders", label: "Purchase Orders", icon: ShoppingCart, roles: ['business', 'professional'] },
      { href: "/billing/credit-notes", label: "Credit Notes", icon: FilePlus, roles: ['business', 'professional'] },
      { href: "/billing/debit-notes", label: "Debit Notes", icon: FileMinus, roles: ['business', 'professional'] },
    ],
  },
  { href: "/parties", label: "Parties", icon: Users, roles: ['business', 'professional'] },
  {
    label: "Items",
    icon: Warehouse,
    roles: ['business', 'professional'],
    subItems: [
        { href: "/items", label: "Stock Items", icon: Warehouse, roles: ['business', 'professional'] },
        { href: "/items/stock-groups", label: "Stock Groups", icon: Boxes, roles: ['business', 'professional'] },
        { href: "/items/units", label: "Units of Measure", icon: Weight, roles: ['business', 'professional'] },
        { href: "/items/godowns", label: "Godowns / Locations", icon: Building, roles: ['business', 'professional'] },
    ]
  },
  {
    label: "GST Compliance",
    icon: FileText,
    roles: ['business', 'professional'],
    subItems: [
      { href: "/gst-filings", label: "GST Filings", icon: FileSpreadsheet, roles: ['business', 'professional'] },
      { href: "/reconciliation", label: "Reconciliation", icon: GitCompareArrows, roles: ['business', 'professional'] },
      { href: "/compliance/tds-tcs-reports", label: "TDS/TCS Reports", icon: BookCopy, roles: ['business', 'professional'] },
    ],
  },
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
      { href: "/accounting/bank-reconciliation", label: "Bank Reconciliation", icon: Landmark, roles: ['business', 'professional'] },
      { href: "/accounting/cost-centres", label: "Cost Centres", icon: PieChart, roles: ['business', 'professional'] },
      { href: "/accounting/cost-centre-summary", label: "Cost Centre Summary", icon: PieChart, roles: ['business', 'professional'] },
      { href: "/accounting/budgets", label: "Budgets & Scenarios", icon: Target, roles: ['business', 'professional']},
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
  { href: "/notices", label: "Handle Notices", icon: MailWarning, roles: ['business', 'professional'] },
  {
    href: "/professional-services",
    label: "Professional Services",
    icon: ConciergeBell,
    roles: ['business', 'professional', 'super_admin']
  },
  {
    label: "Payroll",
    icon: UserCog,
    roles: ['business', 'professional'],
    subItems: [
      { href: "/payroll", label: "Payroll Dashboard", icon: LayoutDashboard, roles: ['business', 'professional'] },
      { href: "/payroll/employees", label: "Employees", icon: Users, roles: ['business', 'professional'] },
      { href: "/payroll/run-payroll", label: "Run Payroll", icon: FileText, roles: ['business', 'professional'] },
      { href: "/payroll/reports", label: "Compliance Reports", icon: FileArchive, roles: ['business', 'professional'] },
      { href: "/payroll/settings", label: "Settings", icon: Settings, roles: ['business', 'professional'] },
    ],
  },
  {
    label: "Resources",
    icon: Info,
    roles: ['business', 'professional', 'super_admin'],
    subItems: [
        { href: "/about", label: "About Us", icon: Info, roles: ['business', 'professional', 'super_admin'] },
        { href: "/blog", label: "Blog", icon: Newspaper, roles: ['business', 'professional', 'super_admin'] },
        { href: "/app-shortcuts", label: "App Shortcuts", icon: Keyboard, roles: ['business', 'professional', 'super_admin'] },
        { href: "/contact", label: "Contact Us", icon: Contact, roles: ['business', 'professional', 'super_admin'] },
    ],
  },
  { href: "/pricing", label: "Pricing", icon: BadgeDollarSign, roles: ['business', 'professional', 'super_admin'] },
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
  {
    label: "Client Workspace",
    icon: Briefcase,
    roles: ['professional'],
    subItems: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['professional']},
        { href: "/admin/users", label: "User & Client Management", icon: Users, roles: ['professional']},
    ]
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
        { href: "/admin/blog", label: "Manage Blog", icon: Newspaper, roles: ['super_admin'] },
    ]
  },
];

const CollapsibleMenuItem = ({ item, pathname }: { item: any, pathname: string }) => {
  const [isOpen, setIsOpen] = React.useState(
    item.subItems?.some((subItem: any) => pathname.startsWith(subItem.href)) || false
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
          <SidebarMenuButton
            size="lg"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems.map((subItem: any, index: number) => (
              <SidebarMenuSubItem key={index}>
                {subItem.subItems ? (
                   <CollapsibleMenuItem item={subItem} pathname={pathname} />
                ) : (
                  <Link href={subItem.href} passHref>
                     <SidebarMenuSubButton
                      asChild
                      isActive={pathname.startsWith(subItem.href)}
                      className="w-full"
                    >
                      <>
                        <subItem.icon className="h-6 w-6" />
                        <span>{subItem.label}</span>
                      </>
                    </SidebarMenuSubButton>
                  </Link>
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
    </Collapsible>
  )
}


function NavMenu({ role }: { role: string }) {
  const pathname = usePathname();

  const filteredMenu = React.useMemo(() => {
    const filterItems = (items: any[]): any[] => {
      return items
        .filter(item => item.roles.includes(role))
        .map(item => {
          if (item.subItems) {
            const filteredSubItems = filterItems(item.subItems);
            if (filteredSubItems.length > 0) {
              return { ...item, subItems: filteredSubItems };
            }
            // If a menu item has no visible sub-items, don't show it, unless it also has a direct href
            return item.href ? { ...item, subItems: [] } : null;
          }
          return item;
        })
        .filter(Boolean);
    };
    return filterItems(allMenuItems);
  }, [role]);

  return (
    <SidebarMenu>
      {filteredMenu.map((item, index) => (
        <SidebarMenuItem key={index}>
          {item.subItems && item.subItems.length > 0 ? (
            <CollapsibleMenuItem item={item} pathname={pathname} />
          ) : (
            <Link href={item.href}>
              <SidebarMenuButton
                size="lg"
                isActive={pathname.startsWith(item.href)}
                className="w-full justify-start"
              >
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// This new component will contain the logic that needs the sidebar context
function SidebarNavManager() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return null; // This component doesn't render anything
}


function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, loadingAuth] = useAuthState(auth);
  const userDocRef = user ? doc(db, 'users', user.uid) : null;
  const [userData, loadingUser] = useDocumentData(userDocRef);
  const [simulatedRole, setSimulatedRole] = React.useState<string | null>(null);
  
  const router = useRouter();

  const hotkeys = new Map([
    ['ctrl+i', () => router.push('/billing/invoices/new')],
    ['ctrl+p', () => router.push('/purchases/new')],
    ['ctrl+j', () => router.push('/accounting/journal')],
    ['ctrl+r', () => router.push('/accounting/vouchers')],
    ['ctrl+b', () => router.push('/accounting/financial-statements/balance-sheet')],
    ['ctrl+l', () => router.push('/accounting/financial-statements/profit-and-loss')],
    ['ctrl+g', () => router.push('/accounting/ledgers')],
    ['alt+t', () => router.push('/accounting/trial-balance')],
    ['alt+n', () => router.push('/billing/credit-notes/new')],
    ['ctrl+d', () => router.push('/billing/debit-notes/new')],
    ['alt+p', () => router.push('/parties')],
    ['alt+i', () => router.push('/items')],
    ['escape', () => router.push('/dashboard')],
  ]);
  useHotkeys(hotkeys);

  const getRole = () => {
    if (simulatedRole) return simulatedRole;
    if (!user) return 'business';
    if (user.uid === SUPER_ADMIN_UID) return 'super_admin';
    return userData?.userType || 'business';
  }
  
  const userRole = getRole();
  
  const modifiedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child) && (child.type as any).name === 'AdminDashboardPage') {
      return React.cloneElement(child, { setSimulatedRole } as any);
    }
    return child;
  });

  return (
    <AccountingProvider>
      <SidebarProvider>
        <SidebarNavManager /> 
        <Sidebar
          collapsible="icon"
          className="border-sidebar-border"
        >
          <SidebarHeader>
            <GstEaseLogo className="h-9 w-auto group-data-[collapsible=icon]:h-8" />
          </SidebarHeader>
          <Separator />
          <SidebarContent>
            {loadingAuth || loadingUser ? (
              <div className="p-2 space-y-2">
                {Array.from({length: 8}).map((_, i) => <Loader2 key={i} className="animate-spin text-sidebar-foreground/50"/>)}
              </div>
            ) : (
              <NavMenu role={userRole} />
            )}
          </SidebarContent>
          <SidebarFooter>
            <Separator />
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="justify-start w-full" size="lg">
                    <Heart className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Feedback</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Header />
          {/* Add pb-24 for bottom nav and fab */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background pt-8 sm:pt-8 md:pb-6 pb-24">
             <Suspense fallback={<Loader2 className="animate-spin" />}>
                {modifiedChildren}
            </Suspense>
          </main>
          <Fab />
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
    </AccountingProvider>
  );
}

export default AppLayout;
