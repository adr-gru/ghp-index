"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TeamCard from "@/components/TeamCard";
import NFLTeamCard from "@/components/NFLTeamCard";
import MLBTeamCard from "@/components/MLBTeamCard";
import DashboardScoreboard from "@/components/DashboardScoreboard";
import DashboardLeaders from "@/components/DashboardLeaders";
import DashboardStandings from "@/components/DashboardStandings";
import NFLScoreboard from "@/components/NFLScoreboard";
import MLBScoreboard from "@/components/MLBScoreboard";
import MLBStandings from "@/components/MLBStandings";
import MLBLeaders from "@/components/MLBLeaders";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type League = "NBA" | "NFL" | "MLB";
type NFLConference = "AFC" | "NFC";
const NFL_DIVISIONS = ["East", "North", "South", "West"] as const;

interface NFLTeam {
  id: string;
  abbreviation: string;
  display_name: string;
  color: string;
  logo: string;
  conference: NFLConference;
  division: string;
  record: string;
  wins: number;
  losses: number;
}

interface MLBTeam {
  id: number;
  name: string;
  abbreviation: string;
  division: string;
  league: string;
}

const MLB_DIVISIONS = [
  "American League East",
  "American League Central",
  "American League West",
  "National League East",
  "National League Central",
  "National League West",
];

function shortDiv(div: string) {
  return div.replace("American League", "AL").replace("National League", "NL");
}

export default function Home() {
  const [league, setLeague] = useState<League>("NBA");

  // ── NBA state ──────────────────────────────────────────────────────────────
  const [nbaTeams, setNbaTeams] = useState<
    { id: number; full_name: string; abbreviation: string }[]
  >([]);
  const [nbaStandings, setNbaStandings] = useState<{
    east: any[];
    west: any[];
  } | null>(null);
  const [nbaLeaders, setNbaLeaders] = useState<{
    pts: any;
    reb: any;
    ast: any;
  } | null>(null);
  const [nbaLoading, setNbaLoading] = useState(true);
  const nbaFetched = useRef(false);

  // ── NFL state ──────────────────────────────────────────────────────────────
  const [nflTeams, setNflTeams] = useState<NFLTeam[]>([]);
  const [nflLoading, setNflLoading] = useState(false);
  const [nflConf, setNflConf] = useState<NFLConference>("AFC");
  const nflFetched = useRef(false);

  // ── MLB state ──────────────────────────────────────────────────────────────
  const [mlbTeams, setMlbTeams] = useState<MLBTeam[]>([]);
  const [mlbLoading, setMlbLoading] = useState(false);
  const mlbFetched = useRef(false);

  // ── Fetch NBA data on first NBA view ────────────────────────────────────────
  useEffect(() => {
    if (league !== "NBA" || nbaFetched.current) return;
    nbaFetched.current = true;
    setNbaLoading(true);
    (async () => {
      const [teamsRes, standingsRes, ptsRes, rebRes, astRes] =
        await Promise.allSettled([
          fetch(`${API_URL}/api/teams`),
          fetch(`${API_URL}/api/standings`),
          fetch(`${API_URL}/api/leaders?stat=PTS`),
          fetch(`${API_URL}/api/leaders?stat=REB`),
          fetch(`${API_URL}/api/leaders?stat=AST`),
        ]);

      setNbaTeams(
        teamsRes.status === "fulfilled" && teamsRes.value.ok
          ? await teamsRes.value.json()
          : []
      );
      setNbaStandings(
        standingsRes.status === "fulfilled" && standingsRes.value.ok
          ? await standingsRes.value.json()
          : null
      );
      const pts =
        ptsRes.status === "fulfilled" && ptsRes.value.ok
          ? await ptsRes.value.json()
          : null;
      const reb =
        rebRes.status === "fulfilled" && rebRes.value.ok
          ? await rebRes.value.json()
          : null;
      const ast =
        astRes.status === "fulfilled" && astRes.value.ok
          ? await astRes.value.json()
          : null;
      if (pts && reb && ast) setNbaLeaders({ pts, reb, ast });
      setNbaLoading(false);
    })();
  }, [league]);

  // ── Fetch NFL teams on first NFL view ──────────────────────────────────────
  useEffect(() => {
    if (league !== "NFL" || nflFetched.current) return;
    nflFetched.current = true;
    setNflLoading(true);
    fetch(`${API_URL}/api/nfl/teams`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setNflTeams(Array.isArray(data) ? data : []);
        setNflLoading(false);
      })
      .catch(() => setNflLoading(false));
  }, [league]);

  // ── Fetch MLB teams on first MLB view ──────────────────────────────────────
  useEffect(() => {
    if (league !== "MLB" || mlbFetched.current) return;
    mlbFetched.current = true;
    setMlbLoading(true);
    fetch(`${API_URL}/api/mlb/teams`)
      .then((r) => (r.ok ? r.json() : { teams: [] }))
      .then((data) => {
        setMlbTeams(Array.isArray(data.teams) ? data.teams : []);
        setMlbLoading(false);
      })
      .catch(() => setMlbLoading(false));
  }, [league]);

  const nflDivTeams = (conf: NFLConference, div: string) =>
    nflTeams
      .filter((t) => t.conference === conf && t.division === div)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  const mlbByDivision = MLB_DIVISIONS.map((div) => ({
    division: div,
    league: div.startsWith("American") ? "American League" : "National League",
    teams: mlbTeams.filter((t) => t.division === div),
  })).filter((g) => g.teams.length > 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">

      {/* ── League tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-edge">
        {(["NBA", "NFL", "MLB"] as League[]).map((l) => (
          <button
            key={l}
            onClick={() => setLeague(l)}
            className={`px-5 py-2 text-sm font-semibold tracking-wide transition-colors ${
              league === l
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-primary"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── NBA ───────────────────────────────────────────────────────────── */}
      {league === "NBA" && (
        <>
          <DashboardScoreboard />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-card border border-edge rounded-md p-4">
              {nbaLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-zinc-700 rounded" />
                  ))}
                </div>
              ) : nbaLeaders ? (
                <DashboardLeaders
                  pts={nbaLeaders.pts}
                  reb={nbaLeaders.reb}
                  ast={nbaLeaders.ast}
                />
              ) : (
                <p className="text-secondary text-sm">Leaders unavailable.</p>
              )}
            </section>

            <section className="bg-card border border-edge rounded-md p-4">
              {nbaLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-zinc-700 rounded" />
                  ))}
                </div>
              ) : nbaStandings ? (
                <DashboardStandings
                  east={nbaStandings.east}
                  west={nbaStandings.west}
                />
              ) : (
                <p className="text-secondary text-sm">Standings unavailable.</p>
              )}
            </section>
          </div>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
                NBA Teams
              </h2>
              <Link href="/nba" className="text-xs text-accent hover:underline">
                View all →
              </Link>
            </div>
            {nbaLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-20 bg-zinc-700 rounded animate-pulse" />
                ))}
              </div>
            ) : nbaTeams.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {nbaTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    id={team.id}
                    full_name={team.full_name}
                    abbreviation={team.abbreviation}
                  />
                ))}
              </div>
            ) : (
              <p className="text-secondary text-sm">Teams unavailable.</p>
            )}
          </section>
        </>
      )}

      {/* ── NFL ───────────────────────────────────────────────────────────── */}
      {league === "NFL" && (
        <>
          <section>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Scores
            </h2>
            <NFLScoreboard />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
                Teams
              </h2>
              <Link href="/nfl" className="text-xs text-accent hover:underline">
                View all →
              </Link>
            </div>

            {/* Conference sub-tabs */}
            <div className="flex gap-1 border-b border-edge mb-6">
              {(["AFC", "NFC"] as NFLConference[]).map((conf) => (
                <button
                  key={conf}
                  onClick={() => setNflConf(conf)}
                  className={`px-5 py-2 text-sm font-semibold tracking-wide transition-colors ${
                    nflConf === conf
                      ? "border-b-2 border-accent text-accent"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>

            {nflLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-zinc-700 rounded w-24 mb-3 animate-pulse" />
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <div
                          key={j}
                          className="h-14 bg-zinc-700 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {NFL_DIVISIONS.map((div) => {
                  const teams = nflDivTeams(nflConf, div);
                  return (
                    <div key={div}>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xs font-bold text-muted uppercase tracking-widest">
                          {nflConf} {div}
                        </h3>
                        <div className="flex-1 h-px bg-edge" />
                      </div>
                      <div className="space-y-2">
                        {teams.length > 0 ? (
                          teams.map((team) => (
                            <NFLTeamCard key={team.id} {...team} />
                          ))
                        ) : (
                          <div className="h-14 bg-card border border-edge rounded-md" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── MLB ───────────────────────────────────────────────────────────── */}
      {league === "MLB" && (
        <>
          <section>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Scores
            </h2>
            <MLBScoreboard />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-card border border-edge rounded-md p-4">
              <MLBLeaders />
            </section>
            <section className="bg-card border border-edge rounded-md p-4 overflow-auto">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Standings
              </h2>
              <MLBStandings />
            </section>
          </div>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
                Teams
              </h2>
              <Link href="/mlb" className="text-xs text-accent hover:underline">
                View all →
              </Link>
            </div>
            {mlbLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-700 rounded animate-pulse" />
                ))}
              </div>
            ) : mlbTeams.length > 0 ? (
              <div className="space-y-6">
                {(["American League", "National League"] as const).map((lg) => {
                  const groups = mlbByDivision.filter((g) => g.league === lg);
                  const isAL = lg === "American League";
                  return (
                    <div key={lg}>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: isAL ? "#003087" : "#C41E3A" }}
                        >
                          {isAL ? "AL" : "NL"}
                        </span>
                        <h3 className="text-sm font-semibold text-primary">{lg}</h3>
                      </div>
                      <div className="space-y-4">
                        {groups.map((group) => (
                          <div key={group.division}>
                            <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                              {shortDiv(group.division)}
                            </h4>
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
            ) : (
              <p className="text-secondary text-sm">Teams unavailable.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
