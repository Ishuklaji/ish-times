import type { CompanyCard } from "@/lib/types";

export default function CompanyCards({ body }: { body: { cards: CompanyCard[] } }) {
  return (
    <div className="space-y-4">
      {body.cards.map((card, i) => (
        <div key={i} className="rounded border border-current/20 px-3 py-3">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">{card.company}</h3>
            <span className="text-[11px] uppercase tracking-wide opacity-60">{card.region}</span>
          </div>
          <p className="mt-1">
            <span className="font-semibold text-emerald-700">Good: </span>
            {card.good}
          </p>
          <p>
            <span className="font-semibold text-red-700">Bad: </span>
            {card.bad}
          </p>
          <p>
            <span className="font-semibold">Affects me: </span>
            {card.affectsMe}
          </p>
          <p className="italic mt-1">
            &ldquo;{card.outlook}&rdquo; — {card.outlookSource}
          </p>
        </div>
      ))}
    </div>
  );
}
