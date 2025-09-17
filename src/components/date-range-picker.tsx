// Dummy component for the date range picker
"use client"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export function DateRangePicker({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Input type="text" placeholder="From: 01-04-2024" className="w-full" />
            <Input type="text" placeholder="To: 31-03-2025" className="w-full" />
        </div>
    )
}
