import type { JokeDialogue } from "@/lib/types";

export default function Jokes({ body }: { body: { dialogues: JokeDialogue[] } }) {
  return (
    <div className="space-y-5">
      {body.dialogues.map((d, i) => (
        <div key={i} className="rounded border border-current/20 px-3 py-3 font-[family-name:var(--font-arial)] font-bold">
          <p>
            <span className="opacity-70">{d.characterA}: </span>
            {d.setup}
          </p>
          <p>
            <span className="opacity-70">{d.characterB}: </span>
            {d.punchline}
          </p>
          {d.tiedToStory && (
            <p className="mt-1 text-[11px] font-normal italic opacity-60">
              (Riffing on: {d.tiedToStory})
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
