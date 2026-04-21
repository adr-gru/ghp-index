"use client";

import { useEffect, useState } from "react";
import NFLTeamCard from "@/components/NFLTeamCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Conference = "AFC" | "NFC";
const CONFERENCES: Conference[] = ["AFC", "NFC"];
const DIVISIONS = ["East", "North", "South", "West"] as const;

interface NFLTeam {
  id: string;
  abbreviation: string;
  display_name: string;
  nickname: string;
  location: string;
  color: string;
  alternate_color: string;
  logo: string;
  conference: Conference;
  division: string;
  record: string;
  wins: number;
  losses: number;
}

export default function NFLPage() {
  const [teams, setTeams] = useState<NFLTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeConf, setActiveConf] = useState<Conference>("AFC");

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/nfl/teams`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(
        err.name === "AbortError" ? "Request timed out" : "Failed to load teams"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const divisionTeams = (conf: Conference, div: string) =>
    teams
      .filter((t) => t.conference === conf && t.division === div)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  if (loading) return <NFLPageSkeleton />;

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">
            Unable to load NFL teams
          </h1>
          <p className="text-secondary">{error}</p>
          <button
            onClick={fetchTeams}
            className="px-6 py-2 bg-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">NFL</h1>
        <p className="text-secondary text-sm mt-1">
          32 teams · {teams.length > 0 ? "2024 season" : "—"}
        </p>
      </div>

      {/* Conference tabs */}
      <div className="flex gap-1 border-b border-edge mb-8">
        {CONFERENCES.map((conf) => (
          <button
            key={conf}
            onClick={() => setActiveConf(conf)}
            className={`px-5 py-2 text-sm font-semibold tracking-wide transition-colors ${
              activeConf === conf
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-primary"
            }`}
          >
            {conf}
          </button>
        ))}
      </div>

      {/* Divisions — 2×2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {DIVISIONS.map((div) => {
          const divTeams = divisionTeams(activeConf, div);
          return (
            <div key={div}>
              {/* Division header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-bold text-muted uppercase tracking-widest">
                  {activeConf} {div}
                </h2>
                <div className="flex-1 h-px bg-edge" />
              </div>

              {/* Team list */}
              <div className="space-y-2">
                {divTeams.length > 0 ? (
                  divTeams.map((team) => (
                    <NFLTeamCard key={team.id} {...team} />
                  ))
                ) : (
                  <div className="h-14 bg-card border border-edge rounded-md animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function NFLPageSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-zinc-200 rounded w-12 mb-2" />
        <div className="h-4 bg-zinc-200 rounded w-36" />
      </div>
      <div className="flex gap-4 border-b border-edge mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-zinc-200 rounded w-14" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-zinc-200 rounded w-24 mb-3" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-14 bg-zinc-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
