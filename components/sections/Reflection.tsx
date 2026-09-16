import type { ReflectionBody } from "@/lib/types";

export default function Reflection({ body }: { body: ReflectionBody }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold italic">{body.concept}</h3>
      <p>{body.explanation}</p>
      {body.connections.length > 0 && (
        <div>
          <p className="font-semibold mb-1">In today&apos;s edition:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {body.connections.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
