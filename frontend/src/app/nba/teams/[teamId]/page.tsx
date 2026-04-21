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

type TeamTab = "Overview" | "Roster" | "Game Log" | "Shot Chart";
const TABS: TeamTab[] = ["Overview", "Roster", "Game Log", "Shot Chart"];

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
          const gamelogData = await gamelogResponse.json();
          setGamelog(gamelogData);
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
    teamCode: t[7],
    teamSlug: t[8],
    wins: t[9],
    losses: t[10],
    PCT: t[11],
    conferenceRank: t[12],
    divisionRank: t[13],
    minYear: t[14],
    maxYear: t[15],
  }));

  const teamRanks = team.info.resultSets[1].rowSet.map((t: string[]) => ({
    pointRank: t[3],
    pointsPerGame: t[4],
    reboundRank: t[5],
    reboundsPerGame: t[6],
    assistRank: t[7],
    assistsPerGame: t[8],
    opponentsPointRank: t[9],
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
    city,
    teamName,
    wins,
    losses,
    teamAbr,
    conference,
    teamDivision,
    divisionRank,
    conferenceRank,
    minYear,
    PCT,
  } = teamInfo[0] ?? {};

  const teamColor = getTeamColor(teamId);
  const record = `${wins}–${losses}`;
  const location = `${city}, ${findStateAbr(city)}`;

  const roster = team.roster.resultSets[0].rowSet.map((player: string[]) => ({
    teamId: player[0],
    season: player[1],
    leagueId: player[2],
    playerName: player[3],
    playerSlug: player[4],
    playerNumber: player[6],
    position: player[7],
    height: player[8],
    weight: player[9],
    birthDate: player[10],
    age: player[11],
    exp: player[12],
    school: player[13],
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

  // Stats computed from game log for overview
  const n = games.length;
  const gameavg = (key: keyof typeof games[0]) =>
    n > 0
      ? (
          games.reduce((sum: number, g: any) => sum + parseFloat(g[key] || "0"), 0) / n
        ).toFixed(1)
      : "—";

  const winStreak = (() => {
    let streak = 0;
    for (const g of games) {
      if (g.wl === "W") streak++;
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
        <div
          className="hidden sm:block h-40 w-px sm:ml-auto"
          style={{ backgroundColor: teamColor, opacity: 0.4 }}
        />
        <dl className="grid grid-cols-2 sm:flex sm:flex-col gap-x-6 gap-y-1.5 text-sm shrink-0 w-full sm:w-auto">
          <div className="flex gap-2">
            <dt className="text-secondary">Location</dt>
            <dd className="text-primary">{location}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Division</dt>
            <dd className="text-primary">{teamDivision}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Div. Rank</dt>
            <dd className="text-primary">{divisionRank}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Conf. Rank</dt>
            <dd className="text-primary">{conferenceRank}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Win %</dt>
            <dd className="text-primary">{PCT ? (parseFloat(PCT) * 100).toFixed(1) + "%" : "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Since</dt>
            <dd className="text-primary">{minYear}</dd>
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
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Win Streak", value: winStreak > 0 ? `W${winStreak}` : "—", accent: winStreak >= 3 },
              { label: "Last 10", value: `${l10W}–${10 - l10W}` },
              { label: "Home Record", value: `${games.filter((g: any) => !g.matchup.includes("@")).filter((g: any) => g.wl === "W").length}–${games.filter((g: any) => !g.matchup.includes("@")).filter((g: any) => g.wl === "L").length}` },
              { label: "Away Record", value: `${games.filter((g: any) => g.matchup.includes("@")).filter((g: any) => g.wl === "W").length}–${games.filter((g: any) => g.matchup.includes("@")).filter((g: any) => g.wl === "L").length}` },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-card border border-edge rounded-md p-4 text-center">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-2xl font-bold ${accent ? "text-green-400" : "text-primary"}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Season averages */}
          {n > 0 && (
            <div className="bg-card border border-edge rounded-md p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">Season Averages (from game log)</h3>
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

          {/* Recent game results mini */}
          <div className="bg-card border border-edge rounded-md p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Recent Results</h3>
            <div className="flex flex-wrap gap-2">
              {games.slice(0, 10).map((g: any, i: number) => (
                <div
                  key={i}
                  title={`${g.matchup} · ${g.pts}`}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${
                    g.wl === "W"
                      ? "bg-green-500/20 text-green-400 border border-green-500/40"
                      : "bg-red-500/20 text-red-400 border border-red-500/40"
                  }`}
                >
                  {g.wl}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roster */}
      {activeTab === "Roster" && (
        <div>
          <p className="text-secondary text-sm mb-4">{roster.length} players</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {roster.map(
              (player: {
                playerId: number;
                playerName: string;
                position: string;
                playerNumber: number;
              }) => (
                <PlayerCard
                  key={player.playerId}
                  id={player.playerId}
                  fullName={player.playerName}
                  position={player.position}
                  playerNumber={player.playerNumber}
                />
              )
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-700 rounded w-24" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-4 border-b border-edge pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-zinc-700 rounded w-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-zinc-700 rounded" />
        ))}
      </div>
    </div>
  );
}
