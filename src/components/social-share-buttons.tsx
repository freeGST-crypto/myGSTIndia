
"use client";

import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Facebook, MessageSquare } from "lucide-react";

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

export const SocialShareButtons = ({ url, title }: SocialShareButtonsProps) => {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const handleShare = (platform: "linkedin" | "twitter" | "facebook" | "whatsapp") => {
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
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + fullUrl)}`;
        break;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => handleShare("linkedin")}>
        <Linkedin className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleShare("twitter")}>
        <Twitter className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleShare("facebook")}>
        <Facebook className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleShare("whatsapp")}>
        <MessageSquare className="size-4" />
      </Button>
    </div>
  );
};
