"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StatEntry {
  name: string;
  display_name: string;
  value: number;
  display_value: string;
}

interface StatCategory {
  name: string;
  display_name: string;
  stats: StatEntry[];
  season: number;
}

interface NFLPlayer {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  jersey: string;
  position: string;
  position_abbr: string;
  height: string;
  weight: string;
  age: number | null;
  experience: number | null;
  headshot: string;
  team_id: string;
  team_abbr: string;
  team_name: string;
  team_color: string;
  team_logo: string;
  stat_categories: StatCategory[];
}

// Stats to highlight per position abbreviation
const POSITION_PRIORITY: Record<string, string[]> = {
  QB:  ["completions", "passingAttempts", "completionPct", "passingYards", "passingTouchdowns", "interceptions", "QBRating"],
  RB:  ["rushingAttempts", "rushingYards", "rushingYardsPerCarry", "rushingTouchdowns", "receptions", "receivingYards"],
  WR:  ["receptions", "targets", "receivingYards", "yardsPerReception", "receivingTouchdowns", "longReception"],
  TE:  ["receptions", "targets", "receivingYards", "yardsPerReception", "receivingTouchdowns"],
  DE:  ["totalTackles", "sacks", "tacklesForLoss", "forcedFumbles", "passesDefended"],
  DT:  ["totalTackles", "sacks", "tacklesForLoss", "forcedFumbles"],
  LB:  ["totalTackles", "soloTackles", "sacks", "interceptions", "forcedFumbles", "passesDefended"],
  CB:  ["totalTackles", "interceptions", "passesDefended", "forcedFumbles"],
  S:   ["totalTackles", "interceptions", "passesDefended", "forcedFumbles"],
  K:   ["fieldGoalsMade", "fieldGoalAttempts", "fieldGoalPct", "longFieldGoal", "extraPointsMade"],
  P:   ["punts", "grossAvg", "netAvg", "longPunt", "puntsInside20"],
};

function filterStats(cats: StatCategory[], posAbbr: string): StatCategory[] {
  const priority = POSITION_PRIORITY[posAbbr.toUpperCase()];
  if (!priority) return cats;

  return cats.map((cat) => ({
    ...cat,
    stats: cat.stats.filter((s) => priority.includes(s.name)),
  })).filter((cat) => cat.stats.length > 0);
}

export default function NFLPlayerPage() {
  const params   = useParams();
  const playerId = params.playerId as string;

  const [player, setPlayer]   = useState<NFLPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchPlayer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/nfl/players/${playerId}`, {
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setPlayer(await res.json());
    } catch (err: any) {
      setError(err.name === "AbortError" ? "Request timed out" : "Failed to load player");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayer(); }, [playerId]);

  if (loading) return <PlayerSkeleton />;

  if (error || !player) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load player</h1>
          <p className="text-secondary">{error}</p>
          <button onClick={fetchPlayer} className="px-6 py-2 bg-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCats = filterStats(player.stat_categories, player.position_abbr);
  const season   = player.stat_categories[0]?.season;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
        style={{ borderTopColor: player.team_color, borderTopWidth: 4 }}
      >
        {/* Headshot */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-md overflow-hidden bg-zinc-100">
          {player.headshot ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={player.headshot}
              alt={player.display_name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
        </div>

        {/* Identity */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            {player.team_logo && (
              <div className="relative w-6 h-6 shrink-0">
                <Image src={player.team_logo} alt={player.team_abbr} fill className="object-contain" unoptimized />
              </div>
            )}
            <Link
              href={`/nfl/teams/${player.team_id}`}
              className="text-xs font-semibold text-secondary hover:text-accent transition-colors uppercase tracking-wide"
            >
              {player.team_name}
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            {player.display_name}
          </h1>

          <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: player.team_color }}
            >
              {player.position_abbr}
            </span>
            {player.jersey && (
              <span className="text-sm text-secondary font-mono">#{player.jersey}</span>
            )}
          </div>

          {/* Bio stats */}
          <dl className="flex gap-x-6 gap-y-1 mt-4 flex-wrap justify-center sm:justify-start text-sm">
            {[
              { label: "HT",   value: player.height },
              { label: "WT",   value: player.weight },
              { label: "Age",  value: player.age },
              { label: "Exp",  value: player.experience != null ? `${player.experience} yr${player.experience !== 1 ? "s" : ""}` : null },
            ].filter((x) => x.value).map(({ label, value }) => (
              <div key={label} className="flex gap-1.5">
                <dt className="text-muted">{label}</dt>
                <dd className="text-primary font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Season Stats ─────────────────────────────────────────── */}
      {statCats.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">
            {season} Season Stats
          </h2>

          {statCats.map((cat) => (
            <div key={cat.name} className="bg-card border border-edge rounded-md p-5">
              <h3 className="text-sm font-semibold text-primary mb-4">{cat.display_name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {cat.stats.map((stat) => (
                  <div key={stat.name}>
                    <p className="text-xs text-muted uppercase tracking-wide mb-0.5">{stat.display_name}</p>
                    <p className="text-2xl font-bold text-primary tabular-nums">
                      {stat.display_value ?? stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary text-sm">
          No season stats available for this player.
        </div>
      )}

      {/* Back to team */}
      {player.team_id && (
        <div>
          <Link
            href={`/nfl/teams/${player.team_id}`}
            className="text-sm text-accent hover:underline"
          >
            ← Back to {player.team_name}
          </Link>
        </div>
      )}
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      <div className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-28 h-28 sm:w-36 sm:h-36 bg-zinc-200 rounded-md shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-4 bg-zinc-200 rounded w-32 mx-auto sm:mx-0" />
          <div className="h-10 bg-zinc-200 rounded w-64 mx-auto sm:mx-0" />
          <div className="h-5 bg-zinc-200 rounded w-20 mx-auto sm:mx-0" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-zinc-200 rounded w-32" />
        <div className="bg-card border border-edge rounded-md p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-zinc-200 rounded w-16" />
                <div className="h-8 bg-zinc-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
