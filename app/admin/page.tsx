import { getLatestRunLog } from "@/lib/content";
import { getSectionDef } from "@/lib/sections-registry";

const statusColor: Record<string, string> = {
  fresh: "#15803D",
  forecast: "#B45309",
  "unchanged-evergreen": "#1D4ED8",
  seed: "#6b6b6b",
};

export default function AdminPage() {
  const log = getLatestRunLog();
  const freshCount = log.entries.filter((e) => e.status === "fresh").length;
  const forecastCount = log.entries.filter((e) => e.status === "forecast").length;

  return (
    <div className="min-h-dvh overflow-y-auto bg-[#f4f1ea] px-4 py-8 font-[family-name:var(--font-space-grotesk)] text-[#1a1a1a]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Pipeline debug — Edition {log.editionNumber}</h1>
        <p className="text-sm opacity-70 mb-6">
          Run at {new Date(log.runAt).toLocaleString()} · {freshCount} fresh · {forecastCount} forecast
        </p>

        {log.errors.length > 0 && (
          <div className="mb-6 rounded border border-red-600/40 bg-red-50 px-3 py-2">
            <p className="font-semibold text-red-800 mb-1">Errors this run</p>
            {log.errors.map((e, i) => (
              <p key={i} className="text-sm text-red-900">
                {e.sectionId}: {e.message}
              </p>
            ))}
          </div>
        )}

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-current/30">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Section</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2 pr-2">Reason</th>
              <th className="py-2 pr-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {log.entries.map((entry) => {
              const def = getSectionDef(entry.sectionId);
              return (
                <tr key={entry.sectionId} className="border-b border-current/10">
                  <td className="py-1.5 pr-2 opacity-60">{def?.number}</td>
                  <td className="py-1.5 pr-2">{def?.title ?? entry.sectionId}</td>
                  <td className="py-1.5 pr-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: statusColor[entry.status] ?? "#6b6b6b" }}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 opacity-80">{entry.reason ?? "—"}</td>
                  <td className="py-1.5 pr-2 opacity-60">
                    {entry.durationMs ? `${entry.durationMs}ms` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
