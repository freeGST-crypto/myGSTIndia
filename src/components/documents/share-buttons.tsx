
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";

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
      toast({ title: "Print job sent to printer." });
    },
    onPrintError: () => {
      setIsProcessing(false);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to print document.' });
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
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
        });

        await pdf.html(element, {
            callback: function (doc) {
                doc.save(`${fileName}.pdf`);
            },
            x: 15,
            y: 15,
            width: 565,
            windowWidth: element.scrollWidth,
            autoPaging: 'slice',
            margin: [40, 0, 40, 0]
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

  const printTrigger = (
    <div onClick={handlePrint}>
      <Button variant="outline" disabled={isProcessing}>
        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
        Print
      </Button>
    </div>
  );

  return (
    <div className="flex gap-2">
      {printTrigger}
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

    