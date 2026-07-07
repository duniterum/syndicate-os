// components/referral/ShareMenu.tsx
//
// One Share button → a small popover of platform choices (X, Facebook,
// WhatsApp, Telegram, LinkedIn, email) plus copy. Small icons, one tap to the
// platform's own share dialog via its official intent URL.

import { useState } from "react";
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle, Send, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareTargets } from "@/lib/shareTargets";

const ICONS: Record<string, typeof Share2> = {
  x: Twitter,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: Send,
  linkedin: Linkedin,
  email: Mail,
};

export function ShareMenu({ url, text }: { url: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function openTarget(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function copyLink() {
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Share2 className="h-4 w-4 mr-1.5" />
        Share
      </Button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-border bg-popover p-1 shadow-md">
          {shareTargets.map((t) => {
            const Icon = ICONS[t.id] ?? Share2;
            return (
              <button
                key={t.id}
                onClick={() => openTarget(t.build(url, text))}
                className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {t.label}
              </button>
            );
          })}
          <div className="my-1 h-px bg-border" />
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-muted-foreground" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
