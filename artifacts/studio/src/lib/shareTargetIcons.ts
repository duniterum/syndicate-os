// lib/shareTargetIcons.ts — THE one target→icon authority (2026-08-03).
//
// The lucide mark for each share target lived as THREE private map literals
// (ShareMenu · ReceiptTicket · ReferralCommissionsPanel) — the twin-search
// law makes it ONE importable fact; guard-share-intents keeps it that way.
// Pure value module: icon component REFERENCES only, no JSX. X renders the
// Twitter glyph (lucide's own naming); callers fall back to Share2 for an
// id this map does not know.

import type { LucideIcon } from "lucide-react";
import { Facebook, Linkedin, Mail, MessageCircle, Send, Twitter } from "lucide-react";

export const shareTargetIcons: Record<string, LucideIcon> = {
  x: Twitter,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: Send,
  linkedin: Linkedin,
  email: Mail,
};
