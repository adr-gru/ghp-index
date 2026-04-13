"use client";

import { useState } from "react";

interface PlayerStats {
  playerStatsDate: string;
  matchup: string;
  winLoss: string;
  points: string;
  minutes: string;
  rebounds: string;
  assists: string;
  steals: string;
  blocks: string;
  turnovers: string;
  personalFouls: string;
  plusMinus: string
  fieldGoalsMade: string;
  fieldGoalsAttempted: string;
  fieldGoalPercentage: string;
  fieldGoalThreePointsMade: string;
  fieldGoalThreeAttempted: string;
  fieldGoalThreePercentage: string;
  freeThrowsMade: string;
  freeThrowsAttempted: string;
  freeThrowPercentage: string;
  offensiveRebounds: string;
  defensiveRebounds: string;
}

export default function PlayerGameLog({ stats }: { stats: PlayerStats[] }) {
  const [expanded, setExpanded] = useState(false);

  const displayed = expanded ? stats : stats.slice(0, 10);

  const n = stats.length;
  const avg = (key: keyof PlayerStats) =>
    n > 0
      ? (stats.reduce((sum, s) => sum + parseFloat((s[key] as string) || "0"), 0) / n).toFixed(1)
      : "0.0";

  const aggregates = [
    { label: "MIN", value: avg("minutes") },
    { label: "PTS", value: avg("points") },
    { label: "REB", value: avg("rebounds") },
    { label: "AST", value: avg("assists") },
    { label: "STL", value: avg("steals") },
    { label: "BLK", value: avg("blocks") },
    { label: "TOV", value: avg("turnovers") },
    { label: "FG%", value: avg("fieldGoalPercentage") },
    { label: "3P%", value: avg("fieldGoalThreePercentage") },
    { label: "FT%", value: avg("freeThrowPercentage") },
  ];

  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col gap-2">
        {aggregates.map(({ label, value }) => (
          <div key={label} className="bg-[#1e293b] border border-[#334155] rounded-md px-4 py-2 text-center min-w-[60px]">
            <div className="text-xs text-[#94a3b8] font-medium">{label}</div>
            <div className="text-lg font-bold text-[#f1f5f9]">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#1e293b] rounded-md border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm text-left w-full">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#334155]">
                {["Date", "Matchup", "W/L", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TOV", "FGM", "FGA", "FG%", "3PM", "3PA", "3P%", "FTM", "FTA", "FT%", "OREB", "DREB", "PF"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-[#94a3b8] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((playerStats, i) => (
                <tr key={i} className="border-b border-[#334155]/60 hover:bg-[#334155]/40 transition-colors">
                  <td className="px-4 py-2.5 text-[#94a3b8] whitespace-nowrap">{playerStats.playerStatsDate}</td>
                  <td className="px-4 py-2.5 font-medium text-[#f1f5f9] whitespace-nowrap">{playerStats.matchup}</td>
                  <td className={`px-4 py-2.5 font-semibold ${playerStats.winLoss === "W" ? "text-green-400" : "text-red-400"}`}>{playerStats.winLoss}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.minutes}</td>
                  <td className="px-4 py-2.5 font-semibold text-[#f1f5f9]">{playerStats.points}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.rebounds}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.assists}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.steals}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.blocks}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.turnovers}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.fieldGoalsMade}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.fieldGoalsAttempted}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.fieldGoalPercentage}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.fieldGoalThreePointsMade}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.fieldGoalThreeAttempted}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.fieldGoalThreePercentage}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.freeThrowsMade}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.freeThrowsAttempted}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.freeThrowPercentage}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.offensiveRebounds}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.defensiveRebounds}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{playerStats.personalFouls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-[#0f172a] border-t border-[#334155]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-[#38bdf8] hover:text-[#0284c7] transition-colors"
          >
            {expanded ? "Show less" : `Show all ${stats.length} Games`}
          </button>
        </div>
      </div>
    </div>
  );
}
