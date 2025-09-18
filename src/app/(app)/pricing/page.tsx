
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
import { Check, X } from "lucide-react";

const tiers = [
  {
    name: "Basic",
    price: "Free",
    priceSuffix: "",
    description: "For individuals and small businesses just getting started.",
    features: [
      { text: "1 User", included: true },
      { text: "Up to 20 Invoices/Bills per month", included: true },
      { text: "Basic Legal Document Templates", included: true },
      { text: "AI-Powered Features", included: false },
      { text: "Admin Panel / Client Management", included: false },
      { text: "Priority Support", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Professional",
    price: "₹9,999",
    priceSuffix: "/ year",
    description: "For growing businesses and professionals managing clients.",
    features: [
      { text: "Up to 5 Users", included: true },
      { text: "Unlimited Invoices & Bills", included: true },
      { text: "Full Legal Document Library", included: true },
      { text: "AI-Powered Features", included: true },
      { text: "Admin Panel (Manage up to 10 clients)", included: true },
      { text: "Email & Chat Support", included: true },
    ],
    cta: "Upgrade to Professional",
    isPopular: true,
  },
  {
    name: "Business",
    price: "Contact Us",
    priceSuffix: "",
    description: "For large firms and businesses with custom needs.",
    features: [
      { text: "Unlimited Users", included: true },
      { text: "Unlimited Invoices & Bills", included: true },
      { text: "Full Legal Document Library", included: true },
      { text: "AI-Powered Features", included: true },
      { text: "Admin Panel (Unlimited clients)", included: true },
      { text: "Dedicated Account Manager & Priority Support", included: true },
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Pricing Plans</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose the plan that's right for your business. All plans are designed
          to scale with you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`flex flex-col ${
              tier.isPopular ? "border-primary shadow-lg" : ""
            }`}
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
                variant={tier.isPopular ? "default" : "outline"}
              >
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
