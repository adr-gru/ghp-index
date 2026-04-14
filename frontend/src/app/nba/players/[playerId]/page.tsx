"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getTeamColor } from "@/utils/teamColors";
import TeamInfoNote from "@/components/TeamInfoNote";
import PlayerTabs from "@/components/PlayerTabs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;
  const [player, setPlayer] = useState<any>(null);
  const [playerlog, setPlayerlog] = useState<any>(null);
  const [projection, setProjection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch player info with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const playerResponse = await fetch(`${API_URL}/api/players/${playerId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!playerResponse.ok) {
        throw new Error(`Failed to fetch player data: ${playerResponse.status}`);
      }

      const playerData = await playerResponse.json();
      setPlayer(playerData);

      // Fetch game logs and projections in parallel (non-blocking)
      try {
        const [playerlogResponse, projectionResponse] = await Promise.all([
          fetch(`${API_URL}/api/players/${playerId}/playergamelog/`, {
            signal: AbortSignal.timeout(20000),
          }).catch(() => null),
          fetch(`${API_URL}/api/players/${playerId}/projection/`, {
            signal: AbortSignal.timeout(20000),
          }).catch(() => null),
        ]);

        if (playerlogResponse?.ok) {
          const playerlogData = await playerlogResponse.json();
          setPlayerlog(playerlogData);
        }

        if (projectionResponse?.ok) {
          const projectionData = await projectionResponse.json();
          setProjection(projectionData);
        }
      } catch (err) {
        console.error("Failed to fetch player stats:", err);
        // Don't fail the whole page if stats fail
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching player data:", err);
      setError(err.name === "AbortError" ? "Request timed out. The NBA API is slow." : "Failed to load player data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [playerId]);

  if (loading) {
    return <PlayerPageSkeleton />;
  }

  if (error || !player) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load player data</h1>
          <p className="text-secondary">{error || "Unknown error occurred"}</p>
          <button
            onClick={fetchPlayerData}
            className="px-6 py-2 bg-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const playerInfo = player.info.resultSets[0].rowSet.map((player: string[]) => ({
    personId: player[0],
    firstName: player[1],
    lastName: player[2],
    name: player[3],
    birthday: player[7],
    school: player[8],
    country: player[9],
    height: player[11],
    weight: player[12],
    seasonExp: player[13],
    jersey: player[14],
    position: player[15],
    rosterStatus: player[16],
    teamId: player[17],
    team: player[18],
    teamName: player[19],
    city: player[22],
    fromYear: player[23],
    toYear: player[24],
    draftYear: player[29],
    draftRound: player[30],
    draftNumber: player[31],
  }));

  const playerHeadlineStats = player.info.resultSets[1].rowSet.map((player: string[]) => ({
    points: player[3],
    assists: player[4],
    rebounds: player[5],
  }));

  const { name, birthday, school, country, teamName, city, height, weight, jersey, position, rosterStatus, draftYear } = playerInfo[0];
  const teamColor = getTeamColor(playerInfo[0].team);

  const playerLogs = (playerlog?.info.resultSets[0].rowSet ?? []).map((game: string[]) => ({
    playerStatsDate: game[3],
    matchup: game[4],
    winLoss: game[5],
    minutes: game[6],
    fieldGoalsMade: game[7],
    fieldGoalsAttempted: game[8],
    fieldGoalPercentage: game[9],
    fieldGoalThreePointsMade: game[10],
    fieldGoalThreeAttempted: game[11],
    fieldGoalThreePercentage: game[12],
    freeThrowsMade: game[13],
    freeThrowsAttempted: game[14],
    freeThrowPercentage: game[15],
    offensiveRebounds: game[16],
    defensiveRebounds: game[17],
    rebounds: game[18],
    assists: game[19],
    steals: game[20],
    blocks: game[21],
    turnovers: game[22],
    personalFouls: game[23],
    points: game[24],
    plusMinus: game[25],
  }));

  const { points, assists, rebounds } = playerHeadlineStats[0] ?? {
    points: null,
    assists: null,
    rebounds: null,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* Player Hero */}
      <div className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8" style={{ borderTopColor: teamColor }}>
        <div className="overflow-hidden shrink-0">
          <div className="relative w-32 h-24 sm:w-40 sm:h-32">
            <Image
              src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`}
              alt="Player Headshot"
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-1">{name}</h1>
          <p className="text-sm text-secondary mb-4">{city} {teamName} · #{jersey} · {position}</p>
          <div className="flex gap-3 justify-center sm:justify-start">
            <TeamInfoNote title="Points" info={points ?? "—"} teamColor={teamColor} />
            <TeamInfoNote title="Assists" info={assists ?? "—"} teamColor={teamColor} />
            <TeamInfoNote title="Rebounds" info={rebounds ?? "—"} teamColor={teamColor} />
          </div>
        </div>
        <div className="hidden sm:block h-40 w-px sm:ml-auto" style={{ backgroundColor: teamColor, opacity: 0.4 }}></div>
        <dl className="grid grid-cols-2 sm:flex sm:flex-col gap-x-6 gap-y-1.5 text-sm shrink-0 w-full sm:w-auto">
          <div className="flex gap-2">
            <dt className="text-secondary">Birthdate</dt>
            <dd className="text-primary">{birthday?.split("T")[0] ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Birthplace</dt>
            <dd className="text-primary">{country}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">School</dt>
            <dd className="text-primary">{school}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Height</dt>
            <dd className="text-primary">{height}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Weight</dt>
            <dd className="text-primary">{weight} lbs</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Draft Year</dt>
            <dd className="text-primary">{draftYear}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-secondary">Status</dt>
            <dd className="text-primary">{rosterStatus}</dd>
          </div>
        </dl>
      </div>

      <div>
        <PlayerTabs
          stats={playerLogs}
          projection={projection}
          playerId={Number(playerId)}
          teamId={Number(playerInfo[0].team)}
          apiUrl={API_URL}
          playerName={name}
          teamColor={teamColor}
        />
      </div>
    </div>
  );
}

function PlayerPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-card rounded-md border border-edge p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="w-32 h-24 sm:w-40 sm:h-32 bg-zinc-700 rounded-md shrink-0"></div>
        <div className="flex-1 space-y-3 w-full">
          <div className="h-10 bg-zinc-700 rounded w-1/2 mx-auto sm:mx-0"></div>
          <div className="h-6 bg-zinc-700 rounded w-1/3 mx-auto sm:mx-0"></div>
          <div className="flex gap-3 mt-4 justify-center sm:justify-start">
            <div className="h-16 bg-zinc-700 rounded w-24"></div>
            <div className="h-16 bg-zinc-700 rounded w-24"></div>
            <div className="h-16 bg-zinc-700 rounded w-24"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 w-full sm:w-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-zinc-700 rounded w-32"></div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-edge pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-zinc-700 rounded w-24"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-zinc-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
