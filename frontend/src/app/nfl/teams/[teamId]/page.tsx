"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type TeamTab = "Overview" | "Schedule";
const TABS: TeamTab[] = ["Overview", "Schedule"];

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
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export default function NFLTeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<NFLTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TeamTab>("Overview");

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${API_URL}/api/nfl/teams/${teamId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`${res.status}`);
      setTeam(await res.json());
    } catch (err: any) {
      setError(
        err.name === "AbortError"
          ? "Request timed out"
          : "Failed to load team data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  if (loading) return <NFLTeamSkeleton />;

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">
            Unable to load team data
          </h1>
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

  const totalPF = completed.reduce((s, g) => s + (g.this_score ?? 0), 0);
  const totalPA = completed.reduce((s, g) => s + (g.opp_score  ?? 0), 0);
  const ppg  = completed.length > 0 ? (totalPF / completed.length).toFixed(1) : "—";
  const papg = completed.length > 0 ? (totalPA / completed.length).toFixed(1) : "—";
  const diffNum = completed.length > 0 ? (totalPF - totalPA) / completed.length : null;
  const diffStr = diffNum !== null
    ? `${diffNum > 0 ? "+" : ""}${diffNum.toFixed(1)}`
    : "—";

  const homeGames = completed.filter((g) =>  g.is_home);
  const awayGames = completed.filter((g) => !g.is_home);
  const homeW = homeGames.filter((g) => g.result === "W").length;
  const awayW = awayGames.filter((g) => g.result === "W").length;

  // Most-recent 6 completed games for the result cards
  const recentGames = [...completed].reverse().slice(-8).reverse();

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

          {/* Identity + season dots */}
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

            {/* Season timeline */}
            {team.schedule.length > 0 && (
              <div className="mt-4">
                <div className="flex gap-1 flex-wrap justify-center sm:justify-start">
                  {team.schedule.map((g, i) => (
                    <div
                      key={g.id ?? i}
                      title={
                        g.completed
                          ? `Wk ${g.week}: ${g.result} ${g.this_score}–${g.opp_score} ${g.is_home ? "vs" : "@"} ${g.opponent_abbr}`
                          : `Wk ${g.week}: ${g.is_home ? "vs" : "@"} ${g.opponent_abbr}`
                      }
                      className={`w-3.5 h-3.5 rounded-[3px] shrink-0 cursor-default transition-opacity hover:opacity-70 ${
                        !g.completed
                          ? "bg-edge border border-edge"
                          : g.result === "W"
                          ? "bg-green-500"
                          : g.result === "L"
                          ? "bg-red-400"
                          : "bg-amber-400"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted mt-1.5">
                  Season progress — hover each week for details
                </p>
              </div>
            )}
          </div>

          {/* Sidebar stats */}
          <div className="hidden sm:block h-36 w-px" style={{ backgroundColor: team.color, opacity: 0.3 }} />
          <dl className="grid grid-cols-3 sm:flex sm:flex-col gap-x-6 gap-y-2 text-sm shrink-0 w-full sm:w-auto">
            {[
              { label: "PF / G",  value: ppg },
              { label: "PA / G",  value: papg },
              { label: "Diff",    value: diffStr, colored: diffNum !== null },
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
              { label: "Record",      value: team.record },
              { label: "Conference",  value: team.conference },
              { label: "Division",    value: team.division },
              {
                label: "Pt Diff",
                value: diffStr,
                colored: diffNum !== null,
              },
            ].map(({ label, value, colored }) => (
              <div
                key={label}
                className="bg-card border border-edge rounded-md p-4 text-center"
              >
                <p className="text-xs text-muted uppercase tracking-wide mb-1">
                  {label}
                </p>
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

          {/* Recent results — scrollable row of game cards */}
          {recentGames.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Recent Results
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recentGames.map((g) => {
                  const won = g.result === "W";
                  const tied = g.result === "T";

                  // Normalise to away-on-top / home-on-bottom
                  const awayAbbr  = g.is_home ? g.opponent_abbr   : team.abbreviation;
                  const awayScore = g.is_home ? g.opp_score        : g.this_score;
                  const awayLogo  = g.is_home ? g.opponent_logo     : null;
                  const awayWon   = g.is_home ? !won && !tied       : won;

                  const homeAbbr  = g.is_home ? team.abbreviation  : g.opponent_abbr;
                  const homeScore = g.is_home ? g.this_score        : g.opp_score;
                  const homeLogo  = g.is_home ? null                : g.opponent_logo;
                  const homeWon   = g.is_home ? won                 : !won && !tied;

                  return (
                    <div
                      key={g.id}
                      className="shrink-0 bg-card border border-edge rounded-md px-3 py-2.5 w-[148px]"
                    >
                      <p className="text-[10px] text-muted text-center mb-2 truncate">
                        Wk {g.week} · {formatGameDate(g.date)}
                      </p>

                      {/* Away row */}
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

                      {/* Home row */}
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

                      <p
                        className={`text-[10px] mt-2 text-center font-bold ${
                          won ? "text-green-500" : tied ? "text-amber-500" : "text-red-400"
                        }`}
                      >
                        {g.result}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming games */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Upcoming
              </h3>
              <div className="space-y-2">
                {upcoming.slice(0, 5).map((g) => (
                  <div
                    key={g.id}
                    className="bg-card border border-edge rounded-md p-3 flex items-center gap-3"
                  >
                    {g.opponent_logo ? (
                      <div className="relative w-8 h-8 shrink-0">
                        <Image
                          src={g.opponent_logo}
                          alt={g.opponent_abbr}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 shrink-0 bg-edge rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">
                        {g.is_home ? "vs" : "@"} {g.opponent_name || g.opponent_abbr}
                      </p>
                      <p className="text-xs text-muted">Week {g.week}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-secondary">
                        {formatGameDate(g.date)}
                      </p>
                      <p className="text-xs text-muted">{g.is_home ? "Home" : "Away"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed.length === 0 && upcoming.length === 0 && (
            <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary text-sm">
              No schedule data available
            </div>
          )}
        </div>
      )}

      {/* ── Schedule ─────────────────────────────────────────────── */}
      {activeTab === "Schedule" && (
        <div>
          {team.schedule.length === 0 ? (
            <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary text-sm">
              Schedule not available
            </div>
          ) : (
            <div className="bg-card border border-edge rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-edge">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                        Wk
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                        Opponent
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                        H/A
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                        Result
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.schedule.map((g, i) => (
                      <tr
                        key={g.id ?? i}
                        className={`border-b border-edge last:border-0 transition-colors hover:bg-base ${
                          !g.completed ? "opacity-55" : ""
                        }`}
                      >
                        {/* Week */}
                        <td className="px-4 py-3 text-muted font-mono text-xs tabular-nums">
                          {g.week ?? "—"}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-secondary text-xs whitespace-nowrap">
                          {formatGameDate(g.date)}
                        </td>

                        {/* Opponent */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {g.opponent_logo ? (
                              <div className="relative w-5 h-5 shrink-0">
                                <Image
                                  src={g.opponent_logo}
                                  alt={g.opponent_abbr}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-5 h-5 shrink-0" />
                            )}
                            <span className="font-medium text-primary text-sm truncate">
                              {g.opponent_name || g.opponent_abbr}
                            </span>
                          </div>
                        </td>

                        {/* Home / Away */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-secondary font-medium">
                            {g.is_home ? "H" : "A"}
                          </span>
                        </td>

                        {/* Result badge */}
                        <td className="px-4 py-3 text-center">
                          {g.completed ? (
                            <span
                              className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                                g.result === "W"
                                  ? "bg-green-100 text-green-700"
                                  : g.result === "L"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {g.result}
                            </span>
                          ) : (
                            <span className="text-xs text-muted">
                              {g.status_text || "—"}
                            </span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-secondary">
                          {g.completed
                            ? `${g.this_score}–${g.opp_score}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
            <div className="h-4 bg-zinc-200 rounded w-24 mx-auto sm:mx-0" />
            <div className="h-9 bg-zinc-200 rounded w-56 mx-auto sm:mx-0" />
            <div className="h-5 bg-zinc-200 rounded w-24 mx-auto sm:mx-0" />
            <div className="flex gap-1 mt-3 justify-center sm:justify-start">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 bg-zinc-200 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 border-b border-edge pb-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-zinc-200 rounded w-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-zinc-200 rounded" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-zinc-200 rounded" />
        ))}
      </div>
    </div>
  );
}
