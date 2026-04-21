"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Game {
  game_id: string;
  status: string;
  home_team_id: number;
  away_team_id: number;
  home_abbr: string | null;
  away_abbr: string | null;
  home_city: string | null;
  away_city: string | null;
  home_pts: number | null;
  away_pts: number | null;
  home_record: string | null;
  away_record: string | null;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function shiftDate(dateStr: string, delta: number): string {
  const d = toLocalDate(dateStr);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string): string {
  const d = toLocalDate(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function DashboardScoreboard() {
  const today = todayStr();
  const [selectedDate, setSelectedDate] = useState(today);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/games/scoreboard?date=${date}`, {
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        setGames(data.games ?? []);
      } else {
        setGames([]);
      }
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames(selectedDate);
  }, [selectedDate, fetchGames]);

  const isToday = selectedDate === today;

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
          {isToday ? "Today's Games" : "Games"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
            className="px-2.5 py-1 text-xs bg-card border border-edge rounded hover:border-accent transition-colors text-secondary hover:text-primary"
          >
            ← Prev
          </button>
          <span className="text-xs text-secondary font-medium min-w-[110px] text-center">
            {formatDisplay(selectedDate)}
          </span>
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
            disabled={isToday}
            className="px-2.5 py-1 text-xs bg-card border border-edge rounded hover:border-accent transition-colors text-secondary hover:text-primary disabled:opacity-40 disabled:pointer-events-none"
          >
            Next →
          </button>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-2.5 py-1 text-xs bg-accent text-white rounded hover:bg-blue-600 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-700 rounded animate-pulse" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <p className="text-secondary text-sm">No games scheduled for this date.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <div key={game.game_id} className="bg-card border border-edge rounded-md px-4 py-3">
              {/* Away */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 shrink-0">
                    <Image
                      src={`https://cdn.nba.com/logos/nba/${game.away_team_id}/primary/L/logo.svg`}
                      alt={game.away_abbr ?? ""}
                      fill
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">{game.away_abbr}</p>
                    <p className="text-[10px] text-muted">{game.away_record}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {game.away_pts ?? "–"}
                </span>
              </div>
              {/* Home */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 shrink-0">
                    <Image
                      src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/primary/L/logo.svg`}
                      alt={game.home_abbr ?? ""}
                      fill
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">{game.home_abbr}</p>
                    <p className="text-[10px] text-muted">{game.home_record}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {game.home_pts ?? "–"}
                </span>
              </div>
              <p className="text-[10px] text-accent mt-2 text-center font-medium">{game.status}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
