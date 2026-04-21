import { ProjectionData } from "@/components/PlayerTabs";

const TREND_ICON = { up: "↑", down: "↓", flat: "→" };
const TREND_COLOR = {
  up: "text-green-400",
  down: "text-red-400",
  flat: "text-secondary",
};

function ConfidenceBar({
  low,
  projection,
  high,
  seasonAvg,
  color,
}: {
  low: number;
  projection: number;
  high: number;
  seasonAvg: number;
  color: string;
}) {
  const max = Math.max(high * 1.1, seasonAvg * 1.1, 1);
  const pct = (v: number) => Math.min(100, (v / max) * 100);

  return (
    <div className="mt-3 space-y-1.5">
      {/* Range bar */}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        {/* Low-to-high shaded range */}
        <div
          className="absolute top-0 h-full rounded-full opacity-30"
          style={{
            left: `${pct(low)}%`,
            width: `${pct(high) - pct(low)}%`,
            backgroundColor: color,
          }}
        />
        {/* Season avg marker */}
        <div
          className="absolute top-0 w-0.5 h-full bg-zinc-400 opacity-60"
          style={{ left: `${pct(seasonAvg)}%` }}
        />
        {/* Projection marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-zinc-900"
          style={{
            left: `calc(${pct(projection)}% - 5px)`,
            backgroundColor: color,
          }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between text-[9px] text-muted">
        <span>{low}</span>
        <span className="text-zinc-400">avg {seasonAvg}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  data,
  teamColor,
}: {
  label: string;
  data: ProjectionData["pts"];
  teamColor: string;
}) {
  return (
    <div
      className="flex-1 bg-card rounded-md border border-edge border-l-4 p-5 flex flex-col gap-1"
      style={{ borderLeftColor: teamColor }}
    >
      <span className="text-xs font-medium text-secondary uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-primary">{data.projection}</span>
        <span className={`text-lg font-semibold mb-0.5 ${TREND_COLOR[data.trend]}`}>
          {TREND_ICON[data.trend]}
        </span>
      </div>
      <ConfidenceBar
        low={data.low}
        projection={data.projection}
        high={data.high}
        seasonAvg={data.season_avg}
        color={teamColor}
      />
    </div>
  );
}

export default function NBAPlayerProjection({
  projection,
  teamColor,
}: {
  projection: ProjectionData;
  teamColor: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Points" data={projection.pts} teamColor={teamColor} />
        <StatCard label="Rebounds" data={projection.reb} teamColor={teamColor} />
        <StatCard label="Assists" data={projection.ast} teamColor={teamColor} />
        <StatCard label="Steals" data={projection.stl} teamColor={teamColor} />
        <StatCard label="Blocks" data={projection.blk} teamColor={teamColor} />
      </div>

      {/* Legend */}
      <div className="bg-card border border-edge rounded-md px-4 py-3 flex flex-wrap gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: teamColor }} />
          <span>Projection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 rounded-full opacity-30" style={{ backgroundColor: teamColor }} />
          <span>Confidence range (±1σ)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-zinc-400 opacity-60" />
          <span>Season avg</span>
        </div>
        <span className="ml-auto">Based on last {projection.games_used} games · EWMA</span>
      </div>
    </div>
  );
}
