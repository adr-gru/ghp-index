"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MLBGame {
  game_id: number;
  status: string;
  abstract_state: string;
  start_time: string;
  inning: number | null;
  inning_state: string;
  away_team_id: number;
  away_abbr: string;
  away_name: string;
  away_runs: number | null;
  away_record: string;
  home_team_id: number;
  home_abbr: string;
  home_name: string;
  home_runs: number | null;
  home_record: string;
  venue: string;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return dt.toISOString().slice(0, 10);
}

function getLocalTime(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function gameStatusLabel(game: MLBGame): { text: string; live: boolean } {
  const st = game.abstract_state;
  if (st === "Final") return { text: "Final" + (game.inning && game.inning !== 9 ? ` (${game.inning})` : ""), live: false };
  if (st === "Live") {
    const state = game.inning_state ? `${game.inning_state} ${game.inning}` : `${game.inning}th`;
    return { text: state, live: true };
  }
  return { text: getLocalTime(game.start_time) || game.status, live: false };
}

function MLBGameCard({ game }: { game: MLBGame }) {
  const { text: statusText, live } = gameStatusLabel(game);
  const isFinal = game.abstract_state === "Final";
  const awayWon = isFinal && game.away_runs !== null && game.home_runs !== null && game.away_runs > game.home_runs;
  const homeWon = isFinal && game.home_runs !== null && game.away_runs !== null && game.home_runs > game.away_runs;
  const hasScore = game.away_runs !== null && game.home_runs !== null;

  return (
    <div className="bg-card border border-edge rounded-md px-3 py-3 w-[150px] shrink-0">
      {/* Status */}
      <p className={`text-[10px] text-center mb-2 font-medium ${live ? "text-green-600" : "text-muted"}`}>
        {live && <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />}
        {statusText}
      </p>

      {/* Away */}
      <div className={`flex items-center justify-between mb-1.5 ${isFinal && !awayWon ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-1.5">
          <div className="relative w-6 h-6 shrink-0">
            <Image
              src={`https://www.mlbstatic.com/team-logos/${game.away_team_id}.svg`}
              alt={game.away_abbr}
              fill
              unoptimized
            />
          </div>
          <Link href={`/mlb/teams/${game.away_team_id}`} className="hover:text-accent transition-colors">
            <span className={`text-xs font-semibold ${awayWon ? "text-primary" : "text-secondary"}`}>
              {game.away_abbr}
            </span>
          </Link>
        </div>
        {hasScore && (
          <span className={`text-sm font-bold tabular-nums ${awayWon ? "text-primary" : "text-secondary"}`}>
            {game.away_runs}
          </span>
        )}
      </div>

      {/* Home */}
      <div className={`flex items-center justify-between ${isFinal && !homeWon ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-1.5">
          <div className="relative w-6 h-6 shrink-0">
            <Image
              src={`https://www.mlbstatic.com/team-logos/${game.home_team_id}.svg`}
              alt={game.home_abbr}
              fill
              unoptimized
            />
          </div>
          <Link href={`/mlb/teams/${game.home_team_id}`} className="hover:text-accent transition-colors">
            <span className={`text-xs font-semibold ${homeWon ? "text-primary" : "text-secondary"}`}>
              {game.home_abbr}
            </span>
          </Link>
        </div>
        {hasScore && (
          <span className={`text-sm font-bold tabular-nums ${homeWon ? "text-primary" : "text-secondary"}`}>
            {game.home_runs}
          </span>
        )}
      </div>

      {/* Venue */}
      {!hasScore && (
        <p className="text-[9px] text-muted text-center mt-2 truncate">{game.venue}</p>
      )}
    </div>
  );
}

export default function MLBScoreboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [games, setGames] = useState<MLBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async (d: string) => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(`${API_URL}/api/mlb/scoreboard?date=${d}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      setGames(data.games ?? []);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setError(e.name === "AbortError" ? "Request timed out" : "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(date); }, [date]);

  const isToday = date === today;

  return (
    <div>
      {/* Date nav */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setDate((d) => addDays(d, -1))}
          className="w-8 h-8 flex items-center justify-center rounded bg-card border border-edge text-secondary hover:text-primary hover:border-accent transition-colors text-lg font-light"
          aria-label="Previous day"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-primary min-w-[130px] text-center">
          {isToday ? "Today" : formatDate(date)}
        </span>
        <button
          onClick={() => setDate((d) => addDays(d, 1))}
          disabled={isToday}
          className="w-8 h-8 flex items-center justify-center rounded bg-card border border-edge text-secondary hover:text-primary hover:border-accent transition-colors text-lg font-light disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next day"
        >
          ›
        </button>
        {!isToday && (
          <button
            onClick={() => setDate(today)}
            className="text-xs text-accent hover:underline ml-1"
          >
            Today
          </button>
        )}
      </div>

      {loading && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-[150px] h-28 bg-zinc-700 rounded-md shrink-0 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-card border border-edge rounded-md p-4 text-center space-y-2">
          <p className="text-secondary text-sm">{error}</p>
          <button
            onClick={() => fetchGames(date)}
            className="text-xs text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="bg-card border border-edge rounded-md p-6 text-center">
          <p className="text-secondary text-sm">No games scheduled for this date.</p>
        </div>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {games.map((game) => (
            <MLBGameCard key={game.game_id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
