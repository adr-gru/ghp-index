import Image from "next/image";
import { findStateAbr } from "@/utils/states";
import PlayerCard from "@/components/PlayerCard";
import GameLog from "@/components/GameLog";
import TeamInfoNote from "@/components/TeamInfoNote";


export async function generateMetadata({ params }: TeamPageProps) {
  const { teamId } = await params;
  const response = await fetch(`${process.env.API_URL}/api/teams/${teamId}`);
  const team = await response.json();

  const city = team.info.resultSets[0].rowSet[0][2];
  const name = team.info.resultSets[0].rowSet[0][3];

  return {
    title: `${city} ${name} | GHP-Index`,
  };
}

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;

  const response = await fetch(`${process.env.API_URL}/api/teams/${teamId}`);
  const team = await response.json();
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
  }))

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
  }))

  const { pointsPerGame, reboundsPerGame, assistsPerGame } = teamRanks[0];
  const { city, teamName, wins, losses, teamAbr, conference, teamDivision, divisionRank, conferenceRank, PCT, minYear } = teamInfo[0];
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
  }))

  const gamelogResponse = await fetch(`${process.env.API_URL}/api/${teamId}/teamgamelog/`);
  const gamelog = await gamelogResponse.json();
  const games = gamelog.info.resultSets[0].rowSet.map((game: string[]) => ({
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Team Hero */}
      <div className="bg-[#1e293b] rounded-md border border-[#334155] p-8 flex items-center gap-8">
        <div className="relative w-32 h-32 shrink-0">
          <Image
            src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`}
            alt="Team Logo"
            fill
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[#f1f5f9] tracking-tight">{city} {teamName}</h1>
          <p className="text-[#94a3b8] font-medium mt-1">{record} · {teamAbr} · {conference}</p>
          <div className="flex gap-3 mt-4">
            <TeamInfoNote title="Points" info={pointsPerGame} />
            <TeamInfoNote title="Assists" info={assistsPerGame} />
            <TeamInfoNote title="Rebounds" info={reboundsPerGame} />
          </div>
        </div>
        <div className="h-40 w-px bg-[#334155] ml-auto"></div>
        <dl className="flex flex-col gap-1.5 text-sm shrink-0">
          <div className="flex gap-2">
            <dt className="text-[#94a3b8]">Location</dt>
            <dd className="text-[#f1f5f9]">{location}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-[#94a3b8]">Division</dt>
            <dd className="text-[#f1f5f9]">{teamDivision}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-[#94a3b8]">Div. Rank</dt>
            <dd className="text-[#f1f5f9]">{divisionRank}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-[#94a3b8]">Conf. Rank</dt>
            <dd className="text-[#f1f5f9]">{conferenceRank}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-[#94a3b8]">Since</dt>
            <dd className="text-[#f1f5f9]">{minYear}</dd>
          </div>
        </dl>
      </div>

      {/* Roster */}
      <div>
        <h2 className="text-xl font-bold text-[#f1f5f9] mb-4">Roster</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-3 w-max pb-2">
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
      </div>

      {/* Game Log */}
      <div>
        <h2 className="text-xl font-bold text-[#f1f5f9] mb-4">Last Games</h2>
        <GameLog games={games} />
      </div>
    </div>
  );
}
