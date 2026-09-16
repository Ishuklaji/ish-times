import type { NarrativeBody } from "@/lib/types";

export default function Narrative({ body }: { body: NarrativeBody }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">{body.headline}</h3>
      <p>
        <span className="font-semibold">What happened: </span>
        {body.whatHappened}
      </p>
      <p>
        <span className="font-semibold">Affects me: </span>
        {body.affectsMe}
      </p>
      {body.useIt && (
        <p>
          <span className="font-semibold">Use it: </span>
          {body.useIt}
        </p>
      )}
      <p className="italic">
        <span className="font-semibold not-italic">Talking point: </span>
        {body.talkingPoint}
      </p>
      {body.statBox && (
        <div className="inline-block rounded border border-current/30 px-3 py-2 mt-2">
          <p className="text-xs uppercase tracking-wide opacity-70">{body.statBox.label}</p>
          <p className="text-2xl font-bold">{body.statBox.value}</p>
          <p className="text-[11px] opacity-60">as of {body.statBox.asOf}</p>
        </div>
      )}
    </div>
  );
}
