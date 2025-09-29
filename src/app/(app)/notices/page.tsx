

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { MailWarning, Upload, AlertTriangle, Wand2, UserCheck, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { servicePricing } from "@/lib/on-demand-pricing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NoticesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [noticeType, setNoticeType] = useState("GST_NOTICE");
    const [file, setFile] = useState<File | null>(null);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // New state for addressing fields
    const [to, setTo] = useState("The Proper Officer");
    const [department, setDepartment] = useState("GST Department, Range-X");
    const [address, setAddress] = useState("City, State");

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

        setIsLoading(true);
        toast({
            title: "Analyzing Notice...",
            description: "AI is preparing a draft response.",
        });

        // Simulate AI processing
        setTimeout(() => {
            const simulatedResponse = `
To,
${to},
${department},
${address}.

Subject: Response to Notice Ref: ${Math.random().toString(36).substring(2, 10).toUpperCase()}

Dear Sir/Madam,

This is in reference to the notice regarding a discrepancy in ITC claimed for the month of April 2024.

We have reviewed our records and found that the difference of ₹1,800 is due to an invoice from ABC Suppliers (GSTIN: 27ABCDE1234F1Z5) which was filed by them in their GSTR-1 for May 2024, while we had accounted for it in April 2024.

The corresponding credit is correctly reflected in our GSTR-2B for May 2024. We have attached a reconciliation statement for your reference.

We request you to kindly consider this explanation and drop the proceedings.

Thank you,
For [Your Company Name]
`;
            setAiResponse(simulatedResponse.trim());
            setIsLoading(false);
        }, 2000);
    }

    const handleDownload = () => {
        if (!aiResponse) return;
        const blob = new Blob([aiResponse], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'AI_Draft_Response.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Download Started", description: "Your draft reply has been downloaded." });
    };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                <MailWarning /> AI-Powered Notice Responder
            </h1>
            <p className="text-muted-foreground mt-2">
                Upload a departmental notice, and our AI will analyze it and generate a draft reply.
            </p>
        </div>

      <Card>
          <CardHeader>
              <CardTitle>Submit Your Notice</CardTitle>
              <CardDescription>Provide the notice details and our AI will draft a preliminary response.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="notice-upload">Upload Notice Document</Label>
                    <Input id="notice-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                 </div>
             </div>
             <div>
                <h3 className="text-md font-medium">Addressing Details</h3>
                <div className="grid md:grid-cols-3 gap-4 mt-2">
                    <div className="space-y-2">
                        <Label>To</Label>
                        <Input value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Department / Ward</Label>
                        <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                </div>
             </div>
             <div className="space-y-2">
                <Label htmlFor="description">Brief Description of Case (Optional)</Label>
                <Textarea id="description" placeholder="Provide some background about the notice..." className="min-h-24"/>
             </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button onClick={handleSubmit} size="lg" disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                Generate AI Draft Reply
            </Button>
          </CardFooter>
      </Card>

      {aiResponse && (
        <Card className="animate-in fade-in-50">
            <CardHeader>
                <CardTitle>AI-Generated Draft Reply</CardTitle>
                <CardDescription>
                    Review the draft generated by the AI. You can edit the text directly before finalizing.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea className="min-h-80 font-mono" value={aiResponse} onChange={(e) => setAiResponse(e.target.value)} />
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important Disclaimer</AlertTitle>
                    <AlertDescription>
                        This draft is generated by AI and may contain mistakes. It is intended as a starting point and is not a substitute for professional legal or tax advice. Always consult a qualified professional before sending any response.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex justify-between items-center flex-wrap gap-2">
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast({title: "Draft Saved!", description: "Your response draft has been saved."})}>
                        <Save className="mr-2" />
                        Save Draft
                    </Button>
                    <Button variant="secondary" onClick={handleDownload}>
                        <Download className="mr-2" />
                        Download Reply
                    </Button>
                 </div>
                 <Button onClick={() => router.push('/book-appointment')}>
                    <UserCheck className="mr-2"/>
                    Consult a Professional
                </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
