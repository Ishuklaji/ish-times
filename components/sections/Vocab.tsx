import type { WordEntry } from "@/lib/types";

export default function Vocab({ body }: { body: { entries: WordEntry[] } }) {
  return (
    <div className="space-y-4">
      {body.entries.map((w, i) => (
        <div key={i} className="rounded border border-current/20 px-3 py-3">
          <div className="flex items-baseline gap-2">
            <h3 className="font-bold text-lg">{w.word}</h3>
            <span className="text-[11px] uppercase tracking-wide opacity-60">{w.language}</span>
            <span className="text-sm italic opacity-70">/{w.pronunciation}/</span>
          </div>
          <p>
            <span className="font-semibold">English: </span>
            {w.englishMeaning}
          </p>
          <p>
            <span className="font-semibold">Hindi: </span>
            {w.hindiMeaning}
          </p>
          <p className="italic mt-1">{w.englishSentence}</p>
          {w.germanSentence && <p className="italic">{w.germanSentence}</p>}
          {w.tiedToNews && (
            <p className="text-[11px] mt-1 opacity-60">Tied to: {w.tiedToNews}</p>
          )}
        </div>
      ))}
    </div>
  );
}
