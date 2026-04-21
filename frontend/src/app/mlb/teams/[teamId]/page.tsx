"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMLBTeamColor } from "@/utils/mlbTeamColors";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type TeamTab = "Overview" | "Pitchers" | "Hitters" | "Game Log";
const TABS: TeamTab[] = ["Overview", "Pitchers", "Hitters", "Game Log"];

interface RosterPlayer {
  player_id: number;
  name: string;
  number: string;
  position: string;
  position_type: string;
  age: number | null;
}

interface TeamData {
  id: number;
  name: string;
  teamName: string;
  locationName: string;
  abbreviation: string;
  division: string;
  league: string;
  venue: string;
  firstYearOfPlay: string;
  wins: number | null;
  losses: number | null;
  roster: RosterPlayer[];
  hitting_stats: Record<string, string | number>;
  pitching_stats: Record<string, string | number>;
}

interface GameLogEntry {
  game_id: number;
  date: string;
  opponent_abbr: string;
  opponent_id: number;
  is_home: boolean;
  runs_scored: number;
  runs_allowed: number;
  wl: "W" | "L";
  innings: number;
}

// Shorten "American League East" → "AL East"
function shortDivision(div: string): string {
  return div.replace("American League", "AL").replace("National League", "NL");
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-base border border-edge rounded-md px-3 py-2 text-center">
      <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-lg font-bold text-primary tabular-nums">{value}</p>
    </div>
  );
}

function PlayerRow({ player, accent }: { player: RosterPlayer; accent: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-edge last:border-0 hover:bg-base transition-colors">
      <span
        className="text-xs font-bold w-6 text-right shrink-0"
        style={{ color: accent }}
      >
        {player.number || "—"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{player.name}</p>
      </div>
      <span className="text-xs text-muted font-semibold shrink-0">{player.position}</span>
      {player.age && (
        <span className="text-xs text-muted shrink-0 hidden sm:block">{player.age} yr</span>
      )}
    </div>
  );
}

export default function MLBTeamPage() {
  const params = useParams();
  const teamId = Number(params.teamId);

  const [team, setTeam] = useState<TeamData | null>(null);
  const [gamelog, setGamelog] = useState<GameLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TeamTab>("Overview");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const teamResp = await fetch(`${API_URL}/api/mlb/teams/${teamId}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!teamResp.ok) throw new Error(`${teamResp.status}`);
      const teamData: TeamData = await teamResp.json();
      setTeam(teamData);

      // Gamelog — best-effort
      try {
        const glController = new AbortController();
        const glTimeout = setTimeout(() => glController.abort(), 15000);
        const glResp = await fetch(`${API_URL}/api/mlb/gamelog/${teamId}`, { signal: glController.signal });
        clearTimeout(glTimeout);
        if (glResp.ok) {
          const glData = await glResp.json();
          setGamelog(glData.games ?? []);
        }
      } catch {
        // gamelog is non-critical
      }
    } catch (err: unknown) {
      const e = err as { name?: string };
      setError(e.name === "AbortError" ? "Request timed out" : "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [teamId]);

  if (loading) return <TeamSkeleton />;

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card border border-edge rounded-md p-6 text-center space-y-4">
          <div className="text-5xl">⚾</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load team</h1>
          <p className="text-secondary">{error ?? "Unknown error"}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const teamColor = getMLBTeamColor(teamId);
  const record = team.wins !== null && team.losses !== null ? `${team.wins}–${team.losses}` : "—";
  const pct =
    team.wins !== null && team.losses !== null && team.wins + team.losses > 0
      ? ((team.wins / (team.wins + team.losses)) * 1000).toFixed(0)
      : null;

  const pitchers = team.roster.filter((p) => p.position_type === "Pitcher");
  const hitters = team.roster.filter((p) => p.position_type !== "Pitcher");

  // Recent results for overview
  const recentGames = gamelog.slice(0, 10);
  const wins = recentGames.filter((g) => g.wl === "W").length;
  const losses10 = recentGames.length - wins;

  const winStreak = (() => {
    let s = 0;
    for (const g of gamelog) { if (g.wl === "W") s++; else break; }
    return s;
  })();
  const lossStreak = (() => {
    let s = 0;
    for (const g of gamelog) { if (g.wl === "L") s++; else break; }
    return s;
  })();

  const hasH = Object.keys(team.hitting_stats).length > 0;
  const hasP = Object.keys(team.pitching_stats).length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-muted">
        <Link href="/mlb" className="hover:text-accent transition-colors">MLB</Link>
        <span className="mx-1.5">›</span>
        <span className="text-secondary">{team.name}</span>
      </div>

      {/* Hero */}
      <div
        className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
        style={{ borderTopColor: teamColor, borderTopWidth: 3 }}
      >
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
          <Image
            src={`https://www.mlbstatic.com/team-logos/${teamId}.svg`}
            alt={`${team.name} logo`}
            fill
            unoptimized
          />
        </div>

        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            {team.locationName} {team.teamName}
          </h1>
          <p className="text-secondary font-medium mt-1">
            {record}
            {pct && ` · .${pct}`}
            {" · "}{shortDivision(team.division)}
          </p>

          {/* Hitting stats pills */}
          {hasH && (
            <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
              <StatPill label="AVG" value={team.hitting_stats.avg as string} />
              <StatPill label="HR" value={team.hitting_stats.homeRuns as number} />
              <StatPill label="OPS" value={team.hitting_stats.ops as string} />
              {hasP && <StatPill label="ERA" value={team.pitching_stats.era as string} />}
            </div>
          )}
        </div>

        {/* Metadata column */}
        <dl className="grid grid-cols-2 sm:flex sm:flex-col gap-x-6 gap-y-1.5 text-sm shrink-0 w-full sm:w-auto">
          <div className="flex gap-2">
            <dt className="text-secondary">League</dt>
            <dd className="text-primary">{team.league}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Division</dt>
            <dd className="text-primary">{shortDivision(team.division)}</dd>
          </div>
          {team.venue && (
            <div className="flex gap-2">
              <dt className="text-secondary">Ballpark</dt>
              <dd className="text-primary truncate max-w-[140px]" title={team.venue}>{team.venue}</dd>
            </div>
          )}
          {team.firstYearOfPlay && (
            <div className="flex gap-2">
              <dt className="text-secondary">Est.</dt>
              <dd className="text-primary">{team.firstYearOfPlay}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-secondary">Roster</dt>
            <dd className="text-primary">{team.roster.length} players</dd>
          </div>
        </dl>
      </div>

      {/* Tabs */}
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

      {/* Overview */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Streak",
                value: winStreak > 0 ? `W${winStreak}` : lossStreak > 0 ? `L${lossStreak}` : "—",
                green: winStreak >= 3,
              },
              { label: "Last 10", value: recentGames.length > 0 ? `${wins}–${losses10}` : "—" },
              { label: "Home",  value: `${gamelog.filter((g) => g.is_home && g.wl === "W").length}–${gamelog.filter((g) => g.is_home && g.wl === "L").length}` },
              { label: "Away",  value: `${gamelog.filter((g) => !g.is_home && g.wl === "W").length}–${gamelog.filter((g) => !g.is_home && g.wl === "L").length}` },
            ].map(({ label, value, green }) => (
              <div key={label} className="bg-card border border-edge rounded-md p-4 text-center">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-2xl font-bold ${green ? "text-green-600" : "text-primary"}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Season stats */}
          {(hasH || hasP) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hasH && (
                <div className="bg-card border border-edge rounded-md p-4">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Team Batting</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "AVG",  value: team.hitting_stats.avg  },
                      { label: "OBP",  value: team.hitting_stats.obp  },
                      { label: "SLG",  value: team.hitting_stats.slg  },
                      { label: "OPS",  value: team.hitting_stats.ops  },
                      { label: "HR",   value: team.hitting_stats.homeRuns },
                      { label: "RBI",  value: team.hitting_stats.rbi  },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-xl font-bold text-primary tabular-nums">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hasP && (
                <div className="bg-card border border-edge rounded-md p-4">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Team Pitching</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "ERA",  value: team.pitching_stats.era  },
                      { label: "WHIP", value: team.pitching_stats.whip },
                      { label: "SO",   value: team.pitching_stats.strikeOuts },
                      { label: "W",    value: team.pitching_stats.wins  },
                      { label: "L",    value: team.pitching_stats.losses },
                      { label: "SV",   value: team.pitching_stats.saves  },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-xl font-bold text-primary tabular-nums">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent results */}
          {recentGames.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Recent Results</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {recentGames.map((g) => {
                  const won = g.wl === "W";
                  return (
                    <div
                      key={g.game_id}
                      className="shrink-0 bg-card border border-edge rounded-md px-3 py-2.5 w-[130px]"
                    >
                      <p className="text-[10px] text-muted text-center mb-1.5">{g.date}</p>

                      {/* Away */}
                      <div className={`flex items-center justify-between mb-1 ${!g.is_home && won ? "" : g.is_home && !won ? "opacity-50" : won ? "opacity-50" : ""}`}>
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-5 h-5 shrink-0">
                            <Image
                              src={`https://www.mlbstatic.com/team-logos/${g.is_home ? g.opponent_id : teamId}.svg`}
                              alt={g.is_home ? g.opponent_abbr : team.abbreviation}
                              fill
                              unoptimized
                            />
                          </div>
                          <span className="text-xs font-semibold text-secondary">
                            {g.is_home ? g.opponent_abbr : team.abbreviation}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-secondary tabular-nums">
                          {g.is_home ? g.runs_allowed : g.runs_scored}
                        </span>
                      </div>

                      {/* Home */}
                      <div className={`flex items-center justify-between ${g.is_home && won ? "" : !g.is_home && !won ? "opacity-50" : won ? "" : "opacity-50"}`}>
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-5 h-5 shrink-0">
                            <Image
                              src={`https://www.mlbstatic.com/team-logos/${g.is_home ? teamId : g.opponent_id}.svg`}
                              alt={g.is_home ? team.abbreviation : g.opponent_abbr}
                              fill
                              unoptimized
                            />
                          </div>
                          <span className="text-xs font-semibold text-secondary">
                            {g.is_home ? team.abbreviation : g.opponent_abbr}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-secondary tabular-nums">
                          {g.is_home ? g.runs_scored : g.runs_allowed}
                        </span>
                      </div>

                      <p className={`text-[10px] mt-2 text-center font-bold ${won ? "text-green-600" : "text-red-500"}`}>
                        {won ? "W" : "L"}
                        {g.innings && g.innings !== 9 ? ` (${g.innings})` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pitchers */}
      {activeTab === "Pitchers" && (
        <div className="bg-card border border-edge rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-edge">
            <h2 className="text-sm font-semibold text-primary">Pitching Staff · {pitchers.length}</h2>
          </div>
          {pitchers.length === 0 ? (
            <p className="text-secondary text-sm px-4 py-6 text-center">No pitchers listed</p>
          ) : (
            <div>
              {pitchers.map((p) => <PlayerRow key={p.player_id} player={p} accent={teamColor} />)}
            </div>
          )}
        </div>
      )}

      {/* Hitters */}
      {activeTab === "Hitters" && (
        <div className="bg-card border border-edge rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-edge">
            <h2 className="text-sm font-semibold text-primary">Position Players · {hitters.length}</h2>
          </div>
          {hitters.length === 0 ? (
            <p className="text-secondary text-sm px-4 py-6 text-center">No position players listed</p>
          ) : (
            <div>
              {hitters.map((p) => <PlayerRow key={p.player_id} player={p} accent={teamColor} />)}
            </div>
          )}
        </div>
      )}

      {/* Game Log */}
      {activeTab === "Game Log" && (
        <div className="bg-card border border-edge rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-edge">
            <h2 className="text-sm font-semibold text-primary">Recent Game Log</h2>
          </div>
          {gamelog.length === 0 ? (
            <p className="text-secondary text-sm px-4 py-6 text-center">No recent games available</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted border-b border-edge">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Opponent</th>
                  <th className="text-center px-4 py-2 font-medium">H/A</th>
                  <th className="text-center px-4 py-2 font-medium">Score</th>
                  <th className="text-center px-4 py-2 font-medium">Inn</th>
                  <th className="text-center px-4 py-2 font-medium">W/L</th>
                </tr>
              </thead>
              <tbody>
                {gamelog.map((g) => (
                  <tr key={g.game_id} className="border-b border-edge last:border-0 hover:bg-base transition-colors">
                    <td className="px-4 py-2.5 text-secondary tabular-nums">{g.date}</td>
                    <td className="px-4 py-2.5 font-medium text-primary">{g.opponent_abbr}</td>
                    <td className="px-4 py-2.5 text-center text-muted">{g.is_home ? "H" : "A"}</td>
                    <td className="px-4 py-2.5 text-center text-primary font-semibold tabular-nums">
                      {g.runs_scored}–{g.runs_allowed}
                    </td>
                    <td className="px-4 py-2.5 text-center text-muted tabular-nums">
                      {g.innings !== 9 ? g.innings : "9"}
                    </td>
                    <td className={`px-4 py-2.5 text-center font-bold ${g.wl === "W" ? "text-green-600" : "text-red-500"}`}>
                      {g.wl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      <div className="h-4 bg-zinc-700 rounded w-32" />
      <div className="bg-card border border-edge rounded-md p-6 flex gap-6">
        <div className="w-24 h-24 bg-zinc-700 rounded-md shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-10 bg-zinc-700 rounded w-1/2" />
          <div className="h-5 bg-zinc-700 rounded w-1/3" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-zinc-700 rounded w-16" />)}
          </div>
        </div>
      </div>
      <div className="flex gap-4 border-b border-edge pb-2">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-zinc-700 rounded w-20" />)}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-zinc-700 rounded" />)}
      </div>
    </div>
  );
}
