"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LeaderEntry {
  rank: number;
  player_id: number;
  player: string;
  team: string;
  team_id: number;
  value: string;
}

const BATTING_CATS = [
  { stat: "homeRuns",       label: "HR",   group: "hitting" },
  { stat: "rbi",            label: "RBI",  group: "hitting" },
  { stat: "battingAverage", label: "AVG",  group: "hitting" },
  { stat: "onBasePlusSlugging", label: "OPS", group: "hitting" },
  { stat: "stolenBases",    label: "SB",   group: "hitting" },
] as const;

const PITCHING_CATS = [
  { stat: "earnedRunAverage", label: "ERA",  group: "pitching" },
  { stat: "strikeouts",       label: "SO",   group: "pitching" },
  { stat: "wins",             label: "W",    group: "pitching" },
  { stat: "saves",            label: "SV",   group: "pitching" },
  { stat: "whip",             label: "WHIP", group: "pitching" },
] as const;

type BattingCat = typeof BATTING_CATS[number];
type PitchingCat = typeof PITCHING_CATS[number];
type Cat = BattingCat | PitchingCat;

type LeagueType = "Batting" | "Pitching";

export default function MLBLeaders() {
  const [leagueType, setLeagueType] = useState<LeagueType>("Batting");
  const [selectedCat, setSelectedCat] = useState<Cat>(BATTING_CATS[0]);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaders = async (cat: Cat) => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(
        `${API_URL}/api/mlb/leaders?stat=${cat.stat}&group=${cat.group}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      setLeaders(data.leaders ?? []);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setError(e.name === "AbortError" ? "Request timed out" : "Failed to load leaders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaders(selectedCat); }, [selectedCat]);

  const handleLeagueSwitch = (lt: LeagueType) => {
    setLeagueType(lt);
    setSelectedCat(lt === "Batting" ? BATTING_CATS[0] : PITCHING_CATS[0]);
  };

  const cats = leagueType === "Batting" ? BATTING_CATS : PITCHING_CATS;

  return (
    <div className="bg-card border border-edge rounded-md overflow-hidden">
      {/* Batting / Pitching toggle */}
      <div className="flex border-b border-edge">
        {(["Batting", "Pitching"] as LeagueType[]).map((lt) => (
          <button
            key={lt}
            onClick={() => handleLeagueSwitch(lt)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              leagueType === lt ? "text-accent border-b-2 border-accent" : "text-muted hover:text-primary"
            }`}
          >
            {lt}
          </button>
        ))}
      </div>

      {/* Stat selector */}
      <div className="flex gap-1 px-3 py-2 border-b border-edge overflow-x-auto scrollbar-hide">
        {cats.map((cat) => (
          <button
            key={cat.stat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              selectedCat.stat === cat.stat
                ? "bg-accent text-white"
                : "bg-base text-secondary hover:text-primary"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Leaders list */}
      <div className="divide-y divide-edge">
        {loading && (
          [...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
              <div className="w-4 h-3 bg-zinc-700 rounded" />
              <div className="flex-1 h-3 bg-zinc-700 rounded" />
              <div className="w-10 h-3 bg-zinc-700 rounded" />
            </div>
          ))
        )}

        {!loading && error && (
          <div className="px-4 py-6 text-center">
            <p className="text-secondary text-sm">{error}</p>
            <button
              onClick={() => fetchLeaders(selectedCat)}
              className="mt-2 text-xs text-accent hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && leaders.map((entry) => (
          <div key={entry.player_id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-base transition-colors">
            <span className="text-xs text-muted font-medium w-5 text-right tabular-nums shrink-0">
              {entry.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{entry.player}</p>
              <p className="text-xs text-muted">{entry.team}</p>
            </div>
            <span className="text-sm font-bold text-primary tabular-nums shrink-0">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
