import type { BookEntry } from "@/lib/types";

export default function Books({ body }: { body: { entries: BookEntry[] } }) {
  return (
    <div className="space-y-4">
      {body.entries.map((b, i) => (
        <div key={i} className="rounded border border-current/20 px-3 py-3">
          <div className="flex items-baseline justify-between">
            <h3 className="font-bold text-lg">{b.title}</h3>
            <span className="text-[11px] uppercase tracking-wide opacity-60">{b.language}</span>
          </div>
          <p className="italic opacity-80">{b.author}</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            {b.keyIdeas.map((idea, j) => (
              <li key={j}>{idea}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
