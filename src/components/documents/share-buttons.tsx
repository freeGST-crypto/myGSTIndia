
"use client";

import { Button } from "@/components/ui/button";
import { Printer, MessageSquare } from "lucide-react";

type ShareButtonsProps = {
  onPrint: () => void;
  onShare: () => void;
};

export function ShareButtons({ onPrint, onShare }: ShareButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onPrint}>
        <Printer className="mr-2" /> Print / Save PDF
      </Button>
      <Button onClick={onShare}>
        <MessageSquare className="mr-2" /> Share
      </Button>
    </div>
  );
}

    