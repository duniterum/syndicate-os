// SeasonMedal — the struck-metal podium medallion (§9 craft: medals + ONE
// crown; soft glow is the ceiling). S2c: the ONE source for the metal look,
// used by the /season podium AND the home season teaser — never two stylings.
// Values come from the approved seasons mockups via the metal tokens
// (--gold-hi/-deep · --silver* · --bronze*, index.css — no raw colors).

const MEDAL_CLASS: Record<1 | 2 | 3, string> = {
  1: "syn-medal-gold",
  2: "syn-medal-silver",
  3: "syn-medal-bronze",
};

export function SeasonMedal({ rank, size = "md" }: { rank: 1 | 2 | 3; size?: "md" | "lg" }) {
  const large = size === "lg";
  return (
    <div
      className={`relative mx-auto mb-2 grid place-items-center rounded-full font-serif font-semibold text-gold-foreground ${
        large ? "h-14 w-14 text-2xl" : "h-11 w-11 text-lg"
      } ${MEDAL_CLASS[rank]}`}
      aria-label={`Rank ${rank}`}
    >
      {rank === 1 && (
        <svg
          className="absolute -top-[17px] left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_hsl(var(--gold)/0.5)]"
          width="32"
          height="19"
          viewBox="0 0 32 19"
          aria-hidden="true"
        >
          <path
            d="M3 17 L3 6.5 L9.5 11.5 L16 2 L22.5 11.5 L29 6.5 L29 17 Z"
            fill="hsl(var(--gold))"
            stroke="hsl(var(--gold-deep))"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {rank}
    </div>
  );
}
