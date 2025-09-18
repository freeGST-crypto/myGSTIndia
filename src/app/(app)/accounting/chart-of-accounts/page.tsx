
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
import { PlusCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';


type Account = {
  code: string;
  name: string;
  type: string;
  category: "assets" | "liabilities" | "equity" | "revenue" | "expenses";
  purchaseDate?: Date;
  putToUseDate?: Date;
  depreciationRate?: number;
  openingWdv?: number;
  userId: string;
};

const accountTypes = {
    assets: ["Bank", "Cash", "Accounts Receivable", "Current Asset", "Fixed Asset", "Inventory"],
    liabilities: ["Accounts Payable", "Credit Card", "Current Liability", "Long Term Liability"],
    equity: ["Equity"],
    revenue: ["Revenue", "Other Income"],
    expenses: ["Expense", "Cost of Goods Sold", "Depreciation"],
};

const accountSchema = z.object({
    name: z.string().min(3, "Account name is required."),
    code: z.string().regex(/^\d{4}$/, "Account code must be 4 digits."),
    type: z.string().min(1, "Account type is required."),
    purchaseDate: z.date().optional(),
    putToUseDate: z.date().optional(),
    depreciationRate: z.number().optional(),
    openingWdv: z.number().optional(),
}).refine(data => {
    if (data.type === 'Fixed Asset') {
        return !!data.purchaseDate && !!data.putToUseDate && data.depreciationRate !== undefined && data.openingWdv !== undefined;
    }
    return true;
}, {
    message: "For Fixed Assets, all detail fields are required.",
    path: ["purchaseDate"], // you can point to any of the fields
});

export default function ChartOfAccountsPage() {
  const [user] = useAuthState(auth);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const accountsRef = collection(db, "accounts");
  const accountsQuery = user ? query(accountsRef, where("userId", "==", user.uid), orderBy("code")) : null;
  const [accountsSnapshot, loading, error] = useCollection(accountsQuery);
  
  const accounts = accountsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)) || [];
  
  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
        name: "",
        code: "",
        type: "",
    }
  });
  
  const selectedAccountType = form.watch("type");

  const onSubmit = async (values: z.infer<typeof accountSchema>) => {
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to add an account."});
        return;
    }

    const categoryMapping: Record<string, Account['category']> = {
        'Bank': 'assets', 'Cash': 'assets', 'Accounts Receivable': 'assets', 'Current Asset': 'assets', 'Fixed Asset': 'assets', 'Inventory': 'assets',
        'Accounts Payable': 'liabilities', 'Credit Card': 'liabilities', 'Current Liability': 'liabilities', 'Long Term Liability': 'liabilities',
        'Equity': 'equity',
        'Revenue': 'revenue', 'Other Income': 'revenue',
        'Expense': 'expenses', 'Cost of Goods Sold': 'expenses', 'Depreciation': 'expenses'
    };
    
    const newAccount: Omit<Account, 'id'> = {
        ...values,
        category: categoryMapping[values.type],
        userId: user.uid,
    };

    try {
        await addDoc(accountsRef, newAccount);
        toast({ title: "Account Added", description: `${values.name} has been added to your Chart of Accounts.` });
        form.reset();
        setIsAddDialogOpen(false);
    } catch (e) {
        console.error("Error adding document: ", e);
        toast({ variant: "destructive", title: "Error", description: "Could not save the account. Please try again."})
    }
  };

  const renderAccountCategory = (title: string, category: Account['category']) => {
    const categoryAccounts = accounts.filter(acc => acc.category === category);
    if (loading) {
        return <Loader2 className="animate-spin my-4"/>;
    }
    return (
        <AccordionItem value={category}>
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
                        {categoryAccounts.map((account) => (
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
  };


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
                <DialogContent className="sm:max-w-lg">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                        <DialogTitle>Add New Account</DialogTitle>
                        <DialogDescription>
                            Create a new account for tracking finances.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                             <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input placeholder="e.g. Office Rent" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="code" render={({ field }) => ( <FormItem><FormLabel>Account Code</FormLabel><FormControl><Input placeholder="e.g. 5010" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="type" render={({ field }) => ( <FormItem><FormLabel>Account Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.entries(accountTypes).map(([group, types]) => (
                                                <div key={group}>
                                                     <Separator className="my-2"/>
                                                     <p className="px-2 py-1.5 text-sm font-semibold capitalize">{group}</p>
                                                    {types.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem> )}/>
                            </div>

                            {selectedAccountType === 'Fixed Asset' && (
                                <>
                                    <Separator className="my-4" />
                                    <h3 className="text-md font-semibold">Fixed Asset Details</h3>
                                    <div className="space-y-4 p-4 border rounded-md">
                                        <div className="grid grid-cols-2 gap-4">
                                             <FormField control={form.control} name="purchaseDate" render={({ field }) => ( <FormItem><FormLabel>Date of Purchase</FormLabel>
                                                 <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, "PPP") : "Select date"}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                                             <FormMessage /></FormItem> )}/>
                                             <FormField control={form.control} name="putToUseDate" render={({ field }) => ( <FormItem><FormLabel>Date Put to Use</FormLabel>
                                                 <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, "PPP") : "Select date"}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                                             <FormMessage /></FormItem> )}/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="depreciationRate" render={({ field }) => ( <FormItem><FormLabel>Depreciation Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g. 15" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name="openingWdv" render={({ field }) => ( <FormItem><FormLabel>Opening WDV (₹)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Account</Button>
                        </DialogFooter>
                    </form>
                  </Form>
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
                {renderAccountCategory("Assets", "assets")}
                {renderAccountCategory("Liabilities", "liabilities")}
                {renderAccountCategory("Equity", "equity")}
                {renderAccountCategory("Revenue", "revenue")}
                {renderAccountCategory("Expenses", "expenses")}
            </Accordion>
          </CardContent>
      </Card>
    </div>
  );
}
