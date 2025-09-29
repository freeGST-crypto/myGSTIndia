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
import { MailWarning, Upload, UserCheck, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { servicePricing } from "@/lib/on-demand-pricing";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export default function NoticesPage() {
    const { toast } = useToast();
    const [noticeType, setNoticeType] = useState("GST_NOTICE");
    const [file, setFile] = useState<File | null>(null);
    const [dueDate, setDueDate] = useState<Date | undefined>();

    const selectedService = servicePricing.notice_handling.find(s => s.id === noticeType);
    const servicePrice = selectedService ? selectedService.price : 0;

    const handleSubmit = () => {
        if (!file || !noticeType || !dueDate) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please select a notice type, upload the document, and set a due date."
            });
            return;
        }

        toast({
            title: "Request Submitted Successfully!",
            description: "Your notice has been sent to the admin panel. A professional will be assigned shortly and will get in touch with you.",
        });
        
        // Reset form
        setNoticeType("GST_NOTICE");
        setFile(null);
        setDueDate(undefined);
    }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                <MailWarning /> Submit a Notice for Professional Opinion
            </h1>
            <p className="text-muted-foreground mt-2">
                Upload your departmental notice, and our team of experts will handle the rest.
            </p>
        </div>

      <Card>
          <CardHeader>
              <CardTitle>Submit Your Notice</CardTitle>
              <CardDescription>Provide the notice details to request a professional consultation and drafted response.</CardDescription>
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
                    <Label htmlFor="notice-upload">Upload Notice Document (PDF/Image)</Label>
                    <Input id="notice-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                 </div>
             </div>
              <div className="space-y-2">
                <Label>Due Date for Reply</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
             </div>
             <div className="space-y-2">
                <Label htmlFor="description">Brief Description of Case (Optional)</Label>
                <Textarea id="description" placeholder="Provide some background about the notice or your business context..." className="min-h-24"/>
             </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button onClick={handleSubmit} size="lg">
                 <Send className="mr-2" />
                Request Professional Opinion
                {servicePrice > 0 && <span className="ml-2 font-semibold">(Starts at ₹{servicePrice})</span>}
            </Button>
            <p className="text-xs text-muted-foreground">
                By submitting, you agree to our terms of service. A professional will contact you to confirm the final scope and fees before proceeding.
            </p>
          </CardFooter>
      </Card>
    </div>
  );
}
