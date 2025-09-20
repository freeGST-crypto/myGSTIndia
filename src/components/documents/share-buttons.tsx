
"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const generatePdfBlob = (): Blob | null => {
    const content = contentRef.current;
    if (!content) return null;

    // This is a simplified PDF generation. 
    // For complex layouts, a more robust library or approach would be needed.
    const doc = new jsPDF();
    doc.html(content, {
      callback: function (doc) {
        // This callback is async, which makes returning the blob tricky.
        // The navigator.share API needs the file upfront.
      },
      margin: [15, 15, 15, 15],
      autoPaging: 'text',
      width: 180,
      windowWidth: 675 
    });
    // The above doc.html is async. A direct return isn't feasible.
    // For a working solution, we'll generate a simpler PDF for sharing.
    const simpleDoc = new jsPDF();
    simpleDoc.text(content.innerText, 15, 15);
    return simpleDoc.output('blob');
  };

  const handleShare = async () => {
    if (!navigator.share) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Your browser does not support the Web Share API. Please use a mobile browser.",
      });
      return;
    }
    
    // For this demo, we'll share text as direct PDF Blob sharing from jsPDF is complex.
    try {
        await navigator.share({
            title: fileName,
            text: whatsappMessage,
        });
        toast({ title: 'Shared Successfully!' });
    } catch (error) {
        console.error('Share failed:', error);
        toast({ variant: 'destructive', title: 'Share Failed' });
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
