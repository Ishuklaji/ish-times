import type { JobsBody } from "@/lib/types";

export default function Jobs({ body }: { body: JobsBody }) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {body.postings.map((job, i) => (
          <div key={i} className="rounded border border-current/20 px-3 py-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{job.title}</h3>
              <span className="text-[11px] text-emerald-700 shrink-0">✓ verified</span>
            </div>
            <p className="text-sm">
              {job.company} · {job.location}
            </p>
            <p className="text-[11px] opacity-60">{job.stack.join(" · ")}</p>
            <a href={job.url} target="_blank" rel="noreferrer" className="text-sm underline">
              View posting
            </a>
          </div>
        ))}
        {body.postings.length === 0 && (
          <p className="italic opacity-70">No individually-verified postings yet — use the search links below.</p>
        )}
      </div>
      <div className="border-t border-current/20 pt-3">
        <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Permanent search links</p>
        <ul className="space-y-1">
          {body.searchLinks.map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noreferrer" className="underline text-sm">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
