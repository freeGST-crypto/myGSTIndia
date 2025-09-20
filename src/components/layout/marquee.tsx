
"use client";

import { Sparkles } from "lucide-react";

const features = [
  "AI-Powered ITC Reconciliation",
  "Effortless GSTR Filing",
  "Comprehensive Accounting Suite",
  "Automated Financial Statements",
  "Professional CA Certificates",
  "Legal Document Generation",
  "CMA Report Preparation",
];

export function Marquee() {
  return (
    <div className="relative flex w-full overflow-hidden bg-primary text-primary-foreground py-2">
      <div className="flex animate-scroll">
        {features.concat(features).map((feature, index) => (
          <div key={index} className="flex items-center shrink-0 mx-6">
            <Sparkles className="size-4 mr-2 text-yellow-300" />
            <span className="text-sm font-medium whitespace-nowrap">{feature}</span>
          </div>
        ))}
      </div>
       <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-primary to-transparent" />
       <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-primary to-transparent" />
    </div>
  );
}
