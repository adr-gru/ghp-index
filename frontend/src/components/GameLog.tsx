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
            {displayed.map((game, i) => (
              <tr key={i} className={`border-b border-[#93BFB7]/20 hover:bg-[#93BFB7]/10 transition-colors ${i % 2 !== 0 ? "bg-[#E4F2E7]/30" : ""}`}>
                <td className="px-4 py-2.5 text-[#97A6A0] whitespace-nowrap">{game.gameDate}</td>
                <td className="px-4 py-2.5 font-medium text-[#2D3E40] whitespace-nowrap">{game.matchup}</td>
                <td className={`px-4 py-2.5 font-bold ${game.wl === "W" ? "text-green-600" : "text-red-500"}`}>{game.wl}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.min}</td>
                <td className="px-4 py-2.5 font-semibold text-[#2D3E40]">{game.pts}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.reb}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.ast}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.stl}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.blk}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.tov}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.fgm}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.fga}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.fgPct}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.fg3m}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.fg3a}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.fg3Pct}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.ftm}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.fta}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.ftPct}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.oreb}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.dreb}</td>
                <td className="px-4 py-2.5 text-[#2D3E40]/70">{game.pf}</td>
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
          {expanded ? "Show less" : `Show all ${games.length} games`}
        </button>
      </div>
    </div>
  );
}
