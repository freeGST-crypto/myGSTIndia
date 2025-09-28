"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileDown, MessageSquare } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import React from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  whatsappMessage?: string;
}

export function ShareButtons({ contentRef, fileName, whatsappMessage }: ShareButtonsProps) {
  const { toast } = useToast();

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: fileName,
  });

  // Multi-page PDF download using html2pdf.js
  const handleDownloadPDF = () => {
    if (!contentRef.current) return;

    toast({ title: "Generating PDF...", description: "Please wait..." });

    const options = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: `${fileName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(options)
      .from(contentRef.current)
      .save()
      .then(() => {
        toast({ title: "Download Complete", description: `${fileName}.pdf has been downloaded.` });
      })
      .catch((err) => {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Failed to generate PDF." });
      });
  };

  // WhatsApp share
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
        <Printer className="mr-2" /> Print
      </Button>

      <Button onClick={handleDownloadPDF}>
        <FileDown className="mr-2" /> Download PDF
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
