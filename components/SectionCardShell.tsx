import type { ReactNode } from "react";
import type { SectionDef } from "@/lib/sections-registry";
import type { SectionMeta } from "@/lib/types";

const fontVarByFamily: Record<string, string> = {
  "Playfair Display": "var(--font-playfair)",
  "Source Serif 4": "var(--font-source-serif)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Cormorant Garamond": "var(--font-cormorant)",
  Arial: "var(--font-arial)",
};

export default function SectionCardShell({
  def,
  meta,
  children,
}: {
  def: SectionDef;
  meta: SectionMeta;
  children: ReactNode;
}) {
  const isForecast = meta.status === "forecast";
  const bodyFont = fontVarByFamily[def.font] ?? "var(--font-arial)";

  return (
    <article
      className="h-full w-full overflow-y-auto px-4 py-5 sm:px-8 sm:py-8"
      style={{ fontFamily: bodyFont }}
    >
      <div className="max-w-2xl mx-auto">
        <header
          className="border-b-2 pb-2 mb-4 flex items-baseline justify-between gap-3"
          style={{ borderColor: def.accent }}
        >
          <h2
            className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold"
            style={{ color: def.accent }}
          >
            {def.number}. {def.title}
          </h2>
          {isForecast && (
            <span className="shrink-0 rounded border border-dashed border-current px-2 py-0.5 text-[10px] uppercase tracking-wide font-[family-name:var(--font-arial)]" style={{ color: def.accent }}>
              Forecast
            </span>
          )}
        </header>

        {isForecast && (
          <div
            className="mb-4 rounded border border-dashed px-3 py-2 text-xs sm:text-sm font-[family-name:var(--font-arial)] bg-black/[0.03]"
            style={{ borderColor: def.accent }}
          >
            <p className="font-semibold">Forecast, not a repeat.</p>
            {meta.forecastNote && <p className="mt-0.5">{meta.forecastNote}</p>}
            {meta.watchFor && (
              <p className="mt-1 italic">Watch for: {meta.watchFor}</p>
            )}
          </div>
        )}

        <div className="text-[15px] sm:text-base leading-relaxed">{children}</div>

        {meta.discrepancies && meta.discrepancies.length > 0 && (
          <div className="mt-4 rounded border border-amber-600/50 bg-amber-50 px-3 py-2 text-xs font-[family-name:var(--font-arial)]">
            <p className="font-semibold text-amber-800">Sources disagree:</p>
            {meta.discrepancies.map((d, i) => (
              <p key={i} className="mt-1 text-amber-900">
                {d.claim} —{" "}
                {d.sources.map((s) => s.label).join(" vs. ")}
              </p>
            ))}
          </div>
        )}

        {meta.sources.length > 0 && (
          <footer className="mt-6 text-[11px] text-[#6b6b6b] font-[family-name:var(--font-arial)]">
            Sources:{" "}
            {meta.sources.map((s, i) => (
              <span key={i}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="underline">
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
                {i < meta.sources.length - 1 ? " · " : ""}
              </span>
            ))}
          </footer>
        )}
      </div>
    </article>
  );
}
