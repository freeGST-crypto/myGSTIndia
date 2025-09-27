
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, FileSpreadsheet, Users, Warehouse } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function ImportExportPage() {
    const { toast } = useToast();

    const handleFileUpload = (fileType: string) => {
        toast({
            title: "File Upload Simulated",
            description: `${fileType} file is being processed. In a real app, this would trigger a background import job.`,
        });
    };

    const handleDownloadTemplate = (fileType: string) => {
        const headers = getHeadersForTemplate(fileType);
        const exampleData = getExampleDataForTemplate(fileType);
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleData}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileType.toLowerCase()}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Template Downloaded", description: `${fileType} CSV template has been downloaded.` });
    };

    const getHeadersForTemplate = (type: string) => {
        switch(type) {
            case 'GSTR-1':
                return "GSTIN/UIN of Recipient,Receiver Name,Invoice Number,Invoice date,Invoice Value,Place Of Supply,Reverse Charge,Applicable % of Tax Rate,Invoice Type,E-Commerce GSTIN,Rate,Taxable Value,Cess Amount";
            case 'GSTR-2B':
                return "GSTIN of Supplier,Trade/Legal Name,Invoice number,Invoice type,Invoice date,Invoice value,Place of supply,Reverse charge,Rate,Taxable value,Integrated tax,Central tax,State tax,Cess";
            case 'Customers':
            case 'Vendors':
                return "Name,Email,Phone,GSTIN,Address Line 1,City,State,Pincode";
            case 'Items':
                return "Name,Description,HSN,Stock,Purchase Price,Selling Price";
            default:
                return "";
        }
    }
    
    const getExampleDataForTemplate = (type: string) => {
         switch(type) {
            case 'GSTR-1':
                return "29AABCI5678G1Z4,Innovate LLC,INV-001,01-07-2024,1180,29-Karnataka,N,18,Regular,,18,1000,0";
            case 'GSTR-2B':
                return "27LMNOP1234Q1Z9,Component Solutions,CS-556,Regular,15-06-2024,5900,27-Maharashtra,N,18,5000,900,0,0,0";
            case 'Customers':
            case 'Vendors':
                return "Sample Company,sample@email.com,9876543210,27ABCDE1234F1Z5,123 Sample St,Sample City,Sample State,123456";
            case 'Items':
                return "Sample Product,A sample description,12345678,10,100,150";
            default:
                return "";
        }
    }

    const ImportCard = ({ title, description, fileType, accept = ".csv, .xlsx, .json" }: { title: string, description: string, fileType: string, accept?: string }) => (
        <div className="space-y-2 p-4 border rounded-lg">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Input type="file" accept={accept} className="max-w-xs"/>
                <Button onClick={() => handleFileUpload(fileType)}><Upload className="mr-2"/> Import Data</Button>
                {accept.includes(".csv") && (
                    <Button variant="outline" onClick={() => handleDownloadTemplate(fileType)}><Download className="mr-2"/> Download Template</Button>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
                    <Download className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Import & Export Data</h1>
                <p className="text-muted-foreground">
                    Bulk upload your data from various sources to get started quickly.
                </p>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText/> Tally Data</CardTitle>
                    <CardDescription>Import masters and transactions from Tally by uploading an XML file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ImportCard 
                        title="Tally XML Import" 
                        description="Import vouchers, ledgers, and inventory data from Tally's 'Day Book' XML export." 
                        fileType="Tally XML"
                        accept=".xml"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileSpreadsheet/> GST Data</CardTitle>
                    <CardDescription>Import your monthly GST returns data from the official portal's JSON or CSV files.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ImportCard title="GSTR-1 Data" description="Import outward supplies data from GSTR-1." fileType="GSTR-1" />
                    <ImportCard title="GSTR-2B Data" description="Import ITC data from GSTR-2B for reconciliation." fileType="GSTR-2B" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users/> Masters</CardTitle>
                    <CardDescription>Import your customer, vendor, and item master data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ImportCard title="Customers" description="Bulk upload your customer list." fileType="Customers" />
                    <ImportCard title="Vendors" description="Bulk upload your vendor list." fileType="Vendors" />
                    <ImportCard title="Items" description="Bulk upload your products and services list." fileType="Items" />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText/> Other Data</CardTitle>
                    <CardDescription>Import other relevant financial data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ImportCard title="Bank Statement" description="Upload bank statements in CSV/XLS format for reconciliation." fileType="Bank Statement" />
                    <ImportCard title="Employee & Payroll Data" description="Import employee master data and salary components." fileType="Payroll" />
                </CardContent>
            </Card>
        </div>
    );
}
