"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NFLGame {
  id: string;
  date: string;
  name: string;
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

export default function NFLScoreboard() {
  const [games, setGames] = useState<NFLGame[]>([]);
  const [week, setWeek] = useState<number | null>(null);
  const [season, setSeason] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/nfl/scoreboard`, {
      signal: AbortSignal.timeout(15000),
    })
      .then((r) => r.json())
      .then((data) => {
        setGames(data.games ?? []);
        setWeek(data.week ?? null);
        setSeason(data.season ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const label = week && season
    ? `Week ${week} · ${season} Season`
    : "Current Week";

  if (loading) {
    return (
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          NFL Scoreboard
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-200 rounded-md animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
        {label}
      </h2>

      {games.length === 0 ? (
        <div className="bg-card border border-edge rounded-md p-6 text-center">
          <p className="text-secondary text-sm">No games currently scheduled.</p>
          <p className="text-muted text-xs mt-1">Check back during the NFL season (Sep–Feb).</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {games.map((game) => (
            <div key={game.id} className="bg-card border border-edge rounded-md px-4 py-3">
              {/* Away */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {game.away_logo ? (
                    <div className="relative w-6 h-6 shrink-0">
                      <Image
                        src={game.away_logo}
                        alt={game.away_abbr ?? ""}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : <div className="w-6 h-6 shrink-0" />}
                  <div>
                    <p className="text-xs font-semibold text-primary">{game.away_abbr}</p>
                    <p className="text-[10px] text-muted">{game.away_record}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {game.away_score ?? "–"}
                </span>
              </div>
              {/* Home */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {game.home_logo ? (
                    <div className="relative w-6 h-6 shrink-0">
                      <Image
                        src={game.home_logo}
                        alt={game.home_abbr ?? ""}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : <div className="w-6 h-6 shrink-0" />}
                  <div>
                    <p className="text-xs font-semibold text-primary">{game.home_abbr}</p>
                    <p className="text-[10px] text-muted">{game.home_record}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {game.home_score ?? "–"}
                </span>
              </div>
              <p className="text-[10px] text-accent mt-2 text-center font-medium">
                {game.completed ? "Final" : game.clock ? `Q${game.period} ${game.clock}` : game.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
