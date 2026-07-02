export function SeatThroneMark({ className = "" }: { className?: string }) {
  return (
    <picture className={`block ${className}`}>
      <source srcSet="/hero/throne.webp" type="image/webp" />
      <img
        src="/hero/throne.png"
        alt="The Syndicate seat"
        className="h-full w-full object-contain drop-shadow-[0_0_36px_rgba(245,183,71,0.55)]"
        draggable={false}
      />
    </picture>
  );
}
