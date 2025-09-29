
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const exportOptions = [
    { title: "Day Book", description: "All transactional vouchers.", type: "xlsx" },
    { title: "General Ledger", description: "Full transaction history for all accounts.", type: "xlsx" },
    { title: "Trial Balance", description: "Summary of all ledger balances.", type: "csv" },
    { title: "All Sales Invoices", description: "Detailed list of all sales invoices.", type: "xlsx" },
    { title: "All Purchase Bills", description: "Detailed list of all purchase bills.", type: "xlsx" },
    { title: "Customer & Vendor List", description: "Complete list of all parties.", type: "csv" },
    { title: "Stock Item List", description: "Complete list of all stock items.", type: "csv" },
];

export default function ImportExportPage() {
    const [tallyFile, setTallyFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();

    const handleTallyImport = async () => {
        if (!tallyFile) {
            toast({
                variant: "destructive",
                title: "No File Selected",
                description: "Please select a Tally XML file to import.",
            });
            return;
        }

        setIsImporting(true);
        toast({
            title: "Importing Tally Data...",
            description: "This may take a few moments.",
        });

        const formData = new FormData();
        formData.append('file', tallyFile);

        try {
            const response = await fetch('/api/import/tally', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "An unknown error occurred.");
            }
            
            toast({
                title: "Import Successful!",
                description: result.message,
            });

        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Import Failed",
                description: error.message,
            });
        } finally {
            setIsImporting(false);
            setTallyFile(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Import & Export Data</h1>
                <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                    Seamlessly move your data in and out of ZenithBooks.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Upload/> Import Data</CardTitle>
                        <CardDescription>Import data from other software like Tally.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg space-y-4">
                            <h3 className="font-semibold">Import from Tally</h3>
                            <p className="text-sm text-muted-foreground">Upload your Day Book exported from Tally in XML format. We'll automatically create the corresponding accounting vouchers.</p>
                            <div className="space-y-2">
                                <Label htmlFor="tally-file">Tally Day Book (.xml)</Label>
                                <Input 
                                    id="tally-file" 
                                    type="file" 
                                    accept=".xml" 
                                    onChange={(e) => setTallyFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <Button onClick={handleTallyImport} disabled={isImporting || !tallyFile}>
                                {isImporting ? <Loader2 className="mr-2 animate-spin"/> : <Upload className="mr-2" />}
                                {isImporting ? "Importing..." : "Import Vouchers"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Download/> Export Data</CardTitle>
                        <CardDescription>Export your ZenithBooks data for backups or use in other applications.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-2">
                        {exportOptions.map(opt => (
                             <div key={opt.title} className="p-2 border rounded-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {opt.type === 'xlsx' ? <FileSpreadsheet className="size-5 text-green-600"/> : <FileText className="size-5 text-blue-600"/>}
                                    <div>
                                        <p className="font-medium">{opt.title}</p>
                                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                                    </div>
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
