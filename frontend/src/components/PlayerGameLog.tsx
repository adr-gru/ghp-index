"use client";

import { useState } from "react";
import TeamInfoNote from "@/components/TeamInfoNote";

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

export default function PlayerGameLog({ stats, teamColor }: { stats: PlayerStats[]; teamColor: string }) {
  const [expanded, setExpanded] = useState(false);

  const displayed = expanded ? stats : stats.slice(0, 10);

  const n = stats.length;
  const avg = (key: keyof PlayerStats) =>
    n > 0
      ? (stats.reduce((sum, s) => sum + parseFloat((s[key] as string) || "0"), 0) / n).toFixed(1)
      : "0.0";

  const avgPct = (key: keyof PlayerStats) =>
    n > 0
      ? (stats.reduce((sum, s) => sum + parseFloat((s[key] as string) || "0"), 0) / n * 100).toFixed(1) + '%'
      : "0.0%";

  const aggregates = [
    { label: "MIN", value: avg("minutes") },
    { label: "STL", value: avg("steals") },
    { label: "BLK", value: avg("blocks") },
    { label: "TOV", value: avg("turnovers") },
    { label: "FG%", value: avgPct("fieldGoalPercentage") },
    { label: "3P%", value: avgPct("fieldGoalThreePercentage") },
    { label: "FT%", value: avgPct("freeThrowPercentage") },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      <div className="flex flex-row flex-wrap sm:flex-col gap-2">
        {aggregates.map(({ label, value }) => (
          <TeamInfoNote key={label} title={label} info={value} teamColor={teamColor} />
        ))}
      </div>

      <div className="bg-card rounded-md border border-edge overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm text-left w-full">
            <thead>
              <tr className="bg-zinc-800 border-b border-edge">
                {["Date", "Matchup", "W/L", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TOV", "FGM", "FGA", "FG%", "3PM", "3PA", "3P%", "FTM", "FTA", "FT%", "OREB", "DREB", "PF"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-zinc-300 whitespace-nowrap uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((playerStats, i) => (
                <tr key={i} className="border-b border-edge/60 hover:bg-edge/40 transition-colors">
                  <td className="px-4 py-2.5 text-secondary whitespace-nowrap">{playerStats.playerStatsDate}</td>
                  <td className="px-4 py-2.5 font-medium text-primary whitespace-nowrap">{playerStats.matchup}</td>
                  <td className={`px-4 py-2.5 font-semibold ${playerStats.winLoss === "W" ? "text-green-400" : "text-red-400"}`}>{playerStats.winLoss}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.minutes}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary">{playerStats.points}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.rebounds}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.assists}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.steals}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.blocks}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.turnovers}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.fieldGoalsMade}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.fieldGoalsAttempted}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.fieldGoalPercentage ? (parseFloat(playerStats.fieldGoalPercentage) * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.fieldGoalThreePointsMade}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.fieldGoalThreeAttempted}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.fieldGoalThreePercentage ? (parseFloat(playerStats.fieldGoalThreePercentage) * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.freeThrowsMade}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.freeThrowsAttempted}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.freeThrowPercentage ? (parseFloat(playerStats.freeThrowPercentage) * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.offensiveRebounds}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.defensiveRebounds}</td>
                  <td className="px-4 py-2.5 text-secondary">{playerStats.personalFouls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-zinc-800 border-t border-edge">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-accent hover:text-primary transition-colors"
          >
            {expanded ? "Show less" : `Show all ${stats.length} Games`}
          </button>
        </div>
      </div>
    </div>
  );
}
