
"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileDown, MessageSquare } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import React from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  whatsappMessage?: string;
}

export function ShareButtons({ contentRef, fileName, whatsappMessage }: ShareButtonsProps) {
  const { toast } = useToast();

  // Print handler - this uses the browser's native print functionality
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: fileName,
  });

  const handleDownloadPDF = async () => {
    const input = contentRef.current;
    if (!input) {
        toast({ variant: "destructive", title: "Error", description: "Printable content not found." });
        return;
    }

    toast({ title: "Generating PDF...", description: "Please wait while the document is being prepared." });

    try {
        const canvas = await html2canvas(input, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            scrollY: -window.scrollY,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps= pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        
        const ratio = imgWidth / pdfWidth;
        const canvasHeight = imgHeight / ratio;
        
        let heightLeft = canvasHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages
        while (heightLeft > 0) {
            position = heightLeft - canvasHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${fileName}.pdf`);
        toast({ title: "Download Complete", description: `${fileName}.pdf has been downloaded.` });

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to generate PDF. Please try again." });
    }
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
