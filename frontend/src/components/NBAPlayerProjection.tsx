import { ProjectionData } from "@/components/PlayerTabs";

const TREND_ICON = { up: "↑", down: "↓", flat: "→" };
const TREND_COLOR = { up: "text-green-500", down: "text-red-500", flat: "text-secondary" };

function StatCard({ label, data, teamColor }: { label: string; data: ProjectionData["pts"]; teamColor: string }) {
  return (
    <div
      className="flex-1 bg-card rounded-md border border-edge border-l-4 p-5 flex flex-col gap-1.5"
      style={{ borderLeftColor: teamColor }}
    >
      <span className="text-xs font-medium text-secondary">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-primary">{data.projection}</span>
        <span className={`text-lg font-semibold mb-0.5 ${TREND_COLOR[data.trend]}`}>
          {TREND_ICON[data.trend]}
        </span>
      </div>
      <span className="text-sm text-secondary">Range: {data.low} – {data.high}</span>
      <span className="text-sm text-secondary">Season avg: {data.season_avg}</span>
    </div>
  );
}

export default function NBAPlayerProjection({ projection, teamColor }: { projection: ProjectionData; teamColor: string }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <StatCard label="Points" data={projection.pts} teamColor={teamColor} />
        <StatCard label="Rebounds" data={projection.reb} teamColor={teamColor} />
        <StatCard label="Assists" data={projection.ast} teamColor={teamColor} />
        <StatCard label="Steals" data={projection.stl} teamColor={teamColor} />
        <StatCard label="Blocks" data={projection.blk} teamColor={teamColor} />
      </div>
      <p className="text-xs text-secondary">
        Next-game estimates based on last {projection.games_used} games (EWMA, ±1 std dev)
      </p>
    </div>
  );
}
