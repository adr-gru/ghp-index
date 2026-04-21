"use client";

import { useEffect, useState } from "react";
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

type Tab = "Teams" | "Standings" | "Scores" | "Leaders";
const TABS: Tab[] = ["Teams", "Standings", "Scores", "Leaders"];

// Long division names grouped
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
  const [activeTab, setActiveTab] = useState<Tab>("Teams");

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

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <div className="h-8 bg-zinc-700 rounded w-32 mb-2 animate-pulse" />
          <div className="h-4 bg-zinc-700 rounded w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-700 rounded animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-5xl">⚾</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load teams</h1>
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

  // Group teams by division (preserving DIVISION_ORDER)
  const teamsByDivision = DIVISION_ORDER.map((div) => ({
    division: div,
    league: div.startsWith("American") ? "American League" : "National League",
    teams: teams.filter((t) => t.division === div),
  })).filter((g) => g.teams.length > 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>⚾</span>
          <div>
            <h1 className="text-2xl font-bold text-primary">MLB</h1>
            <p className="text-secondary text-sm mt-0.5">
              {teams.length} teams · 2025 season
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-edge mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Teams — grouped by division */}
      {activeTab === "Teams" && (
        <div className="space-y-8">
          {/* AL / NL sections */}
          {(["American League", "National League"] as const).map((league) => {
            const leagueGroups = teamsByDivision.filter((g) => g.league === league);
            const isAL = league === "American League";
            return (
              <div key={league}>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: isAL ? "#003087" : "#C41E3A" }}
                  >
                    {isAL ? "AL" : "NL"}
                  </span>
                  <h2 className="text-sm font-semibold text-primary">{league}</h2>
                </div>
                <div className="space-y-5">
                  {leagueGroups.map((group) => (
                    <div key={group.division}>
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                        {shortDivision(group.division)}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
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

      {/* Standings */}
      {activeTab === "Standings" && <MLBStandings />}

      {/* Scores */}
      {activeTab === "Scores" && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Game Scores</h2>
          <MLBScoreboard />
        </div>
      )}

      {/* Leaders */}
      {activeTab === "Leaders" && (
        <div className="max-w-sm">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">League Leaders</h2>
          <MLBLeaders />
        </div>
      )}
    </main>
  );
}
