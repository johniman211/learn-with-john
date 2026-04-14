"use client";

import toast from "react-hot-toast";
import { Share2, Copy, Globe, ExternalLink, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  courseTitle: string;
  courseId: string;
}

export function ShareButton({ courseTitle, courseId }: ShareButtonProps) {
  const getUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/student/courses/${courseId}`;
    }
    return "";
  };

  const shareText = `Check out "${courseTitle}" on Learn with John!`;

  const copyLink = () => {
    navigator.clipboard.writeText(getUrl());
    toast.success("Link copied!");
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`,
      "_blank"
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`,
      "_blank"
    );
  };

  const shareLinkedin = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`,
      "_blank"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer">
          <Copy className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareTwitter} className="gap-2 cursor-pointer">
          <ExternalLink className="h-4 w-4" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareFacebook} className="gap-2 cursor-pointer">
          <Globe className="h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareLinkedin} className="gap-2 cursor-pointer">
          <Link2 className="h-4 w-4" />
          Share on LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
