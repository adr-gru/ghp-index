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
            {displayed.map((game, i) => (
              <tr key={i} className="border-b border-edge/60 hover:bg-edge/40 transition-colors">
                <td className="px-4 py-2.5 text-secondary whitespace-nowrap">{game.gameDate}</td>
                <td className="px-4 py-2.5 font-medium text-primary whitespace-nowrap">{game.matchup}</td>
                <td className={`px-4 py-2.5 font-semibold ${game.wl === "W" ? "text-green-400" : "text-red-400"}`}>{game.wl}</td>
                <td className="px-4 py-2.5 text-secondary">{game.min}</td>
                <td className="px-4 py-2.5 font-semibold text-primary">{game.pts}</td>
                <td className="px-4 py-2.5 text-secondary">{game.reb}</td>
                <td className="px-4 py-2.5 text-secondary">{game.ast}</td>
                <td className="px-4 py-2.5 text-secondary">{game.stl}</td>
                <td className="px-4 py-2.5 text-secondary">{game.blk}</td>
                <td className="px-4 py-2.5 text-secondary">{game.tov}</td>
                <td className="px-4 py-2.5 text-secondary">{game.fgm}</td>
                <td className="px-4 py-2.5 text-secondary">{game.fga}</td>
                <td className="px-4 py-2.5 text-secondary">{game.fgPct}</td>
                <td className="px-4 py-2.5 text-secondary">{game.fg3m}</td>
                <td className="px-4 py-2.5 text-secondary">{game.fg3a}</td>
                <td className="px-4 py-2.5 text-secondary">{game.fg3Pct}</td>
                <td className="px-4 py-2.5 text-secondary">{game.ftm}</td>
                <td className="px-4 py-2.5 text-secondary">{game.fta}</td>
                <td className="px-4 py-2.5 text-secondary">{game.ftPct}</td>
                <td className="px-4 py-2.5 text-secondary">{game.oreb}</td>
                <td className="px-4 py-2.5 text-secondary">{game.dreb}</td>
                <td className="px-4 py-2.5 text-secondary">{game.pf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-zinc-800 border-t border-edge">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-accent hover:text-blue-400 transition-colors"
        >
          {expanded ? "Show less" : `Show all ${games.length} games`}
        </button>
      </div>
    </div>
  );
}
