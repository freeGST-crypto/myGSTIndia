
"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

type ShareButtonsProps = {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  whatsappMessage: string;
};

export function ShareButtons({ contentRef, fileName, whatsappMessage }: ShareButtonsProps) {
  const { toast } = useToast();

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: fileName,
    onAfterPrint: () => toast({ title: "Print/Save job sent." }),
  });

  const generatePdfForSharing = async (): Promise<File | null> => {
    const content = contentRef.current;
    if (!content) return null;

    try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const pdfBlob = pdf.output('blob');
        return new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });
    } catch (error) {
        console.error("Error generating PDF for sharing:", error);
        toast({ variant: 'destructive', title: 'PDF Generation Failed' });
        return null;
    }
  };


  const handleShare = async () => {
    const pdfFile = await generatePdfForSharing();
    if (!pdfFile) return;

    if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        try {
            await navigator.share({
                title: fileName,
                text: whatsappMessage,
                files: [pdfFile],
            });
            toast({ title: 'Shared Successfully!' });
        } catch (error) {
            console.error('Share failed:', error);
            if ((error as any).name !== 'AbortError') {
                 toast({ variant: 'destructive', title: 'Share Failed' });
            }
        }
    } else {
        toast({
            variant: "destructive",
            title: "Not Supported",
            description: "Your browser does not support file sharing. Please use a modern mobile browser.",
        });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2" /> Print / Save PDF
      </Button>
      <Button onClick={handleShare}>
        <MessageSquare className="mr-2" /> Share
      </Button>
    </div>
  );
}
