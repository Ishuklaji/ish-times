import type { MarketsBody } from "@/lib/types";

const arrow = { up: "▲", down: "▼", flat: "▬" } as const;
const arrowColor = { up: "#15803D", down: "#B91C1C", flat: "#6b6b6b" } as const;

export default function Markets({ body }: { body: MarketsBody }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        {body.indices.map((idx) => (
          <div key={idx.name} className="rounded border border-current/20 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {idx.region}
            </p>
            <p className="text-sm">{idx.name}</p>
            <p className="text-lg font-bold">{idx.value}</p>
            <p className="text-sm" style={{ color: arrowColor[idx.direction] }}>
              {arrow[idx.direction]} {idx.change}
            </p>
            <p className="text-[11px] opacity-60">
              as of {idx.asOf}
              {idx.marketClosed ? ` · closed${idx.closedReason ? ` (${idx.closedReason})` : ""}` : ""}
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {body.items.map((item, i) => (
          <div key={i}>
            <h3 className="font-semibold mb-1">{item.headline}</h3>
            <ul className="list-disc list-inside space-y-0.5">
              {item.points.map((p, j) => (
                <li key={j}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
