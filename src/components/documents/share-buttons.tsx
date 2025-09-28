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
}

export function ShareButtons({ contentRef, fileName }: ShareButtonsProps) {
  const { toast } = useToast();
  
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: fileName,
  });

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    toast({
      title: "Generating PDF...",
      description: "Please wait while the document is being prepared.",
    });

    const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
    toast({
      title: "Download Complete",
      description: `${fileName}.pdf has been downloaded.`,
    });
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
