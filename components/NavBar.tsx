"use client";

import { useEffect, useRef } from "react";
import type { SectionDef } from "@/lib/sections-registry";

export default function NavBar({
  defs,
  activeIndex,
  onPrev,
  onNext,
  onJump,
}: {
  defs: SectionDef[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
}) {
  const active = defs[activeIndex];
  const dotsRef = useRef<HTMLDivElement>(null);
  const activeDotRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeDotRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  return (
    <nav className="sticky top-0 z-10 border-b border-[#1a1a1a]/20 bg-[#f4f1ea]/95 backdrop-blur">
      <div className="flex items-center justify-between px-3 py-2 gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={activeIndex === 0}
          aria-label="Previous section"
          className="font-[family-name:var(--font-arial)] text-sm px-3 py-1.5 rounded border border-[#1a1a1a]/30 disabled:opacity-30 active:scale-95 transition"
        >
          ← Prev
        </button>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs sm:text-sm text-center flex-1 truncate">
          {active?.title} — {activeIndex + 1} / {defs.length}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={activeIndex === defs.length - 1}
          aria-label="Next section"
          className="font-[family-name:var(--font-arial)] text-sm px-3 py-1.5 rounded border border-[#1a1a1a]/30 disabled:opacity-30 active:scale-95 transition"
        >
          Next →
        </button>
      </div>
      <div
        ref={dotsRef}
        className="flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none]"
      >
        {defs.map((def, i) => (
          <button
            key={def.id}
            ref={i === activeIndex ? activeDotRef : undefined}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Go to ${def.title}`}
            aria-current={i === activeIndex}
            className="h-2 w-2 shrink-0 rounded-full transition-transform"
            style={{
              backgroundColor: i === activeIndex ? def.accent : "#1a1a1a33",
              transform: i === activeIndex ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </nav>
  );
}
