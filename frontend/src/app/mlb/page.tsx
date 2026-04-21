"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MLBTeamCard from "@/components/MLBTeamCard";
import MLBStandings from "@/components/MLBStandings";
import MLBScoreboard from "@/components/MLBScoreboard";
import MLBLeaders from "@/components/MLBLeaders";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MLBTeam {
  id: number;
  name: string;
  teamName: string;
  locationName: string;
  abbreviation: string;
  division: string;
  league: string;
}

const DIVISION_ORDER = [
  "American League East",
  "American League Central",
  "American League West",
  "National League East",
  "National League Central",
  "National League West",
];

function shortDivision(div: string): string {
  return div.replace("American League", "AL").replace("National League", "NL");
}

export default function MlbPage() {
  const [teams, setTeams] = useState<MLBTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(`${API_URL}/api/mlb/teams`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      setTeams(Array.isArray(data.teams) ? data.teams : []);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setError(e.name === "AbortError" ? "Request timed out" : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const teamsByDivision = DIVISION_ORDER.map((div) => ({
    division: div,
    league: div.startsWith("American") ? "American League" : "National League",
    teams: teams.filter((t) => t.division === div),
  })).filter((g) => g.teams.length > 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">MLB</h1>
        <p className="text-secondary text-sm mt-1">
          {loading ? "Loading…" : `${teams.length} teams · 2025 season`}
        </p>
      </div>

      {/* Scores widget */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Scores
        </h2>
        <MLBScoreboard />
      </section>

      {/* Standings widget */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Standings
        </h2>
        <MLBStandings />
      </section>

      {/* Leaders + Teams side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Leaders */}
        <section>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            League Leaders
          </h2>
          <MLBLeaders />
        </section>

        {/* Teams by division */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Teams</h2>
          </div>

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-14 bg-zinc-700 rounded animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="bg-card border border-edge rounded-md p-4 text-center space-y-2">
              <p className="text-secondary text-sm">{error}</p>
              <button
                onClick={fetchTeams}
                className="text-xs text-accent hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {(["American League", "National League"] as const).map((league) => {
                const isAL = league === "American League";
                const groups = teamsByDivision.filter((g) => g.league === league);
                return (
                  <div key={league}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: isAL ? "#003087" : "#C41E3A" }}
                      >
                        {isAL ? "AL" : "NL"}
                      </span>
                      <span className="text-xs font-semibold text-primary">{league}</span>
                    </div>
                    <div className="space-y-4">
                      {groups.map((group) => (
                        <div key={group.division}>
                          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
                            {shortDivision(group.division)}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                            {group.teams.map((team) => (
                              <MLBTeamCard
                                key={team.id}
                                id={team.id}
                                name={team.name}
                                abbreviation={team.abbreviation}
                                division={team.division}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
