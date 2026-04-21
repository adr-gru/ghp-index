import Image from "next/image";

interface ScheduleGame {
  id: string;
  date: string;
  week: number | null;
  opponent_abbr: string;
  opponent_name: string;
  opponent_logo: string;
  is_home: boolean;
  this_score: number | null;
  opp_score: number | null;
  result: "W" | "L" | "T" | "";
  completed: boolean;
}

interface Props {
  games: ScheduleGame[];
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export default function NFLGameLog({ games }: Props) {
  const completed = [...games].filter((g) => g.completed).reverse();

  if (completed.length === 0) {
    return (
      <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary text-sm">
        No completed games to display.
      </div>
    );
  }

  return (
    <div className="bg-card border border-edge rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-edge">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Wk</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Opponent</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">H/A</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Result</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Score</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((g, i) => (
              <tr
                key={g.id ?? i}
                className="border-b border-edge last:border-0 hover:bg-base transition-colors"
              >
                <td className="px-4 py-3 text-muted font-mono text-xs tabular-nums">
                  {g.week ?? "—"}
                </td>
                <td className="px-4 py-3 text-secondary text-xs whitespace-nowrap">
                  {fmtDate(g.date)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {g.opponent_logo ? (
                      <div className="relative w-5 h-5 shrink-0">
                        <Image
                          src={g.opponent_logo}
                          alt={g.opponent_abbr}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : <div className="w-5 h-5 shrink-0" />}
                    <span className="font-medium text-primary text-sm truncate">
                      {g.opponent_name || g.opponent_abbr}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-xs text-secondary font-medium">
                  {g.is_home ? "H" : "A"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                      g.result === "W"
                        ? "bg-green-100 text-green-700"
                        : g.result === "L"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {g.result}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-secondary">
                  {g.this_score}–{g.opp_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
