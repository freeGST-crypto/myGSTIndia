
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  FileSpreadsheet,
  Users,
  UserCheck,
  Banknote,
  Handshake,
  FileKey,
  BookUser,
  Copy,
  BadgePercent,
  Wallet,
  ShoppingCart,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Schemas for form validation
const memberSchema = z.object({
  folioNo: z.string().min(1, "Folio No. is required."),
  name: z.string().min(2, "Member name is required."),
  address: z.string().min(10, "Address is required."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format.").optional().or(z.literal("")),
  shares: z.coerce.number().positive("Must be a positive number."),
  allotmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

const debentureHolderSchema = z.object({
  folioNo: z.string().min(1, "Folio No. is required."),
  name: z.string().min(2, "Holder name is required."),
  address: z.string().min(10, "Address is required."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format.").optional().or(z.literal("")),
  debentureCount: z.coerce.number().positive("Must be a positive number."),
  debentureAmount: z.coerce.number().positive("Amount must be positive."),
  allotmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});


const directorSchema = z.object({
  name: z.string().min(2, "Director's name is required."),
  din: z.string().regex(/^\d{8}$/, "DIN must be 8 digits."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format."),
  address: z.string().min(10, "Address is required."),
  designation: z.string().min(2, "Designation is required."),
  appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  resignationDate: z.string().optional(),
  sharesHeld: z.coerce.number().min(0).default(0),
});

const directorShareholdingSchema = z.object({
  directorName: z.string().min(2, "Director's name is required."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  transactionType: z.enum(["Acquisition", "Transfer"]),
  numberOfShares: z.coerce.number().positive("Must be a positive number."),
  natureOfInterest: z.string().min(3, "Nature of interest is required."),
});

const chargeSchema = z.object({
  creationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  chargeHolder: z.string().min(3, "Charge holder is required."),
  assetsCharged: z.string().min(10, "Assets description is required."),
  amountSecured: z.coerce.number().positive("Amount must be positive."),
  modificationDate: z.string().optional(),
  satisfactionDate: z.string().optional(),
});

const loanGuaranteeInvestmentSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  type: z.enum(["Loan", "Guarantee", "Investment"]),
  bodyCorporateName: z.string().min(3, "Name is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  purpose: z.string().min(3, "Purpose is required."),
});

const relatedPartyContractSchema = z.object({
    date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    partyName: z.string().min(3, "Party name is required"),
    relationship: z.string().min(3, "Relationship is required"),
    nature: z.string().min(10, "Nature of contract is required"),
    keyTerms: z.string().min(10, "Key terms are required"),
});

const renewedDuplicateCertSchema = z.object({
    folioNo: z.string().min(1, "Folio No. is required."),
    name: z.string().min(2, "Member name is required."),
    originalCertNo: z.string().min(1, "Original Cert No. is required."),
    originalIssueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    shares: z.coerce.number().positive("Must be a positive number."),
    distinctiveNos: z.string().min(1, "Distinctive numbers are required."),
    newCertNo: z.string().min(1, "New Cert No. is required."),
    newIssueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    reason: z.enum(["Renewed", "Duplicate"]),
    remarks: z.string().optional(),
});

const sweatEquitySchema = z.object({
  allotteeName: z.string().min(2, "Allottee name is required."),
  numberOfShares: z.coerce.number().positive(),
  allotmentDate: z.string().refine(val => !isNaN(Date.parse(val))),
  issuePrice: z.coerce.number().min(0),
  consideration: z.string().min(3, "Consideration is required."),
  lockInExpiry: z.string().refine(val => !isNaN(Date.parse(val))),
});

const esopSchema = z.object({
  grantNo: z.string().min(1),
  employeeName: z.string().min(2),
  grantDate: z.string().refine(val => !isNaN(Date.parse(val))),
  optionsGranted: z.coerce.number().positive(),
  vestingPeriod: z.string().min(1),
  exercisePrice: z.coerce.number().positive(),
  optionsExercised: z.coerce.number().min(0).default(0),
  optionsLapsed: z.coerce.number().min(0).default(0),
});

const buyBackSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val))),
  numberOfSecurities: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  mode: z.enum(["Open Market", "Tender Offer"]),
  cancellationDate: z.string().refine(val => !isNaN(Date.parse(val))),
});


const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  members: z.array(memberSchema),
  debentureHolders: z.array(debentureHolderSchema),
  directors: z.array(directorSchema),
  directorShareholdings: z.array(directorShareholdingSchema),
  charges: z.array(chargeSchema),
  loansGuaranteesInvestments: z.array(loanGuaranteeInvestmentSchema),
  relatedPartyContracts: z.array(relatedPartyContractSchema),
  renewedDuplicateCerts: z.array(renewedDuplicateCertSchema),
  sweatEquity: z.array(sweatEquitySchema),
  esops: z.array(esopSchema),
  buyBacks: z.array(buyBackSchema),
});

type FormData = z.infer<typeof formSchema>;

export default function StatutoryRegistersPage() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "Acme Innovations Pvt. Ltd.",
      members: [
        { folioNo: "001", name: "Rohan Sharma", address: "Mumbai, India", pan: "ABCDE1234F", shares: 5000, allotmentDate: "2023-04-01" },
        { folioNo: "002", name: "Priya Mehta", address: "Delhi, India", pan: "FGHIJ5678K", shares: 5000, allotmentDate: "2023-04-01" },
      ],
      debentureHolders: [
        { folioNo: "D001", name: "Alpha Investments", address: "Bangalore, India", pan: "AABCA1234B", debentureCount: 100, debentureAmount: 100000, allotmentDate: "2023-05-15" }
      ],
      directors: [
        { name: "Rohan Sharma", din: "01234567", pan: "ABCDE1234F", address: "Mumbai, India", designation: "Director", appointmentDate: "2023-04-01", sharesHeld: 5000 },
        { name: "Priya Mehta", din: "76543210", pan: "FGHIJ5678K", address: "Delhi, India", designation: "Director", appointmentDate: "2023-04-01", sharesHeld: 5000 },
      ],
      directorShareholdings: [
        { directorName: "Rohan Sharma", date: "2023-04-01", transactionType: "Acquisition", numberOfShares: 5000, natureOfInterest: "Initial Subscriber" }
      ],
      charges: [
        { creationDate: "2023-06-01", chargeHolder: "HDFC Bank", assetsCharged: "All current and future assets of the company", amountSecured: 10000000, modificationDate: "", satisfactionDate: "" },
      ],
      loansGuaranteesInvestments: [
          { date: "2023-08-15", type: "Loan", bodyCorporateName: "Innovatech Solutions Ltd.", amount: 500000, purpose: "Inter-corporate deposit" },
          { date: "2023-09-01", type: "Investment", bodyCorporateName: "Future Startups Inc.", amount: 1000000, purpose: "Equity investment" },
      ],
      relatedPartyContracts: [
          { date: "2023-10-01", partyName: "Rohan Sharma", relationship: "Director", nature: "Lease of Office Premises", keyTerms: "Rent Rs. 50,000/month for 3 years" }
      ],
      renewedDuplicateCerts: [
        { folioNo: "001", name: "Rohan Sharma", originalCertNo: "1", originalIssueDate: "2023-04-15", shares: 1000, distinctiveNos: "1-1000", newCertNo: "1A", newIssueDate: "2024-01-10", reason: "Duplicate", remarks: "Original lost" }
      ],
      sweatEquity: [],
      esops: [],
      buyBacks: [],
    },
  });

  const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({ control: form.control, name: "members" });
  const { fields: debentureHolderFields, append: appendDebentureHolder, remove: removeDebentureHolder } = useFieldArray({ control: form.control, name: "debentureHolders" });
  const { fields: directorFields, append: appendDirector, remove: removeDirector } = useFieldArray({ control: form.control, name: "directors" });
  const { fields: directorShareholdingFields, append: appendDirectorShareholding, remove: removeDirectorShareholding } = useFieldArray({ control: form.control, name: "directorShareholdings" });
  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({ control: form.control, name: "charges" });
  const { fields: lgiFields, append: appendLgi, remove: removeLgi } = useFieldArray({ control: form.control, name: "loansGuaranteesInvestments" });
  const { fields: rpcFields, append: appendRpc, remove: removeRpc } = useFieldArray({ control: form.control, name: "relatedPartyContracts" });
  const { fields: rdcFields, append: appendRdc, remove: removeRdc } = useFieldArray({ control: form.control, name: "renewedDuplicateCerts" });
  const { fields: sweatEquityFields, append: appendSweatEquity, remove: removeSweatEquity } = useFieldArray({ control: form.control, name: "sweatEquity" });
  const { fields: esopFields, append: appendEsop, remove: removeEsop } = useFieldArray({ control: form.control, name: "esops" });
  const { fields: buyBackFields, append: appendBuyBack, remove: removeBuyBack } = useFieldArray({ control: form.control, name: "buyBacks" });


  const exportToCsv = (data: any[], headers: string[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Register");
    XLSX.writeFile(wb, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: "Export Successful", description: `${fileName}.xlsx has been downloaded.` });
  };
  
  const handleExportMembers = () => {
    const dataToExport = form.getValues("members").map((m, index) => ({
      "S. No.": index + 1,
      "Folio No.": m.folioNo,
      "Name of Member": m.name,
      "Address": m.address,
      "PAN": m.pan,
      "No. of Shares": m.shares,
      "Date of Allotment": m.allotmentDate ? format(new Date(m.allotmentDate), 'dd-MM-yyyy') : '',
      "Date of Entry": m.allotmentDate ? format(new Date(m.allotmentDate), 'dd-MM-yyyy') : '',
      "Remarks": "",
    }));
    const headers = ["S. No.", "Folio No.", "Name of Member", "Address", "PAN", "No. of Shares", "Date of Allotment", "Date of Entry", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Members");
  };

  const handleExportDebentureHolders = () => {
    const dataToExport = form.getValues("debentureHolders").map((d, index) => ({
      "S. No.": index + 1,
      "Folio No.": d.folioNo,
      "Name of Holder": d.name,
      "Address": d.address,
      "PAN": d.pan,
      "No. of Debentures": d.debentureCount,
      "Amount (Rs.)": d.debentureAmount,
      "Date of Allotment": d.allotmentDate ? format(new Date(d.allotmentDate), 'dd-MM-yyyy') : '',
      "Remarks": "",
    }));
    const headers = ["S. No.", "Folio No.", "Name of Holder", "Address", "PAN", "No. of Debentures", "Amount (Rs.)", "Date of Allotment", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Debenture_Holders");
  };

  const handleExportDirectors = () => {
    const dataToExport = form.getValues("directors").map((d, index) => ({
      "S. No.": index + 1,
      "Name": d.name,
      "DIN": d.din,
      "PAN": d.pan,
      "Address": d.address,
      "Designation": d.designation,
      "Date of Appointment": d.appointmentDate ? format(new Date(d.appointmentDate), 'dd-MM-yyyy') : '',
      "Date of Resignation": d.resignationDate ? format(new Date(d.resignationDate), 'dd-MM-yyyy') : '',
      "No. of Shares Held": d.sharesHeld,
      "Remarks": "",
    }));
     const headers = ["S. No.", "Name", "DIN", "PAN", "Address", "Designation", "Date of Appointment", "Date of Resignation", "No. of Shares Held", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Directors_KMP");
  };

   const handleExportDirectorShareholdings = () => {
    const dataToExport = form.getValues("directorShareholdings").map((s, index) => ({
      "S. No.": index + 1,
      "Director Name": s.directorName,
      "Date": s.date ? format(new Date(s.date), 'dd-MM-yyyy') : '',
      "Transaction Type": s.transactionType,
      "Number of Shares": s.numberOfShares,
      "Nature of Interest": s.natureOfInterest,
      "Remarks": "",
    }));
     const headers = ["S. No.", "Director Name", "Date", "Transaction Type", "Number of Shares", "Nature of Interest", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Directors_Shareholding");
  };

  const handleExportCharges = () => {
    const dataToExport = form.getValues("charges").map((c, index) => ({
      "S. No.": index + 1,
      "Date of Creation": c.creationDate ? format(new Date(c.creationDate), 'dd-MM-yyyy') : '',
      "Charge Holder": c.chargeHolder,
      "Assets Charged": c.assetsCharged,
      "Amount Secured": c.amountSecured,
      "Modification Date": c.modificationDate ? format(new Date(c.modificationDate), 'dd-MM-yyyy') : '',
      "Satisfaction Date": c.satisfactionDate ? format(new Date(c.satisfactionDate), 'dd-MM-yyyy') : '',
      "Remarks": "",
    }));
    const headers = ["S. No.", "Date of Creation", "Charge Holder", "Assets Charged", "Amount Secured", "Modification Date", "Satisfaction Date", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Charges");
  };
  
  const handleExportLgi = () => {
    const dataToExport = form.getValues("loansGuaranteesInvestments").map((item, index) => ({
        "S. No.": index + 1,
        "Date": item.date ? format(new Date(item.date), 'dd-MM-yyyy') : '',
        "Type": item.type,
        "Name of Body Corporate": item.bodyCorporateName,
        "Amount": item.amount,
        "Purpose": item.purpose,
        "Remarks": "",
    }));
    const headers = ["S. No.", "Date", "Type", "Name of Body Corporate", "Amount", "Purpose", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Loans_Guarantees_Investments");
  }

  const handleExportRpc = () => {
    const dataToExport = form.getValues("relatedPartyContracts").map((item, index) => ({
        "S. No.": index + 1,
        "Date of Contract": item.date ? format(new Date(item.date), 'dd-MM-yyyy') : '',
        "Name of Related Party": item.partyName,
        "Nature of Relationship": item.relationship,
        "Nature of Contract": item.nature,
        "Salient Terms": item.keyTerms,
        "Remarks": "",
    }));
    const headers = ["S. No.", "Date of Contract", "Name of Related Party", "Nature of Relationship", "Nature of Contract", "Salient Terms", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Contracts");
  }

  const handleExportRenewedCerts = () => {
    const dataToExport = form.getValues("renewedDuplicateCerts").map((c, index) => ({
        "S. No.": index + 1,
        "Folio No.": c.folioNo,
        "Name of Member": c.name,
        "Original Cert. No.": c.originalCertNo,
        "Original Issue Date": c.originalIssueDate ? format(new Date(c.originalIssueDate), 'dd-MM-yyyy') : '',
        "No. of Shares": c.shares,
        "Distinctive Nos.": c.distinctiveNos,
        "New Cert. No.": c.newCertNo,
        "New Issue Date": c.newIssueDate ? format(new Date(c.newIssueDate), 'dd-MM-yyyy') : '',
        "Reason (Renewed/Duplicate)": c.reason,
        "Remarks": c.remarks,
    }));
    const headers = ["S. No.", "Folio No.", "Name of Member", "Original Cert. No.", "Original Issue Date", "No. of Shares", "Distinctive Nos.", "New Cert. No.", "New Issue Date", "Reason (Renewed/Duplicate)", "Remarks"];
    exportToCsv(dataToExport, headers, "Register_of_Renewed_Duplicate_Certs");
  };

  const handleExportSweatEquity = () => {
    const dataToExport = form.getValues("sweatEquity").map((item, index) => ({
      "S. No.": index + 1,
      "Name of Allottee": item.allotteeName,
      "No. of Shares": item.numberOfShares,
      "Date of Allotment": format(new Date(item.allotmentDate), 'dd-MM-yyyy'),
      "Issue Price": item.issuePrice,
      "Consideration": item.consideration,
      "Lock-in Expiry": format(new Date(item.lockInExpiry), 'dd-MM-yyyy'),
    }));
    const headers = ["S. No.", "Name of Allottee", "No. of Shares", "Date of Allotment", "Issue Price", "Consideration", "Lock-in Expiry"];
    exportToCsv(dataToExport, headers, "Register_of_Sweat_Equity");
  };
  
  const handleExportEsops = () => {
    const dataToExport = form.getValues("esops").map((item, index) => ({
      "Grant No.": item.grantNo,
      "Employee Name": item.employeeName,
      "Grant Date": format(new Date(item.grantDate), 'dd-MM-yyyy'),
      "Options Granted": item.optionsGranted,
      "Vesting Period": item.vestingPeriod,
      "Exercise Price": item.exercisePrice,
      "Options Exercised": item.optionsExercised,
      "Options Lapsed": item.optionsLapsed,
    }));
    const headers = ["Grant No.", "Employee Name", "Grant Date", "Options Granted", "Vesting Period", "Exercise Price", "Options Exercised", "Options Lapsed"];
    exportToCsv(dataToExport, headers, "Register_of_ESOPs");
  };
  
  const handleExportBuyBacks = () => {
    const dataToExport = form.getValues("buyBacks").map((item, index) => ({
      "S. No.": index + 1,
      "Date of Buy-Back": format(new Date(item.date), 'dd-MM-yyyy'),
      "No. of Securities": item.numberOfSecurities,
      "Price per Security": item.price,
      "Mode of Buy-Back": item.mode,
      "Date of Cancellation": format(new Date(item.cancellationDate), 'dd-MM-yyyy'),
    }));
    const headers = ["S. No.", "Date of Buy-Back", "No. of Securities", "Price per Security", "Mode of Buy-Back", "Date of Cancellation"];
    exportToCsv(dataToExport, headers, "Register_of_Buy_Back");
  };


  return (
    <div className="space-y-8">
      <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Document Selection
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Statutory Registers Generator</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage and generate key statutory registers required under the Companies Act, 2013.
        </p>
      </div>

       <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
            <CardContent>
              <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </CardContent>
          </Card>

          <Tabs defaultValue="members">
            <TabsList className="flex flex-wrap h-auto justify-start">
              <TabsTrigger value="members"><Users className="mr-2"/>Members (MGT-1)</TabsTrigger>
              <TabsTrigger value="debentureHolders"><FileKey className="mr-2" />Debentures</TabsTrigger>
              <TabsTrigger value="directors"><UserCheck className="mr-2"/>Directors & KMP</TabsTrigger>
              <TabsTrigger value="directorShareholdings"><Briefcase className="mr-2"/>Directors' Shareholding</TabsTrigger>
              <TabsTrigger value="charges"><Banknote className="mr-2"/>Charges (CHG-7)</TabsTrigger>
              <TabsTrigger value="lgi"><Handshake className="mr-2"/>Loans etc. (Sec 186)</TabsTrigger>
              <TabsTrigger value="contracts"><BookUser className="mr-2"/>Contracts (Sec 189)</TabsTrigger>
              <TabsTrigger value="certs"><Copy className="mr-2"/>Share Certificates</TabsTrigger>
              <TabsTrigger value="sweat"><BadgePercent className="mr-2"/>Sweat Equity</TabsTrigger>
              <TabsTrigger value="esop"><Wallet className="mr-2"/>ESOPs</TabsTrigger>
              <TabsTrigger value="buyback"><ShoppingCart className="mr-2"/>Buy-Back</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members">
              <Card>
                <CardHeader><CardTitle>Register of Members (Form MGT-1)</CardTitle><CardDescription>Manage the details of all shareholders.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Folio No.</TableHead><TableHead>Name</TableHead><TableHead>Shares</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {memberFields.map((field, index) => (
                           <TableRow key={field.id}>
                              <TableCell><Input {...form.register(`members.${index}.folioNo`)}/></TableCell>
                              <TableCell><Input {...form.register(`members.${index}.name`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`members.${index}.shares`)}/></TableCell>
                              <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeMember(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendMember({ folioNo: "", name: "", address: "", pan: "", shares: 0, allotmentDate: "" })}><PlusCircle className="mr-2"/> Add Member</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportMembers}><FileSpreadsheet className="mr-2"/> Export Register (MGT-1)</Button></CardFooter>
              </Card>
            </TabsContent>

             <TabsContent value="debentureHolders">
              <Card>
                <CardHeader><CardTitle>Register of Debenture Holders</CardTitle><CardDescription>Manage the details of all debenture holders or other security holders.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Folio No.</TableHead><TableHead>Name</TableHead><TableHead>No. of Debentures</TableHead><TableHead>Amount</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {debentureHolderFields.map((field, index) => (
                           <TableRow key={field.id}>
                              <TableCell><Input {...form.register(`debentureHolders.${index}.folioNo`)}/></TableCell>
                              <TableCell><Input {...form.register(`debentureHolders.${index}.name`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`debentureHolders.${index}.debentureCount`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`debentureHolders.${index}.debentureAmount`)}/></TableCell>
                              <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeDebentureHolder(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendDebentureHolder({ folioNo: "", name: "", address: "", pan: "", debentureCount: 0, debentureAmount: 0, allotmentDate: "" })}><PlusCircle className="mr-2"/> Add Debenture Holder</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportDebentureHolders}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="directors">
               <Card>
                <CardHeader><CardTitle>Register of Directors &amp; KMP</CardTitle><CardDescription>Manage details of Directors, KMP, and their shareholding.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>DIN</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Shares Held</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {directorFields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell><Input {...form.register(`directors.${index}.name`)}/></TableCell>
                                    <TableCell><Input {...form.register(`directors.${index}.din`)}/></TableCell>
                                    <TableCell><Input {...form.register(`directors.${index}.designation`)}/></TableCell>
                                    <TableCell><Input type="number" {...form.register(`directors.${index}.sharesHeld`)} /></TableCell>
                                    <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeDirector(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                  <Button type="button" variant="outline" onClick={() => appendDirector({ name: "", din: "", pan: "", address: "", designation: "", appointmentDate: "", sharesHeld: 0 })}><PlusCircle className="mr-2"/> Add Director/KMP</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportDirectors}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="directorShareholdings">
              <Card>
                <CardHeader><CardTitle>Register of Directors' Shareholding</CardTitle><CardDescription>Manage the details of shares and securities held by directors.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Director Name</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>No. of Shares</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {directorShareholdingFields.map((field, index) => (
                           <TableRow key={field.id}>
                              <TableCell><Input {...form.register(`directorShareholdings.${index}.directorName`)}/></TableCell>
                              <TableCell><Input type="date" {...form.register(`directorShareholdings.${index}.date`)}/></TableCell>
                              <TableCell>
                                 <Select onValueChange={(value) => form.setValue(`directorShareholdings.${index}.transactionType`, value as "Acquisition" | "Transfer")} defaultValue={field.transactionType}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Acquisition">Acquisition</SelectItem>
                                        <SelectItem value="Transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell><Input type="number" {...form.register(`directorShareholdings.${index}.numberOfShares`)}/></TableCell>
                              <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeDirectorShareholding(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendDirectorShareholding({ directorName: "", date: "", transactionType: "Acquisition", numberOfShares: 0, natureOfInterest: "" })}><PlusCircle className="mr-2"/> Add Record</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportDirectorShareholdings}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
              </Card>
            </TabsContent>

             <TabsContent value="charges">
              <Card>
                <CardHeader><CardTitle>Register of Charges (Form CHG-7)</CardTitle><CardDescription>Manage details of all charges created on the company's assets.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Charge Holder</TableHead><TableHead>Amount Secured</TableHead><TableHead>Creation Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {chargeFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell><Input {...form.register(`charges.${index}.chargeHolder`)}/></TableCell>
                            <TableCell><Input type="number" {...form.register(`charges.${index}.amountSecured`)}/></TableCell>
                            <TableCell><Input type="date" {...form.register(`charges.${index}.creationDate`)}/></TableCell>
                            <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeCharge(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendCharge({ creationDate: "", chargeHolder: "", assetsCharged: "", amountSecured: 0 })}><PlusCircle className="mr-2"/> Add Charge</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportCharges}><FileSpreadsheet className="mr-2"/> Export Register (CHG-7)</Button></CardFooter>
              </Card>
            </TabsContent>

             <TabsContent value="lgi">
              <Card>
                <CardHeader><CardTitle>Register of Loans, Guarantees and Investments (Sec. 186)</CardTitle><CardDescription>Record of loans made, guarantees given, or investments made by the company.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Entity</TableHead><TableHead>Amount</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {lgiFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell><Input type="date" {...form.register(`loansGuaranteesInvestments.${index}.date`)}/></TableCell>
                            <TableCell>
                                <Select onValueChange={(value) => form.setValue(`loansGuaranteesInvestments.${index}.type`, value as "Loan" | "Guarantee" | "Investment")} defaultValue={field.type}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Loan">Loan</SelectItem>
                                        <SelectItem value="Guarantee">Guarantee</SelectItem>
                                        <SelectItem value="Investment">Investment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell><Input {...form.register(`loansGuaranteesInvestments.${index}.bodyCorporateName`)}/></TableCell>
                             <TableCell><Input type="number" {...form.register(`loansGuaranteesInvestments.${index}.amount`)}/></TableCell>
                            <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeLgi(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendLgi({ date: "", type: "Loan", bodyCorporateName: "", amount: 0, purpose: "" })}><PlusCircle className="mr-2"/> Add Entry</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportLgi}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
              </Card>
            </TabsContent>

             <TabsContent value="contracts">
              <Card>
                <CardHeader><CardTitle>Register of Contracts (Sec. 189)</CardTitle><CardDescription>Contracts or arrangements in which directors are interested.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Related Party</TableHead><TableHead>Nature of Contract</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {rpcFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell><Input type="date" {...form.register(`relatedPartyContracts.${index}.date`)}/></TableCell>
                            <TableCell><Input {...form.register(`relatedPartyContracts.${index}.partyName`)}/></TableCell>
                            <TableCell><Input {...form.register(`relatedPartyContracts.${index}.nature`)}/></TableCell>
                            <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeRpc(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendRpc({ date: "", partyName: "", relationship: "", nature: "", keyTerms: "" })}><PlusCircle className="mr-2"/> Add Contract</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportRpc}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="certs">
                <Card>
                    <CardHeader><CardTitle>Register of Renewed &amp; Duplicate Share Certificates</CardTitle><CardDescription>Record all instances of renewed or duplicated share certificates.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="border rounded-md overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Folio No.</TableHead><TableHead>Name</TableHead><TableHead>Original Cert. No.</TableHead><TableHead>New Cert. No.</TableHead><TableHead>Reason</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {rdcFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell><Input {...form.register(`renewedDuplicateCerts.${index}.folioNo`)}/></TableCell>
                                        <TableCell><Input {...form.register(`renewedDuplicateCerts.${index}.name`)}/></TableCell>
                                        <TableCell><Input {...form.register(`renewedDuplicateCerts.${index}.originalCertNo`)}/></TableCell>
                                        <TableCell><Input {...form.register(`renewedDuplicateCerts.${index}.newCertNo`)}/></TableCell>
                                        <TableCell>
                                            <Select onValueChange={(value) => form.setValue(`renewedDuplicateCerts.${index}.reason`, value as "Renewed" | "Duplicate")} defaultValue={field.reason}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Renewed">Renewed</SelectItem>
                                                    <SelectItem value="Duplicate">Duplicate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeRdc(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button type="button" variant="outline" onClick={() => appendRdc({ folioNo: "", name: "", originalCertNo: "", originalIssueDate: "", shares: 0, distinctiveNos: "", newCertNo: "", newIssueDate: "", reason: "Duplicate" })}><PlusCircle className="mr-2"/> Add Entry</Button>
                    </CardContent>
                    <CardFooter><Button type="button" onClick={handleExportRenewedCerts}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
                </Card>
            </TabsContent>
            
            <TabsContent value="sweat">
              <Card>
                <CardHeader><CardTitle>Register of Sweat Equity Shares (Form SH-3)</CardTitle><CardDescription>Manage sweat equity shares issued to directors or employees.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Allottee</TableHead><TableHead>No. of Shares</TableHead><TableHead>Allotment Date</TableHead><TableHead>Lock-in Expiry</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {sweatEquityFields.map((field, index) => (
                           <TableRow key={field.id}>
                              <TableCell><Input {...form.register(`sweatEquity.${index}.allotteeName`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`sweatEquity.${index}.numberOfShares`)}/></TableCell>
                              <TableCell><Input type="date" {...form.register(`sweatEquity.${index}.allotmentDate`)}/></TableCell>
                              <TableCell><Input type="date" {...form.register(`sweatEquity.${index}.lockInExpiry`)}/></TableCell>
                              <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeSweatEquity(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendSweatEquity({ allotteeName: "", numberOfShares: 0, allotmentDate: "", issuePrice: 0, consideration: "", lockInExpiry: "" })}><PlusCircle className="mr-2"/> Add Entry</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportSweatEquity}><FileSpreadsheet className="mr-2"/> Export Register (SH-3)</Button></CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="esop">
              <Card>
                <CardHeader><CardTitle>Register of Employee Stock Options (ESOPs)</CardTitle><CardDescription>Maintain a register of stock options granted to employees.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Options Granted</TableHead><TableHead>Grant Date</TableHead><TableHead>Exercise Price</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {esopFields.map((field, index) => (
                           <TableRow key={field.id}>
                              <TableCell><Input {...form.register(`esops.${index}.employeeName`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`esops.${index}.optionsGranted`)}/></TableCell>
                              <TableCell><Input type="date" {...form.register(`esops.${index}.grantDate`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`esops.${index}.exercisePrice`)}/></TableCell>
                              <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeEsop(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendEsop({ grantNo: "", employeeName: "", grantDate: "", optionsGranted: 0, vestingPeriod: "", exercisePrice: 0 })}><PlusCircle className="mr-2"/> Add Grant</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportEsops}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="buyback">
               <Card>
                <CardHeader><CardTitle>Register of Buy-Back of Securities</CardTitle><CardDescription>Maintain records of shares and other securities bought back by the company.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>No. of Securities</TableHead><TableHead>Price</TableHead><TableHead>Mode</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {buyBackFields.map((field, index) => (
                           <TableRow key={field.id}>
                              <TableCell><Input type="date" {...form.register(`buyBacks.${index}.date`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`buyBacks.${index}.numberOfSecurities`)}/></TableCell>
                              <TableCell><Input type="number" {...form.register(`buyBacks.${index}.price`)}/></TableCell>
                              <TableCell>
                                <Select onValueChange={(value) => form.setValue(`buyBacks.${index}.mode`, value as "Open Market" | "Tender Offer")} defaultValue={field.mode}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open Market">Open Market</SelectItem>
                                        <SelectItem value="Tender Offer">Tender Offer</SelectItem>
                                    </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeBuyBack(index)}><Trash2 className="size-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" onClick={() => appendBuyBack({ date: "", numberOfSecurities: 0, price: 0, mode: "Tender Offer", cancellationDate: "" })}><PlusCircle className="mr-2"/> Add Buy-Back Entry</Button>
                </CardContent>
                <CardFooter><Button type="button" onClick={handleExportBuyBacks}><FileSpreadsheet className="mr-2"/> Export Register</Button></CardFooter>
              </Card>
            </TabsContent>

          </Tabs>
        </form>
      </Form>
    </div>
  );
}
