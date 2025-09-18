
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    id: "freemium",
    name: "Freemium",
    price: "Free",
    priceSuffix: "",
    description: "For individuals and small businesses just getting started with billing.",
    features: [
      { text: "Up to 20 Invoices/Purchases per month", included: true },
      { text: "Customer & Vendor Management", included: true },
      { text: "Basic Billing Reports", included: true },
      { text: "Financial Statements", included: false },
      { text: "GST & TDS Compliance Tools", included: false },
      { text: "Admin Panel / Client Management", included: false },
    ],
    cta: "Choose Freemium",
  },
  {
    id: "business",
    name: "Business",
    price: "₹199",
    priceSuffix: "/ month",
    description: "For businesses needing comprehensive accounting, financial reporting, and tax compliance.",
    features: [
      { text: "Unlimited Invoices & Purchases", included: true },
      { text: "Full Accounting Suite", included: true },
      { text: "Financial Statement Generation", included: true },
      { text: "Basic GST Reporting", included: true },
      { text: "TDS/TCS Reports", included: true },
      { text: "Admin Panel / Client Management", included: false },
    ],
    cta: "Choose Business Plan",
    isPopular: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: "₹499",
    priceSuffix: "/ month",
    description: "For CAs, tax consultants, and firms managing multiple clients.",
    features: [
      { text: "All Business Features", included: true },
      { text: "Full GST Filing & Reconciliation Suite", included: true },
      { text: "Legal & CA Certificate Generators", included: true },
      { text: "CMA Report Generator", included: true },
      { text: "Admin Panel with Client Management", included: true },
      { text: "Priority Support", included: true },
    ],
    cta: "Choose Professional Plan",
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState("business");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Pricing Plans</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose the plan that's right for you. From simple billing to comprehensive professional tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "flex flex-col transition-all cursor-pointer",
              selectedPlan === tier.id ? "border-primary ring-2 ring-primary shadow-lg" : "hover:shadow-md"
            )}
             onClick={() => setSelectedPlan(tier.id)}
          >
            <CardHeader className="relative">
              {tier.isPopular && (
                <div className="absolute top-0 right-4 -mt-3">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              <CardTitle>{tier.name}</CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.priceSuffix && (
                  <span className="text-muted-foreground ml-1">
                    {tier.priceSuffix}
                  </span>
                )}
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="size-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={selectedPlan === tier.id ? "default" : "outline"}
              >
                {selectedPlan === tier.id ? (
                  <>
                    <Check className="mr-2" />
                    Selected
                  </>
                ) : (
                  tier.cta
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
