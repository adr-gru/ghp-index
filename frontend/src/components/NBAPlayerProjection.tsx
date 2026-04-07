import { ProjectionData } from "@/components/PlayerTabs";

const TREND_ICON = { up: "↑", down: "↓", flat: "→" };
const TREND_COLOR = { up: "text-green-400", down: "text-red-400", flat: "text-[#94a3b8]" };

function StatCard({ label, data }: { label: string; data: ProjectionData["pts"] }) {
  return (
    <div className="flex-1 bg-[#0f172a] rounded-md border border-[#334155] p-5 flex flex-col gap-1.5">
      <span className="text-xs text-[#94a3b8] font-medium">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-[#f1f5f9]">{data.projection}</span>
        <span className={`text-lg font-semibold mb-0.5 ${TREND_COLOR[data.trend]}`}>
          {TREND_ICON[data.trend]}
        </span>
      </div>
      <span className="text-sm text-[#94a3b8]">Range: {data.low} – {data.high}</span>
      <span className="text-sm text-[#94a3b8]">Season avg: {data.season_avg}</span>
    </div>
  );
}

export default function NBAPlayerProjection({ projection }: { projection: ProjectionData }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#94a3b8]">
        Next-game estimates based on last {projection.games_used} games (EWMA, ±1 std dev)
      </p>
      <div className="flex gap-4">
        <StatCard label="Points" data={projection.pts} />
        <StatCard label="Rebounds" data={projection.reb} />
        <StatCard label="Assists" data={projection.ast} />
      </div>
    </div>
  );
}
