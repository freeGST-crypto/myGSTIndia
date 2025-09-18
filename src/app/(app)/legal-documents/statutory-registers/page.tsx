
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
import { Textarea } from "@/components/ui/textarea";
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
  Banknote
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import * as XLSX from 'xlsx';


// Schemas for form validation
const memberSchema = z.object({
  folioNo: z.string().min(1, "Folio No. is required."),
  name: z.string().min(2, "Member name is required."),
  address: z.string().min(10, "Address is required."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format.").optional().or(z.literal("")),
  shares: z.coerce.number().positive("Must be a positive number."),
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

const chargeSchema = z.object({
  creationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  chargeHolder: z.string().min(3, "Charge holder is required."),
  assetsCharged: z.string().min(10, "Assets description is required."),
  amountSecured: z.coerce.number().positive("Amount must be positive."),
  modificationDate: z.string().optional(),
  satisfactionDate: z.string().optional(),
});


const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  members: z.array(memberSchema),
  directors: z.array(directorSchema),
  charges: z.array(chargeSchema),
});

type FormData = z.infer<typeof formSchema>;
type Member = z.infer<typeof memberSchema>;
type Director = z.infer<typeof directorSchema>;
type Charge = z.infer<typeof chargeSchema>;

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
      directors: [
        { name: "Rohan Sharma", din: "01234567", pan: "ABCDE1234F", address: "Mumbai, India", designation: "Director", appointmentDate: "2023-04-01", sharesHeld: 5000 },
        { name: "Priya Mehta", din: "76543210", pan: "FGHIJ5678K", address: "Delhi, India", designation: "Director", appointmentDate: "2023-04-01", sharesHeld: 5000 },
      ],
      charges: [
        { creationDate: "2023-06-01", chargeHolder: "HDFC Bank", assetsCharged: "All current and future assets of the company", amountSecured: 10000000, modificationDate: "", satisfactionDate: "" },
      ]
    },
  });

  const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({ control: form.control, name: "members" });
  const { fields: directorFields, append: appendDirector, remove: removeDirector } = useFieldArray({ control: form.control, name: "directors" });
  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({ control: form.control, name: "charges" });


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
            <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
              <TabsTrigger value="members"><Users className="mr-2"/>Members (MGT-1)</TabsTrigger>
              <TabsTrigger value="directors"><UserCheck className="mr-2"/>Directors (KMP)</TabsTrigger>
              <TabsTrigger value="charges"><Banknote className="mr-2"/>Charges (CHG-7)</TabsTrigger>
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

            <TabsContent value="directors">
               <Card>
                <CardHeader><CardTitle>Register of Directors &amp; KMP</CardTitle><CardDescription>Manage details of Directors and Key Managerial Personnel.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>DIN</TableHead><TableHead>Designation</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {directorFields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell><Input {...form.register(`directors.${index}.name`)}/></TableCell>
                                    <TableCell><Input {...form.register(`directors.${index}.din`)}/></TableCell>
                                    <TableCell><Input {...form.register(`directors.${index}.designation`)}/></TableCell>
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

          </Tabs>
        </form>
      </Form>
    </div>
  );
}
