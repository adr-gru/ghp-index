"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { findStateAbr } from "@/utils/states";
import { getTeamColor } from "@/utils/teamColors";
import PlayerCard from "@/components/PlayerCard";
import GameLog from "@/components/GameLog";
import TeamInfoNote from "@/components/TeamInfoNote";
import ShotsFilter from "@/components/ShotsFilter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type TeamTab = "Overview" | "Game Log" | "Shot Chart";
const TABS: TeamTab[] = ["Overview", "Game Log", "Shot Chart"];

// Abbreviation → NBA team ID (for logos)
const ABBR_TO_ID: Record<string, number> = {
  ATL: 1610612737, BOS: 1610612738, CLE: 1610612739, NOP: 1610612740,
  CHI: 1610612741, DAL: 1610612742, DEN: 1610612743, GSW: 1610612744,
  HOU: 1610612745, LAC: 1610612746, LAL: 1610612747, MIA: 1610612748,
  MIL: 1610612749, MIN: 1610612750, BKN: 1610612751, NYK: 1610612752,
  ORL: 1610612753, IND: 1610612754, PHI: 1610612755, PHX: 1610612756,
  POR: 1610612757, SAC: 1610612758, SAS: 1610612759, OKC: 1610612760,
  TOR: 1610612761, UTA: 1610612762, MEM: 1610612763, WAS: 1610612764,
  DET: 1610612765, CHA: 1610612766,
};

function parseMatchup(matchup: string, teamAbbr: string) {
  // e.g. "LAL vs. MIA" (home) or "LAL @ MIA" (away)
  const isHome = matchup.includes("vs.");
  const parts = matchup.split(/\s+(?:vs\.|@)\s+/);
  const oppAbbr = parts[1]?.trim() ?? "";
  const oppId = ABBR_TO_ID[oppAbbr] ?? 0;
  return { isHome, oppAbbr, oppId, teamAbbr };
}

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<any>(null);
  const [gamelog, setGamelog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TeamTab>("Overview");

  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const teamResponse = await fetch(`${API_URL}/api/teams/${teamId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!teamResponse.ok) {
        throw new Error(`Failed to fetch team data: ${teamResponse.status}`);
      }

      const teamData = await teamResponse.json();
      setTeam(teamData);

      try {
        const gamelogController = new AbortController();
        const gamelogTimeoutId = setTimeout(() => gamelogController.abort(), 20000);

        const gamelogResponse = await fetch(`${API_URL}/api/${teamId}/teamgamelog/`, {
          signal: gamelogController.signal,
        });
        clearTimeout(gamelogTimeoutId);

        if (gamelogResponse.ok) {
          setGamelog(await gamelogResponse.json());
        }
      } catch (err) {
        console.error("Failed to fetch game log:", err);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching team data:", err);
      setError(
        err.name === "AbortError"
          ? "Request timed out. The NBA API is slow."
          : "Failed to load team data."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  if (loading) return <TeamPageSkeleton />;

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load team data</h1>
          <p className="text-secondary">{error || "Unknown error occurred"}</p>
          <button
            onClick={fetchTeamData}
            className="px-6 py-2 bg-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const teamInfo = team.info.resultSets[0].rowSet.map((t: string[]) => ({
    teamId: t[0],
    seasonYear: t[1],
    city: t[2],
    teamName: t[3],
    teamAbr: t[4],
    conference: t[5],
    teamDivision: t[6],
    wins: t[9],
    losses: t[10],
    PCT: t[11],
    conferenceRank: t[12],
    divisionRank: t[13],
    minYear: t[14],
  }));

  const teamRanks = team.info.resultSets[1].rowSet.map((t: string[]) => ({
    pointsPerGame: t[4],
    reboundsPerGame: t[6],
    assistsPerGame: t[8],
    opponentsPointsPerGame: t[10],
  }));

  const computed = team.computed_stats ?? null;
  const { pointsPerGame, reboundsPerGame, assistsPerGame, opponentsPointsPerGame } =
    teamRanks[0] ?? {};
  const ppg = pointsPerGame ?? computed?.ppg ?? "—";
  const rpg = reboundsPerGame ?? computed?.rpg ?? "—";
  const apg = assistsPerGame ?? computed?.apg ?? "—";
  const oppg = opponentsPointsPerGame ?? "—";

  const {
    city, teamName, wins, losses, teamAbr, conference, teamDivision,
    divisionRank, conferenceRank, minYear, PCT,
  } = teamInfo[0] ?? {};

  const teamColor = getTeamColor(teamId);
  const record = `${wins}–${losses}`;
  const location = `${city}, ${findStateAbr(city)}`;

  const roster = team.roster.resultSets[0].rowSet.map((player: string[]) => ({
    teamId: player[0],
    playerName: player[3],
    playerNumber: player[6],
    position: player[7],
    playerId: player[14],
  }));

  const games = (gamelog?.info.resultSets[0].rowSet ?? []).map((game: string[]) => ({
    teamId: game[0],
    gameId: game[1],
    gameDate: game[2],
    matchup: game[3],
    wl: game[4],
    w: game[5],
    l: game[6],
    wPct: game[7],
    min: game[8],
    fgm: game[9],
    fga: game[10],
    fgPct: game[11],
    fg3m: game[12],
    fg3a: game[13],
    fg3Pct: game[14],
    ftm: game[15],
    fta: game[16],
    ftPct: game[17],
    oreb: game[18],
    dreb: game[19],
    reb: game[20],
    ast: game[21],
    stl: game[22],
    blk: game[23],
    tov: game[24],
    pf: game[25],
    pts: game[26],
  }));

  const n = games.length;
  const gameavg = (key: keyof typeof games[0]) =>
    n > 0
      ? (games.reduce((sum: number, g: any) => sum + parseFloat(g[key] || "0"), 0) / n).toFixed(1)
      : "—";

  const winStreak = (() => {
    let streak = 0;
    for (const g of games) {
      if (g.wl === "W") streak++;
      else break;
    }
    return streak;
  })();
  const lossStreak = (() => {
    let streak = 0;
    for (const g of games) {
      if (g.wl === "L") streak++;
      else break;
    }
    return streak;
  })();

  const lastTen = games.slice(0, 10);
  const l10W = lastTen.filter((g: any) => g.wl === "W").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Team Hero */}
      <div
        className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8"
        style={{ borderTopColor: teamColor, borderTopWidth: 3 }}
      >
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
          <Image src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`} alt="Team Logo" fill />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            {city} {teamName}
          </h1>
          <p className="text-secondary font-medium mt-1">
            {record} · {teamAbr} · {conference}
          </p>
          <div className="flex gap-3 mt-4 justify-center sm:justify-start flex-wrap">
            <TeamInfoNote title="Points" info={ppg} teamColor={teamColor} />
            <TeamInfoNote title="Assists" info={apg} teamColor={teamColor} />
            <TeamInfoNote title="Rebounds" info={rpg} teamColor={teamColor} />
            <TeamInfoNote title="Opp PPG" info={oppg} teamColor={teamColor} />
          </div>
        </div>
        <div className="hidden sm:block h-40 w-px sm:ml-auto" style={{ backgroundColor: teamColor, opacity: 0.4 }} />
        <dl className="grid grid-cols-2 sm:flex sm:flex-col gap-x-6 gap-y-1.5 text-sm shrink-0 w-full sm:w-auto">
          <div className="flex gap-2"><dt className="text-secondary">Location</dt><dd className="text-primary">{location}</dd></div>
          <div className="flex gap-2"><dt className="text-secondary">Division</dt><dd className="text-primary">{teamDivision}</dd></div>
          <div className="flex gap-2"><dt className="text-secondary">Div. Rank</dt><dd className="text-primary">{divisionRank}</dd></div>
          <div className="flex gap-2"><dt className="text-secondary">Conf. Rank</dt><dd className="text-primary">{conferenceRank}</dd></div>
          <div className="flex gap-2"><dt className="text-secondary">Win %</dt><dd className="text-primary">{PCT ? (parseFloat(PCT) * 100).toFixed(1) + "%" : "—"}</dd></div>
          <div className="flex gap-2"><dt className="text-secondary">Since</dt><dd className="text-primary">{minYear}</dd></div>
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

      {/* Overview — roster left, stats + recent results right */}
      {activeTab === "Overview" && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Roster — left column */}
          <div className="w-full lg:w-64 shrink-0">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              Roster · {roster.length}
            </h2>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[480px] pr-1 lg:grid-cols-1">
              {roster.map((player: { playerId: number; playerName: string; position: string; playerNumber: number }) => (
                <PlayerCard
                  key={player.playerId}
                  id={player.playerId}
                  fullName={player.playerName}
                  position={player.position}
                  playerNumber={player.playerNumber}
                />
              ))}
            </div>
          </div>

          {/* Right column — quick stats + recent results */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Streak",
                  value: winStreak > 0 ? `W${winStreak}` : lossStreak > 0 ? `L${lossStreak}` : "—",
                  accent: winStreak >= 3,
                },
                { label: "Last 10", value: `${l10W}–${10 - l10W}` },
                {
                  label: "Home",
                  value: `${games.filter((g: any) => !g.matchup.includes("@") && g.wl === "W").length}–${games.filter((g: any) => !g.matchup.includes("@") && g.wl === "L").length}`,
                },
                {
                  label: "Away",
                  value: `${games.filter((g: any) => g.matchup.includes("@") && g.wl === "W").length}–${games.filter((g: any) => g.matchup.includes("@") && g.wl === "L").length}`,
                },
              ].map(({ label, value, accent }) => (
                <div key={label} className="bg-card border border-edge rounded-md p-4 text-center">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${accent ? "text-green-400" : "text-primary"}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Season averages */}
            {n > 0 && (
              <div className="bg-card border border-edge rounded-md p-4">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Season Averages</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {[
                    { label: "PTS", value: gameavg("pts") },
                    { label: "REB", value: gameavg("reb") },
                    { label: "AST", value: gameavg("ast") },
                    { label: "STL", value: gameavg("stl") },
                    { label: "BLK", value: gameavg("blk") },
                    { label: "TOV", value: gameavg("tov") },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-2xl font-bold text-primary">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Results — dashboard-style cards */}
            {games.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Recent Results</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {games.slice(0, 10).map((g: any) => {
                    const { isHome, oppAbbr, oppId } = parseMatchup(g.matchup, teamAbr);
                    const won = g.wl === "W";

                    // Dashboard layout: away on top, home on bottom
                    const awayAbbr = isHome ? oppAbbr : teamAbr;
                    const awayId  = isHome ? oppId  : Number(teamId);
                    const awayPts = isHome ? null   : g.pts;
                    const awayWon = isHome ? !won   : won;

                    const homeAbbr = isHome ? teamAbr    : oppAbbr;
                    const homeId  = isHome ? Number(teamId) : oppId;
                    const homePts = isHome ? g.pts  : null;
                    const homeWon = isHome ? won    : !won;

                    return (
                      <div
                        key={g.gameId}
                        className="shrink-0 bg-card border border-edge rounded-md px-3 py-2.5 w-[136px]"
                      >
                        <p className="text-[10px] text-muted text-center mb-2">{g.gameDate}</p>

                        {/* Away row */}
                        <div className={`flex items-center justify-between mb-1.5 ${!awayWon ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-1.5">
                            {awayId ? (
                              <div className="relative w-5 h-5 shrink-0">
                                <Image
                                  src={`https://cdn.nba.com/logos/nba/${awayId}/primary/L/logo.svg`}
                                  alt={awayAbbr}
                                  fill
                                />
                              </div>
                            ) : <div className="w-5 h-5 shrink-0" />}
                            <span className={`text-xs font-semibold ${awayWon ? "text-primary" : "text-secondary"}`}>{awayAbbr}</span>
                          </div>
                          <span className={`text-xs font-bold tabular-nums ${awayWon ? "text-primary" : "text-secondary"}`}>
                            {awayPts ?? "–"}
                          </span>
                        </div>

                        {/* Home row */}
                        <div className={`flex items-center justify-between ${!homeWon ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-1.5">
                            {homeId ? (
                              <div className="relative w-5 h-5 shrink-0">
                                <Image
                                  src={`https://cdn.nba.com/logos/nba/${homeId}/primary/L/logo.svg`}
                                  alt={homeAbbr}
                                  fill
                                />
                              </div>
                            ) : <div className="w-5 h-5 shrink-0" />}
                            <span className={`text-xs font-semibold ${homeWon ? "text-primary" : "text-secondary"}`}>{homeAbbr}</span>
                          </div>
                          <span className={`text-xs font-bold tabular-nums ${homeWon ? "text-primary" : "text-secondary"}`}>
                            {homePts ?? "–"}
                          </span>
                        </div>

                        <p className={`text-[10px] mt-2 text-center font-semibold ${won ? "text-green-400" : "text-red-400"}`}>
                          {won ? "W" : "L"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Log */}
      {activeTab === "Game Log" && (
        <div>
          {games.length > 0 ? (
            <GameLog games={games} />
          ) : (
            <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary">
              No recent games available
            </div>
          )}
        </div>
      )}

      {/* Shot Chart */}
      {activeTab === "Shot Chart" && (
        <div className="bg-card rounded-md border border-edge p-6">
          <ShotsFilter
            apiUrl={API_URL}
            initialTeamId={teamId}
            players={roster.map((p: { playerId: number; playerName: string }) => ({
              id: p.playerId,
              full_name: p.playerName,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function TeamPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      <div className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-700 rounded-md shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-10 bg-zinc-700 rounded w-1/2 mx-auto sm:mx-0" />
          <div className="h-6 bg-zinc-700 rounded w-1/3 mx-auto sm:mx-0" />
          <div className="flex gap-3 mt-4 justify-center sm:justify-start">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-zinc-700 rounded w-24" />)}
          </div>
        </div>
      </div>
      <div className="flex gap-4 border-b border-edge pb-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-zinc-700 rounded w-24" />)}
      </div>
      <div className="flex gap-6">
        <div className="w-64 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-zinc-700 rounded" />)}
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-zinc-700 rounded" />)}
          </div>
          <div className="h-24 bg-zinc-700 rounded" />
        </div>
      </div>
    </div>
  );
}
