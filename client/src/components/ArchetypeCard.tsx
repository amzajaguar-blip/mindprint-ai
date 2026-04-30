import type { ArchetypePalette } from "@/lib/archetypePalette";

export function RarityBar({
  value,
  palette,
  bars = 20,
}: {
  value: number;
  palette: ArchetypePalette;
  bars?: number;
}) {
  const filled = Math.round(((100 - value) / 100) * bars);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[2px]">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm transition-all"
            style={{
              width: "3px",
              height: i < filled ? "10px" : "6px",
              background: i < filled
                ? `linear-gradient(180deg, ${palette.a}, ${palette.b})`
                : "rgba(255,255,255,0.05)",
              boxShadow: i < filled ? `0 0 5px ${palette.a}90` : "none",
              alignSelf: "flex-end",
            }}
          />
        ))}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[9px] font-mono leading-none" style={{ color: palette.b }}>
          top {value}%
        </span>
        <span className="text-[8px] font-mono opacity-30 leading-none mt-0.5">
          {value < 5 ? "◈ Ultra Raro" : value < 15 ? "✦ Raro" : value < 30 ? "⟡ Insolito" : "◉ Comune"}
        </span>
      </div>
    </div>
  );
}

export function CardPattern({ palette }: { palette: ArchetypePalette }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 560"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.065 }}
    >
      {/* Outer circles */}
      <circle cx="200" cy="280" r="195" stroke={palette.a} strokeWidth="0.4" />
      <circle cx="200" cy="280" r="160" stroke={palette.b} strokeWidth="0.35" />
      <circle cx="200" cy="280" r="110" stroke={palette.c} strokeWidth="0.35" />
      <circle cx="200" cy="280" r="70"  stroke={palette.a} strokeWidth="0.3" />
      <circle cx="200" cy="280" r="32"  stroke={palette.b} strokeWidth="0.3" />

      {/* Star of David triangles */}
      <polygon points="200,85 345,345 55,345"  stroke={palette.a} strokeWidth="0.45" fill="none" />
      <polygon points="200,475 345,215 55,215"  stroke={palette.c} strokeWidth="0.45" fill="none" />

      {/* Inner hexagon lines */}
      <polygon points="200,170 295,225 295,335 200,390 105,335 105,225" stroke={palette.b} strokeWidth="0.3" fill="none" />

      {/* Cross axis */}
      <line x1="200" y1="84" x2="200" y2="476" stroke={palette.b} strokeWidth="0.25" />
      <line x1="4"   y1="280" x2="396" y2="280" stroke={palette.b} strokeWidth="0.25" />

      {/* Diagonal axes */}
      <line x1="55"  y1="140" x2="345" y2="420" stroke={palette.a} strokeWidth="0.2" />
      <line x1="345" y1="140" x2="55"  y2="420" stroke={palette.a} strokeWidth="0.2" />

      {/* Center dot */}
      <circle cx="200" cy="280" r="3" fill={palette.a} />
    </svg>
  );
}

export function CornerBrackets({ palette }: { palette: ArchetypePalette }) {
  return (
    <>
      {/* Top-left */}
      <div className="absolute top-0 left-0 z-10" style={{ width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M2 18 L2 2 L18 2" stroke={palette.a} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="2" cy="2" r="1.5" fill={palette.a} />
        </svg>
      </div>
      {/* Top-right */}
      <div className="absolute top-0 right-0 z-10" style={{ width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M18 2 L34 2 L34 18" stroke={palette.b} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="34" cy="2" r="1.5" fill={palette.b} />
        </svg>
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 z-10" style={{ width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M2 18 L2 34 L18 34" stroke={palette.c} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="2" cy="34" r="1.5" fill={palette.c} />
        </svg>
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 z-10" style={{ width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M18 34 L34 34 L34 18" stroke={palette.a} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="34" cy="34" r="1.5" fill={palette.a} />
        </svg>
      </div>
    </>
  );
}

export function ScanLineOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
      }}
    />
  );
}

export function HolographicSheen({ palette }: { palette: ArchetypePalette }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${palette.a}08 0%, transparent 40%, ${palette.c}06 100%)`,
      }}
    />
  );
}
