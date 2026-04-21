"use client";

import { useEffect, useState } from "react";
import NFLTeamCard from "@/components/NFLTeamCard";
import NFLScoreboard from "@/components/NFLScoreboard";
import NFLStandings from "@/components/NFLStandings";
import NFLLeaders from "@/components/NFLLeaders";
import NFLPlayerSearch from "@/components/NFLPlayerSearch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PageTab = "Overview" | "Teams" | "Players";
const PAGE_TABS: PageTab[] = ["Overview", "Teams", "Players"];
const CONFERENCES = ["AFC", "NFC"] as const;
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
  conference: "AFC" | "NFC";
  division: string;
  record: string;
  wins: number;
  losses: number;
}

interface LeaderCategory {
  name: string;
  display_name: string;
  leaders: any[];
}

export default function NFLPage() {
  const [activeTab, setActiveTab] = useState<PageTab>("Overview");
  const [activeConf, setActiveConf] = useState<"AFC" | "NFC">("AFC");

  const [teams, setTeams]       = useState<NFLTeam[]>([]);
  const [standings, setStandings] = useState<Record<string, Record<string, NFLTeam[]>>>({});
  const [leaders, setLeaders]   = useState<Record<string, LeaderCategory>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 20000);

      const [teamsRes, standingsRes, leadersRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/nfl/teams`,    { signal: controller.signal }),
        fetch(`${API_URL}/api/nfl/standings`, { signal: controller.signal }),
        fetch(`${API_URL}/api/nfl/leaders`,  { signal: controller.signal }),
      ]);
      clearTimeout(timeoutId);

      if (teamsRes.status === "fulfilled" && teamsRes.value.ok) {
        setTeams(await teamsRes.value.json());
      } else {
        throw new Error("Failed to load teams");
      }
      if (standingsRes.status === "fulfilled" && standingsRes.value.ok) {
        setStandings(await standingsRes.value.json());
      }
      if (leadersRes.status === "fulfilled" && leadersRes.value.ok) {
        setLeaders(await leadersRes.value.json());
      }
    } catch (err: any) {
      setError(err.name === "AbortError" ? "Request timed out" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const divisionTeams = (conf: "AFC" | "NFC", div: string) =>
    teams
      .filter((t) => t.conference === conf && t.division === div)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  if (loading) return <NFLPageSkeleton />;

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load NFL data</h1>
          <p className="text-secondary">{error}</p>
          <button
            onClick={fetchData}
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
        <p className="text-secondary text-sm mt-1">32 teams · 2024 season</p>
      </div>

      {/* Page tabs */}
      <div className="flex gap-1 border-b border-edge mb-8">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────── */}
      {activeTab === "Overview" && (
        <div className="space-y-8">
          {/* Scoreboard */}
          <NFLScoreboard />

          {/* Standings + Leaders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-edge rounded-md p-5">
              {Object.keys(standings).length > 0 ? (
                <NFLStandings standings={standings} />
              ) : (
                <p className="text-secondary text-sm">Standings unavailable.</p>
              )}
            </div>
            <div className="bg-card border border-edge rounded-md p-5">
              {Object.keys(leaders).length > 0 ? (
                <NFLLeaders leaders={leaders} />
              ) : (
                <p className="text-secondary text-sm">Leaders unavailable.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Teams ────────────────────────────────────────────────── */}
      {activeTab === "Teams" && (
        <div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {DIVISIONS.map((div) => {
              const divTeams = divisionTeams(activeConf, div);
              return (
                <div key={div}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xs font-bold text-muted uppercase tracking-widest">
                      {activeConf} {div}
                    </h2>
                    <div className="flex-1 h-px bg-edge" />
                  </div>
                  <div className="space-y-2">
                    {divTeams.length > 0 ? (
                      divTeams.map((team) => (
                        <NFLTeamCard key={team.id} {...team} />
                      ))
                    ) : (
                      <div className="h-14 bg-zinc-100 border border-edge rounded-md animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Players ──────────────────────────────────────────────── */}
      {activeTab === "Players" && (
        <div className="max-w-lg">
          <p className="text-secondary text-sm mb-4">
            Search across all current NFL players. Loading players may take a moment on first visit.
          </p>
          <NFLPlayerSearch />
        </div>
      )}
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
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-zinc-200 rounded w-20" />)}
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-zinc-200 rounded-md" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-zinc-200 rounded-md" />
          <div className="h-64 bg-zinc-200 rounded-md" />
        </div>
      </div>
    </main>
  );
}
