
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const exportOptions = [
    { title: "Day Book", description: "Export all vouchers for a selected period in Excel format.", type: "xlsx" },
    { title: "General Ledger", description: "Export the complete transaction history for all accounts.", type: "xlsx" },
    { title: "Trial Balance", description: "Export the trial balance as on a specific date.", type: "csv" },
    { title: "All Invoices", description: "Get a detailed list of all sales invoices.", type: "xlsx" },
    { title: "All Purchase Bills", description: "Get a detailed list of all purchase bills.", type: "xlsx" },
    { title: "Customer & Vendor List", description: "Export your complete list of parties.", type: "csv" },
];

export default function ImportExportPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Import & Export Data</h1>
                <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                    Seamlessly move your data in and out of GSTEase.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Upload/> Import Data</CardTitle>
                        <CardDescription>Import data from other software like Tally.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Import from Tally</h3>
                                <p className="text-sm text-muted-foreground">Upload your Day Book exported from Tally in XML format.</p>
                            </div>
                            <Button variant="secondary">Import</Button>
                        </Card>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Download/> Export Data</CardTitle>
                        <CardDescription>Export your GSTEase data for backups or use in other applications.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-2">
                        {exportOptions.map(opt => (
                             <div key={opt.title} className="p-2 border rounded-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {opt.type === 'xlsx' ? <FileSpreadsheet className="size-5 text-green-600"/> : <FileText className="size-5 text-blue-600"/>}
                                    <p className="font-medium">{opt.title}</p>
                                </div>
                                <Button size="sm" variant="ghost">Export</Button>
                             </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
