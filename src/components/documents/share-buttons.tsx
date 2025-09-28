"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
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
  
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: fileName,
  });

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    toast({ title: "Generating PDF...", description: "Please wait while the document is being prepared." });

    const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY, // avoid cut-offs
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let position = 0;
    let heightLeft = pdfHeight;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Add remaining pages
    while (heightLeft > 0) {
        position = -heightLeft; // Correctly calculate the position for the next slice of the image
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
    toast({ title: "Download Complete", description: `${fileName}.pdf has been downloaded.` });
  };


  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2" /> Print
      </Button>
      <Button onClick={handleDownloadPDF}>
        <FileDown className="mr-2" /> Download PDF
      </Button>
    </div>
  );
}
