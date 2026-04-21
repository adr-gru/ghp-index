"use client";

import { useEffect, useState } from "react";
import TeamCard from "@/components/TeamCard";
import NFLTeamCard from "@/components/NFLTeamCard";
import MLBTeamCard from "@/components/MLBTeamCard";
import PlayerSearch from "@/components/PlayerSearch";
import DashboardScoreboard from "@/components/DashboardScoreboard";
import MLBScoreboard from "@/components/MLBScoreboard";

type League = "NBA" | "NFL" | "MLB" | "NHL";
type ContentTab = "Teams" | "Players";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NBATeam {
  id: number;
  full_name: string;
  abbreviation: string;
}

interface NFLTeam {
  id: string;
  display_name: string;
  abbreviation: string;
  logo: string;
  color: string;
  alternate_color: string;
  conference: string;
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

const DIVISION_ORDER = [
  "American League East",
  "American League Central",
  "American League West",
  "National League East",
  "National League Central",
  "National League West",
];

export default function Home() {
  const [league, setLeague] = useState<League>("NBA");
  const [tab, setTab] = useState<ContentTab>("Teams");

  const [nbaTeams, setNbaTeams] = useState<NBATeam[]>([]);
  const [nbaLoading, setNbaLoading] = useState(false);
  const [nbaError, setNbaError] = useState(false);

  const [nflTeams, setNflTeams] = useState<NFLTeam[]>([]);
  const [nflLoading, setNflLoading] = useState(false);
  const [nflError, setNflError] = useState(false);

  const [mlbTeams, setMlbTeams] = useState<MLBTeam[]>([]);
  const [mlbLoading, setMlbLoading] = useState(false);
  const [mlbError, setMlbError] = useState(false);

  // Lazy-load NBA teams on first NBA+Teams selection
  useEffect(() => {
    if (league !== "NBA" || tab !== "Teams") return;
    if (nbaLoading || nbaTeams.length > 0) return;
    setNbaLoading(true);
    setNbaError(false);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    fetch(`${API_URL}/api/teams`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => setNbaTeams(Array.isArray(data) ? data : []))
      .catch(() => setNbaError(true))
      .finally(() => { setNbaLoading(false); clearTimeout(timer); });
    return () => { ctrl.abort(); clearTimeout(timer); };
  }, [league, tab, nbaLoading, nbaTeams.length]);

  // Lazy-load NFL teams on first NFL+Teams selection
  useEffect(() => {
    if (league !== "NFL" || tab !== "Teams") return;
    if (nflLoading || nflTeams.length > 0) return;
    setNflLoading(true);
    setNflError(false);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    fetch(`${API_URL}/api/nfl/teams`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => setNflTeams(Array.isArray(data) ? data : []))
      .catch(() => setNflError(true))
      .finally(() => { setNflLoading(false); clearTimeout(timer); });
    return () => { ctrl.abort(); clearTimeout(timer); };
  }, [league, tab, nflLoading, nflTeams.length]);

  // Lazy-load MLB teams on first MLB+Teams selection
  useEffect(() => {
    if (league !== "MLB" || tab !== "Teams") return;
    if (mlbLoading || mlbTeams.length > 0) return;
    setMlbLoading(true);
    setMlbError(false);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    fetch(`${API_URL}/api/mlb/teams`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.teams ?? []);
        setMlbTeams(list);
      })
      .catch(() => setMlbError(true))
      .finally(() => { setMlbLoading(false); clearTimeout(timer); });
    return () => { ctrl.abort(); clearTimeout(timer); };
  }, [league, tab, mlbLoading, mlbTeams.length]);

  const handleLeague = (l: League) => {
    setLeague(l);
    setTab("Teams");
  };

  // NFL teams grouped by conference → division
  const nflByConf = ["AFC", "NFC"].map((conf) => {
    const confTeams = nflTeams.filter((t) => t.conference === conf);
    const divisions = [...new Set(confTeams.map((t) => t.division))].sort();
    return {
      conf,
      divisions: divisions.map((div) => ({
        div,
        teams: confTeams.filter((t) => t.division === div),
      })),
    };
  });

  // MLB teams grouped by division in canonical order
  const mlbByDivision = DIVISION_ORDER.map((div) => ({
    div,
    teams: mlbTeams.filter((t) => t.division === div),
  })).filter((d) => d.teams.length > 0);

  const LEAGUES: { name: League; disabled?: boolean }[] = [
    { name: "NBA" },
    { name: "NFL" },
    { name: "MLB" },
    { name: "NHL", disabled: true },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* League selector tabs */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Leagues
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {LEAGUES.map(({ name: l, disabled }) => (
            <button
              key={l}
              onClick={() => !disabled && handleLeague(l)}
              disabled={disabled}
              className={`flex items-center justify-between px-5 py-4 rounded-md border transition-colors text-left ${
                disabled
                  ? "bg-base border-card opacity-50 cursor-not-allowed"
                  : league === l
                  ? "bg-card border-accent text-primary"
                  : "bg-card border-edge hover:border-accent text-primary"
              }`}
            >
              <span className="text-xl font-bold">{l}</span>
              {disabled && (
                <span className="text-[10px] text-muted font-medium">Soon</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Scoreboard per league */}
      {league === "NBA" && <DashboardScoreboard />}
      {league === "MLB" && <MLBScoreboard />}

      {/* Teams / Players sub-tabs */}
      <div className="flex gap-1 border-b border-edge">
        {(["Teams", "Players"] as ContentTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── NBA ── */}
      {league === "NBA" && tab === "Teams" && (
        <section>
          {nbaLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-14 bg-card border border-edge rounded-md animate-pulse" />
              ))}
            </div>
          )}
          {nbaError && <p className="text-secondary text-sm">Failed to load teams.</p>}
          {!nbaLoading && !nbaError && nbaTeams.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {nbaTeams.map((team) => (
                <TeamCard key={team.id} id={team.id} full_name={team.full_name} abbreviation={team.abbreviation} />
              ))}
            </div>
          )}
        </section>
      )}

      {league === "NBA" && tab === "Players" && (
        <section>
          <PlayerSearch className="max-w-sm" />
        </section>
      )}

      {/* ── NFL ── */}
      {league === "NFL" && tab === "Teams" && (
        <section className="space-y-6">
          {nflLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="h-14 bg-card border border-edge rounded-md animate-pulse" />
              ))}
            </div>
          )}
          {nflError && <p className="text-secondary text-sm">Failed to load teams.</p>}
          {!nflLoading && !nflError && nflTeams.length > 0 &&
            nflByConf.map(({ conf, divisions }) => (
              <div key={conf}>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{conf}</h3>
                <div className="space-y-4">
                  {divisions.map(({ div, teams }) => (
                    <div key={div}>
                      <p className="text-xs text-muted mb-2">{div}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {teams.map((team) => (
                          <NFLTeamCard key={team.id} {...team} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </section>
      )}

      {league === "NFL" && tab === "Players" && (
        <section>
          <p className="text-secondary text-sm">NFL player search coming soon.</p>
        </section>
      )}

      {/* ── MLB ── */}
      {league === "MLB" && tab === "Teams" && (
        <section className="space-y-6">
          {mlbLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-14 bg-card border border-edge rounded-md animate-pulse" />
              ))}
            </div>
          )}
          {mlbError && <p className="text-secondary text-sm">Failed to load teams.</p>}
          {!mlbLoading && !mlbError && mlbTeams.length > 0 && (
            <div className="space-y-6">
              {["American League", "National League"].map((lg) => (
                <div key={lg}>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{lg}</h3>
                  <div className="space-y-4">
                    {mlbByDivision
                      .filter((d) => d.div.startsWith(lg === "American League" ? "American" : "National"))
                      .map(({ div, teams }) => (
                        <div key={div}>
                          <p className="text-xs text-muted mb-2">
                            {div.replace("American League ", "").replace("National League ", "")}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {teams.map((team) => (
                              <MLBTeamCard key={team.id} id={team.id} name={team.name} abbreviation={team.abbreviation} division={team.division} />
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {league === "MLB" && tab === "Players" && (
        <section>
          <p className="text-secondary text-sm">MLB player search coming soon.</p>
        </section>
      )}
    </main>
  );
}
