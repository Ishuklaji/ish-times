import type { Edition } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Masthead({ edition }: { edition: Edition }) {
  return (
    <header className="border-b-4 border-[#1a1a1a] bg-[#f4f1ea] px-4 pt-4 pb-3 text-center">
      <p className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase tracking-[0.2em] text-[#4a4a4a]">
        Edition No. {edition.editionNumber} · {formatDate(edition.date)}
      </p>
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold tracking-tight my-1">
        THE ISH TIMES
      </h1>
      <p className="font-[family-name:var(--font-source-serif)] text-sm text-[#4a4a4a]">
        Prepared for {edition.preparedFor}
      </p>
      <p className="font-[family-name:var(--font-cormorant)] italic text-base sm:text-lg mt-2 max-w-prose mx-auto">
        &ldquo;{edition.pullQuote}&rdquo;
      </p>
    </header>
  );
}
