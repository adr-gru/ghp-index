"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NFLGame {
  id: string;
  date: string;
  status: string;
  completed: boolean;
  clock: string;
  period: number;
  home_id: string;
  home_abbr: string;
  home_logo: string;
  home_score: string | null;
  home_record: string;
  away_id: string;
  away_abbr: string;
  away_logo: string;
  away_score: string | null;
  away_record: string;
}

function NFLGameCard({ game }: { game: NFLGame }) {
  const isLive = !game.completed && game.period > 0;
  const hasScore = game.home_score !== null && game.away_score !== null;
  const homeWon = game.completed && hasScore && Number(game.home_score) > Number(game.away_score);
  const awayWon = game.completed && hasScore && Number(game.away_score) > Number(game.home_score);

  let statusText = game.completed ? "Final" : game.status;
  if (isLive && game.clock) {
    statusText = `Q${game.period} ${game.clock}`;
  } else if (!game.completed && game.date) {
    try {
      statusText = new Date(game.date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      // keep default
    }
  }

  return (
    <div className="bg-card border border-edge rounded-md px-3 py-3 w-[150px] shrink-0">
      <p className={`text-[10px] text-center mb-2 font-medium ${isLive ? "text-green-600" : "text-muted"}`}>
        {isLive && (
          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
        )}
        {statusText}
      </p>

      {/* Away */}
      <div className={`flex items-center justify-between mb-1.5 ${game.completed && !awayWon ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-1.5">
          <div className="relative w-6 h-6 shrink-0">
            <Image src={game.away_logo} alt={game.away_abbr} fill unoptimized />
          </div>
          <span className={`text-xs font-semibold ${awayWon ? "text-primary" : "text-secondary"}`}>
            {game.away_abbr}
          </span>
        </div>
        {hasScore && (
          <span className={`text-sm font-bold tabular-nums ${awayWon ? "text-primary" : "text-secondary"}`}>
            {game.away_score}
          </span>
        )}
      </div>

      {/* Home */}
      <div className={`flex items-center justify-between ${game.completed && !homeWon ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-1.5">
          <div className="relative w-6 h-6 shrink-0">
            <Image src={game.home_logo} alt={game.home_abbr} fill unoptimized />
          </div>
          <span className={`text-xs font-semibold ${homeWon ? "text-primary" : "text-secondary"}`}>
            {game.home_abbr}
          </span>
        </div>
        {hasScore && (
          <span className={`text-sm font-bold tabular-nums ${homeWon ? "text-primary" : "text-secondary"}`}>
            {game.home_score}
          </span>
        )}
      </div>

      {!hasScore && (
        <p className="text-[9px] text-muted text-center mt-2 truncate">
          {game.away_record} @ {game.home_record}
        </p>
      )}
    </div>
  );
}

export default function NFLScoreboard() {
  const [games, setGames] = useState<NFLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [week, setWeek] = useState<number | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(`${API_URL}/api/nfl/scoreboard`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      setGames(data.games ?? []);
      setWeek(data.week ?? null);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setError(e.name === "AbortError" ? "Request timed out" : "Failed to load scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-[150px] h-28 bg-zinc-700 rounded-md shrink-0 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-edge rounded-md p-4 text-center space-y-2">
        <p className="text-secondary text-sm">{error}</p>
        <button onClick={fetchGames} className="text-xs text-accent hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-card border border-edge rounded-md p-6 text-center">
        <p className="text-secondary text-sm">No games scheduled this week.</p>
      </div>
    );
  }

  return (
    <div>
      {week !== null && (
        <p className="text-xs text-muted mb-3">Week {week}</p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {games.map((game) => (
          <NFLGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
