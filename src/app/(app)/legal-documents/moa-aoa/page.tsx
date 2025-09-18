
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { ArrowLeft, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateMoaObjectsAction } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  companyName: z.string().min(3, "Company name is required."),
  businessDescription: z.string().min(20, "Please provide a more detailed description (at least 20 characters)."),
});

type FormData = z.infer<typeof formSchema>;

export default function MoaAoaPage() {
  const { toast } = useToast();
  const [generatedObjects, setGeneratedObjects] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      businessDescription: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsGenerating(true);
    setGeneratedObjects(null);
    try {
      const result = await generateMoaObjectsAction(values);
      if (result?.mainObjects) {
        setGeneratedObjects(result.mainObjects);
        toast({ title: "Main Objects Clause Generated" });
      } else {
        toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate the MOA clause." });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "An error occurred while generating the clause." });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Document Selection
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">MOA: Main Objects Clause Generator</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate the main objects clause for your company's Memorandum of Association (MOA). This is a critical step in defining the scope of your business for incorporation.
        </p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Provide a clear description of your business activities. The AI will use this to draft a formal "Main Objects" clause.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Acme Innovations Pvt. Ltd." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Business Activities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'We are building a SaaS platform for GST compliance, accounting, and legal document generation. Our target audience is small and medium businesses in India.'"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                Generate Main Objects Clause
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {generatedObjects && (
        <Card>
           <CardHeader>
                <CardTitle>Generated Main Objects Clause</CardTitle>
                <CardDescription>Below is the AI-generated clause for your MOA. You can copy this and use it in your incorporation documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle>AI-Generated Draft</AlertTitle>
                    <AlertDescription className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                        {generatedObjects}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
