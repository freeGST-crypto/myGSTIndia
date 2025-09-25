
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, Loader2, Linkedin, Twitter, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  
  const handleShare = (platform: "linkedin" | "twitter" | "facebook" | "whatsapp") => {
    const fullUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const title = document.title;
    let shareUrl = "";
    
    switch (platform) {
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        break;
       case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
        break;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };


  return (
    <div className="flex gap-2">
      <Button onClick={handlePrint} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
        Download PDF
      </Button>
      <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline">
                <MessageSquare className="mr-2" /> Share
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleShare("whatsapp")}><MessageSquare className="text-[#25D366]"/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleShare("linkedin")}><Linkedin className="text-[#0A66C2]"/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleShare("twitter")}><Twitter className="text-[#1DA1F2]"/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleShare("facebook")}><Facebook className="text-[#1877F2]"/></Button>
            </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
