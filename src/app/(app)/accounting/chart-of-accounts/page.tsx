
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const initialAccounts = {
  assets: [
    { code: "1010", name: "Cash on Hand", type: "Current Asset" },
    { code: "1020", name: "HDFC Bank", type: "Bank" },
    { code: "1210", name: "Accounts Receivable", type: "Accounts Receivable" },
    { code: "1410", name: "Office Supplies", type: "Current Asset" },
  ],
  liabilities: [
    { code: "2010", name: "Accounts Payable", type: "Accounts Payable" },
    { code: "2110", name: "GST Payable", type: "Current Liability" },
  ],
  equity: [
      { code: "3010", name: "Owner's Equity", type: "Equity" },
      { code: "3020", name: "Retained Earnings", type: "Equity" },
  ],
  revenue: [
    { code: "4010", name: "Sales Revenue", type: "Revenue" },
    { code: "4020", name: "Service Revenue", type: "Revenue" },
  ],
  expenses: [
    { code: "5010", name: "Rent Expense", type: "Expense" },
    { code: "5020", name: "Salaries and Wages", type: "Expense" },
    { code: "5030", name: "Office Supplies Expense", type: "Expense" },
    { code: "5040", name: "Bank Charges", type: "Expense" },
  ],
};

const accountTypes = [
    // Assets
    "Bank", "Cash", "Accounts Receivable", "Current Asset", "Fixed Asset", "Inventory",
    // Liabilities
    "Accounts Payable", "Credit Card", "Current Liability", "Long Term Liability",
    // Equity
    "Equity",
    // Revenue
    "Revenue", "Other Income",
    // Expenses
    "Expense", "Cost of Goods Sold", "Depreciation",
];


export default function ChartOfAccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const renderAccountCategory = (title: string, accounts: {code: string, name: string, type: string}[]) => (
    <AccordionItem value={title.toLowerCase()}>
        <AccordionTrigger className="font-semibold text-lg hover:no-underline">{title}</AccordionTrigger>
        <AccordionContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Account Code</TableHead>
                        <TableHead className="text-right">Account Type</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {accounts.map((account) => (
                        <TableRow key={account.code}>
                            <TableCell className="font-medium">{account.name}</TableCell>
                            <TableCell>{account.code}</TableCell>
                            <TableCell className="text-right">{account.type}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AccordionContent>
    </AccordionItem>
  );


  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Chart of Accounts</h1>
                <p className="text-muted-foreground">
                    A complete list of your company's financial accounts.
                </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2"/>
                        Add Account
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                    <DialogDescription>
                        Create a new account for tracking finances.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="account-name" className="text-right">Account Name</Label>
                            <Input id="account-name" placeholder="e.g. Office Rent" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="account-code" className="text-right">Account Code</Label>
                            <Input id="account-code" placeholder="e.g. 5010" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="account-type" className="text-right">Account Type</Label>
                             <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select an account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accountTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit" onClick={() => setIsAddDialogOpen(false)}>Save Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>Browse and manage your accounts, organized by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["assets", "liabilities", "equity", "revenue", "expenses"]} className="w-full">
                {renderAccountCategory("Assets", initialAccounts.assets)}
                {renderAccountCategory("Liabilities", initialAccounts.liabilities)}
                {renderAccountCategory("Equity", initialAccounts.equity)}
                {renderAccountCategory("Revenue", initialAccounts.revenue)}
                {renderAccountCategory("Expenses", initialAccounts.expenses)}
            </Accordion>
          </CardContent>
      </Card>
    </div>
  );
}
