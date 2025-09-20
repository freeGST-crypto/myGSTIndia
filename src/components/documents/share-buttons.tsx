
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  whatsappMessage: string;
}

export const ShareButtons = ({ contentRef, fileName, whatsappMessage }: ShareButtonsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const element = contentRef.current;
    if (!element) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find the document content to share.' });
      return null;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const pdfRatio = pdfWidth / pdfHeight;

      let finalWidth, finalHeight;
      if(ratio > pdfRatio) {
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / ratio;
      } else {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * ratio;
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
      return pdf.output('blob');

    } catch (error) {
      console.error("Error generating PDF blob:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF for sharing.' });
      return null;
    }
  };


  const handleDownload = async () => {
    setIsProcessing(true);
    const pdfBlob = await generatePdfBlob();
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Download Started', description: `Your file ${fileName}.pdf is downloading.` });
    }
    setIsProcessing(false);
  };

  const handleShare = async () => {
    setIsProcessing(true);
    const pdfBlob = await generatePdfBlob();
    if (!pdfBlob) {
      setIsProcessing(false);
      return;
    }

    const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: fileName,
          text: whatsappMessage,
          files: [pdfFile],
        });
        toast({ title: 'Shared Successfully!' });
      } catch (error) {
        // This can happen if the user cancels the share sheet
        console.error('Share failed:', error);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Sharing Not Supported',
        description: 'Your browser does not support direct file sharing. Please download the PDF instead.',
      });
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleDownload} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
        Download PDF
      </Button>
      <Button variant="outline" onClick={handleShare} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <MessageSquare className="mr-2" />}
        Share
      </Button>
    </div>
  );
};
