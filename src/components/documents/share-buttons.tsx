
"use client";

import { Button } from "@/components/ui/button";
import { Printer, MessageSquare } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import React from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  whatsappMessage?: string;
}

export function ShareButtons({ contentRef, fileName, whatsappMessage }: ShareButtonsProps) {
  const { toast } = useToast();

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: fileName,
    onAfterPrint: () => toast({ title: "Print/Save Dialog Closed" }),
    onPrintError: () => toast({ variant: "destructive", title: "Print Error", description: "Failed to open print dialog." }),
  });

  const handleWhatsAppShare = () => {
    if (!whatsappMessage) {
      toast({
        variant: "destructive",
        title: "No message",
        description: "WhatsApp message not configured for this document.",
      });
      return;
    }
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2" /> Print / Save as PDF
      </Button>

      {whatsappMessage && (
        <Button
          variant="outline"
          onClick={handleWhatsAppShare}
          className="bg-green-100 text-green-700 hover:bg-green-200"
        >
          <MessageSquare className="mr-2" /> Share
        </Button>
      )}
    </div>
  );
}
