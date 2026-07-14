// The hero's ONE icon language (M1-b design law) — protocol/financial
// semantics shared by the map (SeatFlowDiagram) and the cards (HeroLedger,
// ProtocolOverviewPanel), so a stream never wears two glyphs. The literal
// water-drop for "Liquidity" died: liquidity is paired token reserves
// (Coins), not water. Vault = custody (Shield) · Operations = running the business
// (Briefcase) · Chronicle = the solemn register (ScrollText) · NFT artifacts =
// collectible memory (Gem) · Referrals = the introduction graph (Network) ·
// Burn = Proof of Burn (Flame) · Seats/membership = people joining (Users).
import {
  Briefcase,
  Coins,
  Flame,
  Gem,
  Network,
  ScrollText,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export const heroSourceIcons: Record<string, LucideIcon> = {
  membership: Users,
  chronicle: ScrollText,
  nft: Gem,
  lp: Coins,
  lpfees: Coins,
  referrals: Network,
  future: Sparkles,
};

export const heroRouteIcons: Record<string, LucideIcon> = {
  vault: Shield,
  liquidity: Coins,
  operations: Briefcase,
};

export const heroBurnIcon: LucideIcon = Flame;
