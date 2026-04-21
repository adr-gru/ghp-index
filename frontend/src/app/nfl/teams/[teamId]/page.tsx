"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NFLGameLog from "@/components/NFLGameLog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type TeamTab = "Overview" | "Game Log" | "Roster";
const TABS: TeamTab[] = ["Overview", "Game Log", "Roster"];

interface ScheduleGame {
  id: string;
  date: string;
  week: number | null;
  opponent_abbr: string;
  opponent_id: string;
  opponent_name: string;
  opponent_logo: string;
  is_home: boolean;
  this_score: number | null;
  opp_score: number | null;
  result: "W" | "L" | "T" | "";
  completed: boolean;
  status_text: string;
}

interface RosterPlayer {
  id: string;
  display_name: string;
  jersey: string;
  position: string;
  position_full: string;
  position_type: string;
  headshot: string;
}

interface NFLTeam {
  id: string;
  abbreviation: string;
  display_name: string;
  nickname: string;
  location: string;
  color: string;
  alternate_color: string;
  logo: string;
  conference: string;
  division: string;
  record: string;
  wins: number;
  losses: number;
  schedule: ScheduleGame[];
}

function formatGameDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export default function NFLTeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam]       = useState<NFLTeam | null>(null);
  const [roster, setRoster]   = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TeamTab>("Overview");

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${API_URL}/api/nfl/teams/${teamId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`${res.status}`);
      setTeam(await res.json());
    } catch (err: any) {
      setError(err.name === "AbortError" ? "Request timed out" : "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async () => {
    try {
      const res = await fetch(`${API_URL}/api/nfl/teams/${teamId}/roster`, {
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        setRoster(data.roster ?? []);
      }
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    fetchTeam();
    fetchRoster();
  }, [teamId]);

  if (loading) return <NFLTeamSkeleton />;

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load team data</h1>
          <p className="text-secondary">{error}</p>
          <button
            onClick={fetchTeam}
            className="px-6 py-2 bg-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const completed = team.schedule.filter((g) => g.completed);
  const upcoming  = team.schedule.filter((g) => !g.completed);
  const recentGames = [...completed].slice(-8).reverse();

  const totalPF  = completed.reduce((s, g) => s + (g.this_score ?? 0), 0);
  const totalPA  = completed.reduce((s, g) => s + (g.opp_score  ?? 0), 0);
  const ppg      = completed.length > 0 ? (totalPF / completed.length).toFixed(1) : "—";
  const papg     = completed.length > 0 ? (totalPA / completed.length).toFixed(1) : "—";
  const diffNum  = completed.length > 0 ? (totalPF - totalPA) / completed.length : null;
  const diffStr  = diffNum !== null
    ? `${diffNum > 0 ? "+" : ""}${diffNum.toFixed(1)}`
    : "—";

  const homeGames = completed.filter((g) =>  g.is_home);
  const awayGames = completed.filter((g) => !g.is_home);
  const homeW     = homeGames.filter((g) => g.result === "W").length;
  const awayW     = awayGames.filter((g) => g.result === "W").length;

  // Roster grouped by position type
  const rosterGroups: Record<string, RosterPlayer[]> = {};
  for (const p of roster) {
    const group = p.position_type || "Other";
    rosterGroups[group] = [...(rosterGroups[group] ?? []), p];
  }
  const groupOrder = ["Offense", "Defense", "Special Teams", "Other"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        className="bg-card rounded-md border border-edge p-6 sm:p-8"
        style={{ borderTopColor: team.color, borderTopWidth: 4 }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Logo */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <Image
              src={team.logo}
              alt={`${team.display_name} logo`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Identity */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest">
              {team.conference} · {team.division}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mt-1">
              {team.display_name}
            </h1>
            <p className="text-secondary font-medium mt-1">
              {team.record} · {team.abbreviation}
            </p>
          </div>

          {/* Stats sidebar */}
          <div className="hidden sm:block h-36 w-px" style={{ backgroundColor: team.color, opacity: 0.3 }} />
          <dl className="grid grid-cols-3 sm:flex sm:flex-col gap-x-6 gap-y-2 text-sm shrink-0 w-full sm:w-auto">
            {[
              { label: "PF / G",  value: ppg },
              { label: "PA / G",  value: papg },
              {
                label: "Diff",
                value: diffStr,
                colored: diffNum !== null,
              },
              { label: "Home",    value: `${homeW}–${homeGames.length - homeW}` },
              { label: "Away",    value: `${awayW}–${awayGames.length - awayW}` },
              { label: "Games",   value: completed.length.toString() },
            ].map(({ label, value, colored }) => (
              <div key={label} className="flex gap-2 items-baseline">
                <dt className="text-secondary text-xs">{label}</dt>
                <dd
                  className={`font-semibold text-sm ${
                    colored && diffNum !== null
                      ? diffNum > 0 ? "text-green-600" : "text-red-500"
                      : "text-primary"
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-edge overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors shrink-0 ${
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
        <div className="space-y-6">
          {/* Quick-stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Record",    value: team.record },
              { label: "Conference", value: team.conference },
              { label: "Division",  value: team.division },
              {
                label: "Pt Diff",
                value: diffStr,
                colored: true,
              },
            ].map(({ label, value, colored }) => (
              <div key={label} className="bg-card border border-edge rounded-md p-4 text-center">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                <p
                  className={`text-2xl font-bold ${
                    colored && diffNum !== null
                      ? diffNum > 0 ? "text-green-600" : "text-red-500"
                      : "text-primary"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Recent results */}
          {recentGames.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Recent Results
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recentGames.map((g) => {
                  const won  = g.result === "W";
                  const tied = g.result === "T";

                  const awayAbbr  = g.is_home ? g.opponent_abbr  : team.abbreviation;
                  const awayScore = g.is_home ? g.opp_score       : g.this_score;
                  const awayLogo  = g.is_home ? g.opponent_logo   : null;
                  const awayWon   = g.is_home ? !won && !tied     : won;

                  const homeAbbr  = g.is_home ? team.abbreviation : g.opponent_abbr;
                  const homeScore = g.is_home ? g.this_score      : g.opp_score;
                  const homeLogo  = g.is_home ? null              : g.opponent_logo;
                  const homeWon   = g.is_home ? won               : !won && !tied;

                  return (
                    <div key={g.id} className="shrink-0 bg-card border border-edge rounded-md px-3 py-2.5 w-[148px]">
                      <p className="text-[10px] text-muted text-center mb-2 truncate">
                        Wk {g.week} · {formatGameDate(g.date)}
                      </p>
                      {/* Away */}
                      <div className={`flex items-center justify-between mb-1.5 ${!awayWon ? "opacity-45" : ""}`}>
                        <div className="flex items-center gap-1.5">
                          {awayLogo ? (
                            <div className="relative w-5 h-5 shrink-0">
                              <Image src={awayLogo} alt={awayAbbr} fill className="object-contain" unoptimized />
                            </div>
                          ) : <div className="w-5 h-5 shrink-0" />}
                          <span className={`text-xs font-semibold ${awayWon ? "text-primary" : "text-secondary"}`}>
                            {awayAbbr}
                          </span>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${awayWon ? "text-primary" : "text-secondary"}`}>
                          {awayScore ?? "–"}
                        </span>
                      </div>
                      {/* Home */}
                      <div className={`flex items-center justify-between ${!homeWon ? "opacity-45" : ""}`}>
                        <div className="flex items-center gap-1.5">
                          {homeLogo ? (
                            <div className="relative w-5 h-5 shrink-0">
                              <Image src={homeLogo} alt={homeAbbr} fill className="object-contain" unoptimized />
                            </div>
                          ) : <div className="w-5 h-5 shrink-0" />}
                          <span className={`text-xs font-semibold ${homeWon ? "text-primary" : "text-secondary"}`}>
                            {homeAbbr}
                          </span>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${homeWon ? "text-primary" : "text-secondary"}`}>
                          {homeScore ?? "–"}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-2 text-center font-bold ${
                        won ? "text-green-500" : tied ? "text-amber-500" : "text-red-400"
                      }`}>
                        {g.result}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Upcoming
              </h3>
              <div className="space-y-2">
                {upcoming.slice(0, 5).map((g) => (
                  <div key={g.id} className="bg-card border border-edge rounded-md p-3 flex items-center gap-3">
                    {g.opponent_logo ? (
                      <div className="relative w-8 h-8 shrink-0">
                        <Image src={g.opponent_logo} alt={g.opponent_abbr} fill className="object-contain" unoptimized />
                      </div>
                    ) : <div className="w-8 h-8 shrink-0 bg-edge rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">
                        {g.is_home ? "vs" : "@"} {g.opponent_name || g.opponent_abbr}
                      </p>
                      <p className="text-xs text-muted">Week {g.week}</p>
                    </div>
                    <p className="text-xs text-secondary shrink-0">
                      {formatGameDate(g.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed.length === 0 && upcoming.length === 0 && (
            <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary text-sm">
              No schedule data available.
            </div>
          )}
        </div>
      )}

      {/* ── Game Log ─────────────────────────────────────────────── */}
      {activeTab === "Game Log" && (
        <NFLGameLog games={team.schedule} />
      )}

      {/* ── Roster ───────────────────────────────────────────────── */}
      {activeTab === "Roster" && (
        <div className="space-y-8">
          {roster.length === 0 ? (
            <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary text-sm animate-pulse">
              Loading roster…
            </div>
          ) : (
            groupOrder.map((group) => {
              const players = rosterGroups[group];
              if (!players?.length) return null;
              return (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xs font-bold text-muted uppercase tracking-widest">{group}</h2>
                    <div className="flex-1 h-px bg-edge" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {players.map((player) => (
                      <Link
                        key={player.id}
                        href={`/nfl/players/${player.id}`}
                        className="bg-card border border-edge rounded-md p-3 flex items-center gap-3 hover:border-accent transition-colors group"
                      >
                        {player.headshot ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={player.headshot}
                            alt={player.display_name}
                            className="w-10 h-10 object-cover object-top rounded shrink-0 bg-zinc-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-100 rounded shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-primary truncate group-hover:text-accent transition-colors">
                            {player.display_name}
                          </p>
                          <p className="text-xs text-muted">
                            {player.position}{player.jersey ? ` · #${player.jersey}` : ""}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function NFLTeamSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      <div className="bg-card rounded-md border border-edge p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-zinc-200 rounded-md shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-4 bg-zinc-200 rounded w-28 mx-auto sm:mx-0" />
            <div className="h-9 bg-zinc-200 rounded w-56 mx-auto sm:mx-0" />
            <div className="h-5 bg-zinc-200 rounded w-24 mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
      <div className="flex gap-4 border-b border-edge pb-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-zinc-200 rounded w-24" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-zinc-200 rounded" />)}
      </div>
    </div>
  );
}
