
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })

  return (
    <div className={cn("grid gap-2", className)}>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date-from"
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal",
                    !date?.from && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? format(date.from, "PPP") : <span>From Date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="single"
                    selected={date?.from}
                    onSelect={(day) => setDate(prev => ({...prev, from: day}))}
                    numberOfMonths={1}
                />
                </PopoverContent>
            </Popover>
            <span className="text-muted-foreground hidden sm:inline-block">-</span>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date-to"
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal",
                    !date?.to && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.to ? format(date.to, "PPP") : <span>To Date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="single"
                    selected={date?.to}
                    onSelect={(day) => setDate(prev => ({...prev, to: day}))}
                    numberOfMonths={1}
                />
                </PopoverContent>
            </Popover>
        </div>
    </div>
  )
}
