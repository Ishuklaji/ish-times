import type { AdviceBody } from "@/lib/types";

export default function Advice({ body }: { body: AdviceBody }) {
  return (
    <div className="space-y-3">
      <p>{body.intro}</p>
      <div className="space-y-3">
        {body.points.map((p, i) => (
          <div key={i}>
            <h3 className="font-semibold">{p.title}</h3>
            <p>{p.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
