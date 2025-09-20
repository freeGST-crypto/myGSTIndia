
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";

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
      toast({ title: "Print/Save job completed." });
    },
    onPrintError: () => {
      setIsProcessing(false);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to print or save PDF.' });
    },
  });

  // Note: react-to-print doesn't easily support sharing via navigator.share API with a Blob.
  // The 'Share' button will now also trigger the print dialog, which on mobile browsers
  // often includes a "Share" or "Send to" option in the print preview.
  const handleShare = () => {
    toast({
      title: "Preparing to Share",
      description: "Please use the 'Share' or 'Send' option in your browser's print dialog.",
    });
    handlePrint();
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handlePrint} disabled={isProcessing}>
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
