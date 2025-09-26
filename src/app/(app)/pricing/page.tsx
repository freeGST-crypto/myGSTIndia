
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
import { Check, X, Edit, Save, IndianRupee, Ticket } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRoleSimulator } from "@/context/role-simulator-context";
import { Badge } from "@/components/ui/badge";

const initialTiers = [
  {
    id: "freemium",
    name: "Freemium",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "For individuals and small businesses just getting started with billing.",
    features: [
      { text: "Up to 20 Invoices/Purchases per month", included: true },
      { text: "Customer & Vendor Management", included: true },
      { text: "Basic Billing Reports", included: true },
      { text: "Financial Statements", included: false },
      { text: "GST & TDS Compliance Tools", included: false },
      { text: "Admin Panel / Client Management", included: false },
    ],
    cta: "Start for Free",
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 199,
    priceAnnual: 1999,
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
    priceMonthly: 499,
    priceAnnual: 4999,
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [tiers, setTiers] = useState(initialTiers);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const { toast } = useToast();
  const { simulatedRole } = useRoleSimulator(); // Using the role from context
  const isSuperAdmin = simulatedRole === 'super_admin';
  
  const handleEdit = (tierId: string) => {
    setEditingTier(tierId);
  };
  
  const handleSave = (tierId: string) => {
    setEditingTier(null);
    toast({ title: "Pricing Updated", description: `Prices for the ${tiers.find(t=>t.id === tierId)?.name} plan have been saved.`});
  };
  
  const handlePriceChange = (tierId: string, cycle: 'monthly' | 'annually', value: number) => {
      setTiers(prev => prev.map(tier => {
          if (tier.id === tierId) {
              return {
                  ...tier,
                  [cycle === 'monthly' ? 'priceMonthly' : 'priceAnnual']: value
              }
          }
          return tier;
      }))
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Pricing Plans</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose the plan that's right for you. From simple billing to comprehensive professional tools.
        </p>
         <div className="flex items-center justify-center space-x-2 mt-6">
          <Label htmlFor="billing-cycle">Monthly</Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === "annually"}
            onCheckedChange={(checked) =>
              setBillingCycle(checked ? "annually" : "monthly")
            }
          />
          <Label htmlFor="billing-cycle">Annually</Label>
          <Badge variant="secondary" className="ml-2">Save with annual plans!</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => {
          const isEditing = editingTier === tier.id;
          const price = billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnual;
          const priceSuffix = tier.priceMonthly > 0 ? `/${billingCycle === 'monthly' ? 'month' : 'year'}` : '';

          return (
          <Card
            key={tier.id}
            className={cn("flex flex-col transition-all", isEditing && "ring-2 ring-primary")}
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
                <div className="flex items-baseline h-10">
                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <IndianRupee className="size-5" />
                            <Input 
                                type="number" 
                                value={price} 
                                onChange={(e) => handlePriceChange(tier.id, billingCycle, Number(e.target.value))}
                                className="text-4xl font-bold w-48 border-2"
                            />
                        </div>
                    ) : (
                        <>
                            <span className="text-4xl font-bold">
                                {price > 0 ? `₹${price.toLocaleString('en-IN')}` : "Free"}
                            </span>
                            {price > 0 && <span className="text-muted-foreground ml-1">{priceSuffix}</span>}
                        </>
                    )}
                </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
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
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full">
                {tier.cta}
              </Button>
               {isSuperAdmin && !isEditing && (
                 <Button variant="outline" className="w-full" onClick={() => handleEdit(tier.id)}>
                    <Edit className="mr-2"/> Edit Plan
                </Button>
               )}
               {isSuperAdmin && isEditing && (
                <Button variant="secondary" className="w-full" onClick={() => handleSave(tier.id)}>
                    <Save className="mr-2"/> Save Changes
                </Button>
               )}
            </CardFooter>
          </Card>
        )})}
      </div>
    </div>
  );
}
