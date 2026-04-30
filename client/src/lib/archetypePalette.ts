export type ArchetypePalette = {
  a: string;
  b: string;
  c: string;
  glow: string;
};

// All colors are luminance-safe (≥ L50 on #08080F background)
export const PALETTES: ArchetypePalette[] = [
  { a: "#8B5CF6", b: "#C084FC", c: "#D946EF", glow: "rgba(139,92,246,0.28)" },
  { a: "#22D3EE", b: "#67E8F9", c: "#0EA5E9", glow: "rgba(34,211,238,0.28)" },
  { a: "#FBBF24", b: "#FDE68A", c: "#F97316", glow: "rgba(251,191,36,0.28)" },
  { a: "#F87171", b: "#FCA5A5", c: "#EC4899", glow: "rgba(248,113,113,0.28)" },
  { a: "#34D399", b: "#6EE7B7", c: "#22D3EE", glow: "rgba(52,211,153,0.28)" },
  { a: "#E879F9", b: "#F0ABFC", c: "#818CF8", glow: "rgba(232,121,249,0.28)" },
  { a: "#818CF8", b: "#A5B4FC", c: "#C084FC", glow: "rgba(129,140,248,0.28)" },
  { a: "#2DD4BF", b: "#5EEAD4", c: "#818CF8", glow: "rgba(45,212,191,0.28)" },
];

export function getPalette(name: string | null | undefined): ArchetypePalette {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTES[Math.abs(hash) % PALETTES.length];
}
