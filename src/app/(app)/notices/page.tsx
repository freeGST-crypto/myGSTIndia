
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MailWarning, Upload, FileCheck, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const formSchema = z.object({
  noticeType: z.string().min(1, "Please select the type of notice."),
  description: z.string().min(10, "Please provide a brief description of your case."),
  noticeFile: z.custom<File>(val => val instanceof File, "A notice file is required."),
});

type FormData = z.infer<typeof formSchema>;

const noticeFees = {
    gst: 5000,
    income_tax: 4000,
    roc: 6000,
    other: 7500,
}

export default function NoticesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noticeType: "gst",
      description: "",
    },
  });

  const watchNoticeType = form.watch("noticeType") as keyof typeof noticeFees;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("noticeFile", file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null); // Clear preview for non-image files like PDFs
      }
    }
  };

  const onSubmit = (values: FormData) => {
    setIsLoading(true);
    console.log(values);

    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: "Notice Submitted Successfully!",
            description: "Our team has received your submission and will get in touch with you shortly. A payment link has been sent to your registered email.",
        });
        form.reset();
        setFilePreview(null);
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
            <MailWarning className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Handle Notices</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Received a notice from a government department? Upload it here for expert analysis and resolution by our professional team.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Notice</CardTitle>
              <CardDescription>
                Provide the notice details and a brief description of your case.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <FormField
                  control={form.control}
                  name="noticeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice From</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gst">GST Department</SelectItem>
                          <SelectItem value="income_tax">Income Tax Department</SelectItem>
                          <SelectItem value="roc">Registrar of Companies (ROC)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="noticeFile"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Notice</FormLabel>
                            <FormControl>
                                <div 
                                    className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {filePreview ? (
                                        <Image src={filePreview} alt="Notice Preview" fill className="object-contain p-2 rounded-lg" />
                                    ) : field.value ? (
                                        <div className="text-center text-primary">
                                            <FileCheck className="mx-auto h-8 w-8" />
                                            <p className="mt-2 text-sm font-semibold">{field.value.name}</p>
                                        </div>
                                    ) : (
                                         <div className="text-center text-muted-foreground">
                                            <Upload className="mx-auto h-8 w-8" />
                                            <p className="mt-2 text-sm">Click to upload or drag & drop</p>
                                            <p className="text-xs">PDF, PNG, JPG accepted</p>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <Input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief Description of Case</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide some background about the notice..." className="min-h-24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="p-4 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-secondary-foreground">Professional Fee</span>
                        <span className="text-2xl font-bold text-primary">₹{noticeFees[watchNoticeType].toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">This fee is for initial analysis and suggested reply. Further action may be charged separately.</p>
                </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2"/>}
                Submit for Review
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
