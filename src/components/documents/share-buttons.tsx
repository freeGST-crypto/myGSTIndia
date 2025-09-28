
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, Loader2, Linkedin, Twitter, Facebook, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ShareButtonsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  whatsappMessage: string;
}

export const ShareButtons = ({ contentRef, fileName, whatsappMessage }: ShareButtonsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: fileName,
    onBeforeGetContent: () => setIsProcessing(true),
    onAfterPrint: () => {
      setIsProcessing(false);
      toast({ title: "Print job completed." });
    },
    onPrintError: () => {
      setIsProcessing(false);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to print or save PDF.' });
    },
  });
  
  const handleDownloadPdf = async () => {
    const element = contentRef.current;
    if (!element) {
        toast({variant: 'destructive', title: 'Error', description: 'Could not find the content to download.'});
        return;
    }
    
    setIsProcessing(true);
    toast({ title: 'Generating PDF...', description: 'Please wait while your document is being prepared.'});
    
    try {
        const pdf = new jsPDF('p', 'pt', 'a4');
        await pdf.html(element, {
            callback: function (doc) {
                doc.save(`${fileName}.pdf`);
            },
            x: 10,
            y: 10,
            width: 190, // A4 width in mm approx
            windowWidth: element.scrollWidth,
            autoPaging: 'slice',
        });
        toast({ title: "Download Successful", description: `${fileName}.pdf has been downloaded.` });
    } catch (error) {
        console.error(error);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.'});
    } finally {
        setIsProcessing(false);
    }
  };

  const handleShare = (platform: "whatsapp") => {
    let shareUrl = "";
    switch (platform) {
       case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
        break;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };


  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handlePrint} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
        Print
      </Button>
      <Button onClick={handleDownloadPdf} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
        Download PDF
      </Button>
      <Button variant="outline" onClick={() => handleShare("whatsapp")}>
          <MessageSquare className="mr-2" /> Share on WhatsApp
      </Button>
    </div>
  );
};
