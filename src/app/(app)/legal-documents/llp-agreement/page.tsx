
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
import { Form } from "@/components/ui/form";
import {
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { PlaceholderPage } from "@/components/placeholder-page";


const llpAgreementSchema = z.object({
  llpName: z.string().min(3, "LLP name is required."),
});

type FormData = z.infer<typeof llpAgreementSchema>;

export default function LlpAgreementPage() {
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(llpAgreementSchema),
    defaultValues: {},
  });

  const renderStep = () => {
    switch (step) {
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>LLP Agreement Generator</CardTitle>
            </CardHeader>
            <CardContent>
                 <PlaceholderPage 
                    title="Under Development"
                    description="This multi-step wizard for creating a detailed LLP Agreement is currently under construction. Please check back later."
                />
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/legal-documents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Document Selection
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">LLP Agreement Generator</h1>
        <p className="text-muted-foreground">Follow the steps to create your legal document for your Limited Liability Partnership.</p>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          {renderStep()}
        </form>
      </Form>
    </div>
  );
}
