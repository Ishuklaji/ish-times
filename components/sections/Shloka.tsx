import type { ShlokaBody } from "@/lib/types";

export default function Shloka({ body }: { body: ShlokaBody }) {
  return (
    <div className="space-y-3">
      <p className="text-xl leading-relaxed whitespace-pre-line">{body.verse}</p>
      <p className="text-[11px] uppercase tracking-wide opacity-60">{body.source}</p>
      {body.wordByWord.length > 0 && (
        <ul className="text-sm space-y-0.5">
          {body.wordByWord.map((w, i) => (
            <li key={i}>
              <span className="font-semibold">{w.word}</span> — {w.meaning}
            </li>
          ))}
        </ul>
      )}
      <p>
        <span className="font-semibold">Hindi: </span>
        {body.hindiTranslation}
      </p>
      <p>
        <span className="font-semibold">English: </span>
        {body.englishTranslation}
      </p>
    </div>
  );
}
