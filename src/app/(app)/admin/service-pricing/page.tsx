
"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const initialServices = [
  { id: "CMA_REPORT", name: "CMA Report Generation", price: 5000 },
  { id: "NW_CERT", name: "Net Worth Certificate", price: 2500 },
  { id: "TC_CERT", name: "Turnover Certificate", price: 2500 },
  { id: "FR_CERT", name: "Form 15CB (Foreign Remittance)", price: 4000 },
  { id: "PARTNERSHIP_DEED", name: "Partnership Deed Drafting", price: 3000 },
  { id: "LLP_AGREEMENT", name: "LLP Agreement Drafting", price: 5000 },
  { id: "FOUNDERS_AGREEMENT", name: "Founders’ Agreement Drafting", price: 7500 },
];

type Service = typeof initialServices[0];

export default function ServicePricingPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>(initialServices);

  const handlePriceChange = (id: string, newPrice: number) => {
      setServices(services.map(s => s.id === id ? {...s, price: newPrice} : s));
  };
  
  const handleSaveChanges = () => {
      // In a real app, this would make an API call to save the prices.
      console.log("Saving new prices:", services);
      toast({
          title: "Prices Updated",
          description: "The new service prices have been saved successfully."
      });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard /> On-Demand Service Pricing
          </h1>
          <p className="text-muted-foreground">
            Set and manage the prices for pay-per-use services and documents.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service Price List</CardTitle>
          <CardDescription>
            Update the prices that will be shown to users when they access these on-demand features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Service / Document Name</TableHead>
                <TableHead className="text-right">Price (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-right">
                    <Input 
                      type="number" 
                      value={service.price} 
                      onChange={(e) => handlePriceChange(service.id, parseInt(e.target.value))}
                      className="w-32 ml-auto text-right"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end">
            <Button onClick={handleSaveChanges}>
                <Save className="mr-2" />
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
