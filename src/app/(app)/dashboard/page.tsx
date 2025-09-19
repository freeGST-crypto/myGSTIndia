
"use client";

// This page is now redundant as the root page.tsx serves as the dashboard.
// Kept for routing purposes but can be removed if routes are restructured.
import DashboardContent from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
    return <DashboardContent />;
}
