import type { StartupWatchBody } from "@/lib/types";

const trendColor: Record<StartupWatchBody["trend"], string> = {
  booming: "#15803D",
  steady: "#B45309",
  falling: "#B91C1C",
  mixed: "#6D28D9",
};

export default function StartupWatch({ body }: { body: StartupWatchBody }) {
  return (
    <div className="space-y-3">
      <span
        className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: trendColor[body.trend] }}
      >
        {body.trend}
      </span>
      <p>{body.summary}</p>
      {body.dataPoints.length > 0 && (
        <ul className="space-y-1 text-sm">
          {body.dataPoints.map((dp, i) => (
            <li key={i}>
              <span className="font-semibold">{dp.label}: </span>
              {dp.value}
              <span className="opacity-60"> ({dp.source})</span>
            </li>
          ))}
        </ul>
      )}
      {body.nuance && <p className="italic opacity-80">{body.nuance}</p>}
    </div>
  );
}
