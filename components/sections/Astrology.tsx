import type { AstrologyBody } from "@/lib/types";

export default function Astrology({ body }: { body: AstrologyBody }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold uppercase tracking-wide text-xs opacity-70 mb-1">Vedic</h3>
        <p>{body.vedic.transitSummary}</p>
        <p className="mt-2 italic">Today&apos;s suggestion: {body.vedic.suggestion}</p>
      </div>
      <div className="border-t border-current/20 pt-3">
        <h3 className="font-semibold uppercase tracking-wide text-xs opacity-70 mb-1">Tarot</h3>
        <p className="font-bold text-lg">
          {body.tarot.card} <span className="text-sm font-normal opacity-70">({body.tarot.orientation})</span>
        </p>
        <p className="mt-1">{body.tarot.traditionalMeaning}</p>
        <p className="mt-1">{body.tarot.dailyThemeConnection}</p>
        <p className="mt-2 italic">{body.tarot.reflectiveQuestion}</p>
      </div>
      <p className="text-[11px] opacity-60 border-t border-current/20 pt-2">{body.disclaimer}</p>
    </div>
  );
}
