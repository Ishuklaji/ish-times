"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NavBar from "./NavBar";
import SectionCardShell from "./SectionCardShell";
import SectionRouter from "./SectionRouter";
import { SECTION_REGISTRY, getSectionDef } from "@/lib/sections-registry";
import type { Section } from "@/lib/types";

export default function CardDeck({ sections }: { sections: Section[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el || el.clientWidth === 0) return;
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIndex((prev) => (prev === index ? prev : index));
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(sections.length - 1, index));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }, [sections.length]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <NavBar
        defs={SECTION_REGISTRY}
        activeIndex={activeIndex}
        onPrev={() => scrollToIndex(activeIndex - 1)}
        onNext={() => scrollToIndex(activeIndex + 1)}
        onJump={scrollToIndex}
      />
      <div ref={containerRef} className="card-deck flex-1 min-h-0">
        {sections.map((section) => {
          const def = getSectionDef(section.id);
          if (!def) return null;
          return (
            <SectionCardShell key={section.id} def={def} meta={section.meta}>
              <SectionRouter section={section} />
            </SectionCardShell>
          );
        })}
      </div>
    </div>
  );
}
