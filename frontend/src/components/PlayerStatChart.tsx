"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface PlayerStats {
  playerStatsDate: string;
  matchup: string;
  points: string;
  rebounds: string;
  assists: string;
  steals: string;
  blocks: string;
}

const STATS = [
  { key: "points", label: "PTS" },
  { key: "rebounds", label: "REB" },
  { key: "assists", label: "AST" },
  { key: "steals", label: "STL" },
  { key: "blocks", label: "BLK" },
] as const;

type StatKey = (typeof STATS)[number]["key"];

interface TooltipPayloadEntry {
  value: number;
  payload: { matchup: string; aboveAvg: boolean };
}

function CustomTooltip({
  active,
  payload,
  label,
  activeStat,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  activeStat: StatKey;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const statLabel = STATS.find((s) => s.key === activeStat)?.label ?? activeStat;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs shadow-lg">
      <p className="text-muted mb-1">{label} · {entry.payload.matchup}</p>
      <p className="text-primary font-semibold">
        {statLabel}: {entry.value.toFixed(1)}
      </p>
    </div>
  );
}

export default function PlayerStatChart({
  stats,
  teamColor,
}: {
  stats: PlayerStats[];
  teamColor: string;
}) {
  const [activeStat, setActiveStat] = useState<StatKey>("points");

  const chartData = [...stats]
    .slice(0, 15)
    .reverse()
    .map((s) => ({
      date: s.playerStatsDate.slice(5), // MM/DD
      fullDate: s.playerStatsDate,
      matchup: s.matchup,
      value: parseFloat((s as unknown as Record<string, string>)[activeStat] || "0"),
    }));

  const avg =
    chartData.reduce((sum, d) => sum + d.value, 0) / (chartData.length || 1);

  const dataWithFlag = chartData.map((d) => ({ ...d, aboveAvg: d.value >= avg }));

  return (
    <div className="bg-card border border-edge rounded-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-primary">Recent Performance</h3>
        <div className="flex gap-1 flex-wrap">
          {STATS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveStat(s.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeStat === s.key
                  ? "bg-accent text-white"
                  : "text-muted hover:text-primary bg-zinc-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={dataWithFlag} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#666" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#666" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip activeStat={activeStat} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <ReferenceLine
            y={avg}
            stroke={teamColor}
            strokeDasharray="5 3"
            strokeOpacity={0.6}
            strokeWidth={1.5}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={32}>
            {dataWithFlag.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.aboveAvg ? teamColor : "#4b5563"}
                opacity={entry.aboveAvg ? 0.9 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-muted mt-2">
        Colored = above avg ({avg.toFixed(1)}) · Last {chartData.length} games
      </p>
    </div>
  );
}
