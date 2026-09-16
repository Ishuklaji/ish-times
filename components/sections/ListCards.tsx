import type { ListCardItem } from "@/lib/types";

export default function ListCards({ body }: { body: { intro?: string; items: ListCardItem[] } }) {
  return (
    <div className="space-y-3">
      {body.intro && <p>{body.intro}</p>}
      <div className="space-y-3">
        {body.items.map((item, i) => (
          <div key={i} className="rounded border border-current/20 px-3 py-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{item.title}</h3>
              {item.date && <span className="text-[11px] opacity-60 shrink-0">{item.date}</span>}
            </div>
            <p>{item.detail}</p>
            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer" className="text-sm underline">
                {item.link}
              </a>
            )}
            {item.refersTo && (
              <p className="text-[11px] opacity-60 mt-0.5">Refers to: {item.refersTo}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
