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

type Invoice = {
  invoice: string;
  customer: string;
  amount: string;
  status: string;
};

type RecentActivityProps = {
  invoices: Invoice[];
};

export function RecentActivity({ invoices }: RecentActivityProps) {
  return (
    <>
       <div className="flex items-center justify-between mb-4">
        <div className="grid gap-2">
            <h3 className="text-xl font-semibold">Recent Invoices</h3>
            <p className="text-sm text-muted-foreground">
                An overview of your 5 most recent invoices.
            </p>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/invoices">
                View All
                <ArrowUpRight className="h-4 w-4" />
            </Link>
        </Button>
      </div>
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
    </>
  )
}
