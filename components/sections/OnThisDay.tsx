import type { OnThisDayBody } from "@/lib/types";

export default function OnThisDay({ body }: { body: OnThisDayBody }) {
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {body.events.map((e, i) => (
          <li key={i}>
            <span className="font-bold">{e.year}</span>
            {(e.era || e.culture) && (
              <span className="text-[11px] uppercase tracking-wide opacity-60 ml-2">
                {[e.era, e.culture].filter(Boolean).join(" · ")}
              </span>
            )}
            <p>{e.event}</p>
          </li>
        ))}
      </ul>
      {body.gaps && body.gaps.length > 0 && (
        <p className="text-sm italic opacity-70">{body.gaps.join(" ")}</p>
      )}
    </div>
  );
}
