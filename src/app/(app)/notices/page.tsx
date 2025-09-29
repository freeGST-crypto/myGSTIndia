
"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MailWarning, Upload, FileText, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { servicePricing } from "@/lib/on-demand-pricing";

export default function NoticesPage() {
    const { toast } = useToast();
    const [noticeType, setNoticeType] = useState("GST_NOTICE");
    const [file, setFile] = useState<File | null>(null);

    const selectedService = servicePricing.notice_handling.find(s => s.id === noticeType);

    const handleSubmit = () => {
        if (!file || !noticeType) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please select a notice type and upload the document."
            });
            return;
        }

        // Simulate submission
        toast({
            title: "Notice Submitted for Review",
            description: "A professional will get in touch with you shortly. The fee will be charged upon acceptance.",
        });
    }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                <MailWarning /> Handle Notices
            </h1>
            <p className="text-muted-foreground mt-2">
                Upload and manage departmental notices for professional assistance.
            </p>
        </div>

      <Card>
          <CardHeader>
              <CardTitle>Submit Your Notice</CardTitle>
              <CardDescription>Provide the notice details and a brief description of your case.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="notice-from">Notice From</Label>
                <Select value={noticeType} onValueChange={setNoticeType}>
                    <SelectTrigger id="notice-from">
                        <SelectValue placeholder="Select department"/>
                    </SelectTrigger>
                    <SelectContent>
                        {servicePricing.notice_handling.map(service => (
                            <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label htmlFor="notice-upload">Upload Notice</Label>
                 <div className="flex items-center justify-center w-full">
                    <label htmlFor="notice-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                            <Upload className="w-8 h-8 mb-2" />
                            <p className="mb-2 text-sm">{file ? file.name : "Click to upload or drag & drop"}</p>
                            <p className="text-xs">PDF, PNG, JPG accepted</p>
                        </div>
                        <Input id="notice-upload" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                </div> 
             </div>
             <div className="space-y-2">
                <Label htmlFor="description">Brief Description of Case</Label>
                <Textarea id="description" placeholder="Provide some background about the notice..." className="min-h-24"/>
             </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <div className="w-full p-4 border rounded-lg bg-secondary/50">
                <h4 className="font-semibold">Professional Fee</h4>
                <p className="text-3xl font-bold flex items-center">
                    <IndianRupee className="size-6 mr-1"/>
                    {selectedService?.price.toLocaleString('en-IN') || '0'}
                </p>
                <p className="text-xs text-muted-foreground">This fee is for initial analysis and a suggested reply draft. Further action may be charged separately after consultation.</p>
            </div>
            <Button onClick={handleSubmit} size="lg">Submit for Review</Button>
          </CardFooter>
      </Card>
    </div>
  );
}
