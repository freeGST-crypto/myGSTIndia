import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"

const invoices = [
  {
    invoice: "INV001",
    customer: "Global Tech Inc.",
    amount: "₹25,000.00",
    status: "Paid",
  },
  {
    invoice: "INV002",
    customer: "Innovate Solutions",
    amount: "₹15,000.00",
    status: "Draft",
  },
  {
    invoice: "INV003",
    customer: "Quantum Leap",
    amount: "₹35,000.00",
    status: "Paid",
  },
  {
    invoice: "INV004",
    customer: "Synergy Corp",
    amount: "₹45,000.00",
    status: "Overdue",
  },
  {
    invoice: "INV005",
    customer: "Apex Enterprises",
    amount: "₹55,000.00",
    status: "Paid",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
                An overview of your 5 most recent invoices.
            </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/invoices">
                View All
                <ArrowUpRight className="h-4 w-4" />
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell>
                  <div className="font-medium">{invoice.customer}</div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.invoice}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={
                      invoice.status === "Paid" ? "default" :
                      invoice.status === "Overdue" ? "destructive" :
                      "secondary"
                    }
                    className={
                        invoice.status === "Paid" ? "bg-green-600" : ""
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{invoice.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
