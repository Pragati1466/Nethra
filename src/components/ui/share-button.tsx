import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Try Web Share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NETHRA Traffic OS",
          text: "Check out this smart city traffic operations platform",
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or error, fall back to clipboard
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copied to clipboard", {
        description: "You can now share this page with others.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast.success("URL copied to clipboard", {
          description: "You can now share this page with others.",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        toast.error("Failed to copy URL", {
          description: "Please manually copy the URL from your browser.",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2 text-sm font-medium hover:bg-accent/40 transition-colors",
        className
      )}
      aria-label="Share this page"
    >
      {copied ? (
        <>
          <Check className="size-4 text-success" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="size-4" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
