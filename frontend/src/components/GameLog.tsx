"use client";

import { useState } from "react";

interface Game {
  gameDate: string;
  matchup: string;
  wl: string;
  min: string;
  pts: string;
  reb: string;
  ast: string;
  stl: string;
  blk: string;
  tov: string;
  fgm: string;
  fga: string;
  fgPct: string;
  fg3m: string;
  fg3a: string;
  fg3Pct: string;
  ftm: string;
  fta: string;
  ftPct: string;
  oreb: string;
  dreb: string;
  pf: string;
}

export default function GameLog({ games }: { games: Game[] }) {
  const [expanded, setExpanded] = useState(false);

  const displayed = expanded ? games : games.slice(0, 10);

  return (
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
            {displayed.map((game, i) => (
              <tr key={i} className="border-b border-[#334155]/60 hover:bg-[#334155]/40 transition-colors">
                <td className="px-4 py-2.5 text-[#94a3b8] whitespace-nowrap">{game.gameDate}</td>
                <td className="px-4 py-2.5 font-medium text-[#f1f5f9] whitespace-nowrap">{game.matchup}</td>
                <td className={`px-4 py-2.5 font-semibold ${game.wl === "W" ? "text-green-400" : "text-red-400"}`}>{game.wl}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.min}</td>
                <td className="px-4 py-2.5 font-semibold text-[#f1f5f9]">{game.pts}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.reb}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.ast}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.stl}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.blk}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.tov}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.fgm}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.fga}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.fgPct}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.fg3m}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.fg3a}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.fg3Pct}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.ftm}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.fta}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.ftPct}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.oreb}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.dreb}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{game.pf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-[#0f172a] border-t border-[#334155]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-[#38bdf8] hover:text-[#f1f5f9] transition-colors"
        >
          {expanded ? "Show less" : `Show all ${games.length} games`}
        </button>
      </div>
    </div>
  );
}
