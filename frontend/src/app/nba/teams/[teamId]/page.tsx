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

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [team, setTeam] = useState<any>(null);
  const [gamelog, setGamelog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch team data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const teamResponse = await fetch(`${API_URL}/api/teams/${teamId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!teamResponse.ok) {
        throw new Error(`Failed to fetch team data: ${teamResponse.status}`);
      }

      const teamData = await teamResponse.json();
      setTeam(teamData);

      // Fetch gamelog (non-blocking)
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
        // Don't fail the whole page if game log fails
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching team data:", err);
      setError(err.name === "AbortError" ? "Request timed out. The NBA API is slow." : "Failed to load team data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  if (loading) {
    return <TeamPageSkeleton />;
  }

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

  const teamInfo = team.info.resultSets[0].rowSet.map((team: string[]) => ({
    teamId: team[0],
    seasonYear: team[1],
    city: team[2],
    teamName: team[3],
    teamAbr: team[4],
    conference: team[5],
    teamDivision: team[6],
    teamCode: team[7],
    teamSlug: team[8],
    wins: team[9],
    losses: team[10],
    PCT: team[11],
    conferenceRank: team[12],
    divisionRank: team[13],
    minYear: team[14],
    maxYear: team[15],
  }));

  const teamRanks = team.info.resultSets[1].rowSet.map((team: string[]) => ({
    leagueId: team[0],
    seasonId: team[1],
    teamId: team[2],
    pointRank: team[3],
    pointsPerGame: team[4],
    reboundRank: team[5],
    reboundsPerGame: team[6],
    assistRank: team[7],
    assistsPerGame: team[8],
    opponentsPointRank: team[9],
    opponentsPointsPerGame: team[10],
  }));

  const computed = team.computed_stats ?? null;
  const { pointsPerGame, reboundsPerGame, assistsPerGame } = teamRanks[0] ?? {
    pointsPerGame: computed?.ppg ?? "—",
    reboundsPerGame: computed?.rpg ?? "—",
    assistsPerGame: computed?.apg ?? "—",
  };
  const { city, teamName, wins, losses, teamAbr, conference, teamDivision, divisionRank, conferenceRank, minYear } = teamInfo[0] ?? {};
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* Team Hero */}
      <div className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8" style={{ borderTopColor: teamColor }}>
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
          <Image
            src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`}
            alt="Team Logo"
            fill
          />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">{city} {teamName}</h1>
          <p className="text-secondary font-medium mt-1">{record} · {teamAbr} · {conference}</p>
          <div className="flex gap-3 mt-4 justify-center sm:justify-start">
            <TeamInfoNote title="Points" info={pointsPerGame} teamColor={teamColor} />
            <TeamInfoNote title="Assists" info={assistsPerGame} teamColor={teamColor} />
            <TeamInfoNote title="Rebounds" info={reboundsPerGame} teamColor={teamColor} />
          </div>
        </div>
        <div className="hidden sm:block h-40 w-px sm:ml-auto" style={{ backgroundColor: teamColor, opacity: 0.4 }}></div>
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
            <dt className="text-secondary">Since</dt>
            <dd className="text-primary">{minYear}</dd>
          </div>
        </dl>
      </div>

      {/* Roster + Game Log */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div>
          <h2 className="text-xl font-bold text-primary mb-4">Roster</h2>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto h-[380px] pr-1">
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
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-primary mb-4">Last Games</h2>
          {games.length > 0 ? (
            <GameLog games={games} />
          ) : (
            <div className="bg-card border border-edge rounded-md p-6 text-center text-secondary">
              No recent games available
            </div>
          )}
        </div>
      </div>

      {/* Shot Chart */}
      <div className="bg-card rounded-md border border-edge p-6">
        <h2 className="text-xl font-bold text-primary mb-6">Shot Chart</h2>
        <ShotsFilter
          apiUrl={API_URL}
          initialTeamId={teamId}
          players={roster.map((p: { playerId: number; playerName: string }) => ({
            id: p.playerId,
            full_name: p.playerName,
          }))}
        />
      </div>
    </div>
  );
}

function TeamPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-700 rounded-md shrink-0"></div>
        <div className="flex-1 space-y-3 w-full">
          <div className="h-10 bg-zinc-700 rounded w-1/2 mx-auto sm:mx-0"></div>
          <div className="h-6 bg-zinc-700 rounded w-1/3 mx-auto sm:mx-0"></div>
          <div className="flex gap-3 mt-4 justify-center sm:justify-start">
            <div className="h-16 bg-zinc-700 rounded w-24"></div>
            <div className="h-16 bg-zinc-700 rounded w-24"></div>
            <div className="h-16 bg-zinc-700 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Roster + Games Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <div className="h-8 bg-zinc-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-zinc-700 rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="h-8 bg-zinc-700 rounded w-32 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
