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

export default function playerGameLog({ stats }: { stats: PlayerStats[] }) {
  const [expanded, setExpanded] = useState(false);

  const displayed = expanded ? stats : stats.slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-[#93BFB7]/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-sm text-left w-full">
          <thead>
            <tr className="bg-[#E4F2E7]/60 border-b border-[#93BFB7]/40">
              {["Date", "Matchup", "W/L", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TOV", "FGM", "FGA", "FG%", "3PM", "3PA", "3P%", "FTM", "FTA", "FT%", "OREB", "DREB", "PF"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wider uppercase text-[#97A6A0] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((playerStats, i) => (
              <tr key={i} className={`border-b border-[#93BFB7]/20 hover:bg-[#93BFB7]/10 transition-colors ${i % 2 !== 0 ? "bg-[#E4F2E7]/30" : ""}`}>
                <td className="px-4 py-2.5 text-[#97A6A0] whitespace-nowrap">{playerStats.playerStatsDate}</td>
                <td className="px-4 py-2.5 font-medium text-[#2D3E40] whitespace-nowrap">{playerStats.matchup}</td>
                <td className={`px-4 py-2.5 font-bold ${playerStats.winLoss === "W" ? "text-green-600" : "text-red-500"}`}>{playerStats.winLoss}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.minutes}</td>
                <td className="px-4 py-2.5 font-semibold text-[#2D3E40]">{playerStats.points}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.rebounds}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.assists}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.steals}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.blocks}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.turnovers}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.fieldGoalsMade}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.fieldGoalsAttempted}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.fieldGoalPercentage}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.fieldGoalThreePointsMade}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.fieldGoalThreeAttempted}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.fieldGoalThreePercentage}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.freeThrowsMade}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.freeThrowsAttempted}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.freeThrowPercentage}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.offensiveRebounds}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.defensiveRebounds}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{playerStats.personalFouls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-[#E4F2E7]/60 border-t border-[#93BFB7]/30">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-[#387373] hover:text-[#2D3E40] transition-colors"
        >
          {expanded ? "Show less" : `Show all ${stats.length} Games`}
        </button>
      </div>
    </div>
  );
}
