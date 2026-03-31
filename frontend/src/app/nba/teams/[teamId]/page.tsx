import Image from "next/image";
import { findStateAbr } from "@/utils/states";
import PlayerCard from "@/components/PlayerCard";
import GameLog from "@/components/GameLog";


export async function generateMetadata({ params }: TeamPageProps) {
  const { teamId } = await params;
  const response = await fetch(`http://localhost:8000/api/teams/${teamId}`);
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

  const response = await fetch(`http://localhost:8000/api/teams/${teamId}`);
  const team = await response.json();
  const city = team.info.resultSets[0].rowSet[0][2];
  const teamName = team.info.resultSets[0].rowSet[0][3];
  const wins = team.info.resultSets[0].rowSet[0][9];
  const losses = team.info.resultSets[0].rowSet[0][10];
  const teamAbr = team.info.resultSets[0].rowSet[0][4];
  const conference = team.info.resultSets[0].rowSet[0][5];
  const roster = team.roster.resultSets[0].rowSet.map((player: string[]) => ({
    teamId:       player[0],
    season:       player[1],
    leagueId:     player[2],
    playerName:   player[3],
    playerSlug:   player[4],
    playerNumber: player[6],
    position:     player[7],
    height:       player[8],
    weight:       player[9],
    birthDate:    player[10],
    age:          player[11],
    exp:          player[12],
    school:       player[13],
    playerId:     player[14],
  }))

  const gamelogResponse = await fetch(`http://localhost:8000/api/${teamId}/teamgamelog/`);
  const gamelog = await gamelogResponse.json();
  const games = gamelog.info.resultSets[0].rowSet.map((game: string[]) => ({
    teamId:   game[0],
    gameId:   game[1],
    gameDate: game[2],
    matchup:  game[3],
    wl:       game[4],
    w:        game[5],
    l:        game[6],
    wPct:     game[7],
    min:      game[8],
    fgm:      game[9],
    fga:      game[10],
    fgPct:    game[11],
    fg3m:     game[12],
    fg3a:     game[13],
    fg3Pct:   game[14],
    ftm:      game[15],
    fta:      game[16],
    ftPct:    game[17],
    oreb:     game[18],
    dreb:     game[19],
    reb:      game[20],
    ast:      game[21],
    stl:      game[22],
    blk:      game[23],
    tov:      game[24],
    pf:       game[25],
    pts:      game[26],
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Team Hero */}
      <div className="bg-white rounded-2xl border border-[#93BFB7]/40 shadow-sm p-8 flex items-center gap-8">
        <div className="relative w-32 h-32 shrink-0">
          <Image
            src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`}
            alt="Team Logo"
            fill
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[#2D3E40] tracking-tight">{city} {teamName}</h1>
          <p className="text-[#97A6A0] font-medium mt-1">{teamAbr}</p>
          <div className="flex gap-3 mt-4">
            <div className="bg-[#E4F2E7]/60 rounded-lg px-4 py-2 border border-[#93BFB7]/40">
              <p className="text-xs text-[#97A6A0] uppercase tracking-wider font-semibold">Record</p>
              <p className="text-lg font-bold text-[#2D3E40] mt-0.5">{wins}–{losses}</p>
            </div>
            <div className="bg-[#E4F2E7]/60 rounded-lg px-4 py-2 border border-[#93BFB7]/40">
              <p className="text-xs text-[#97A6A0] uppercase tracking-wider font-semibold">Conference</p>
              <p className="text-lg font-bold text-[#2D3E40] mt-0.5">{conference}</p>
            </div>
            <div className="bg-[#E4F2E7]/60 rounded-lg px-4 py-2 border border-[#93BFB7]/40">
              <p className="text-xs text-[#97A6A0] uppercase tracking-wider font-semibold">Location</p>
              <p className="text-lg font-bold text-[#2D3E40] mt-0.5">{city}, {findStateAbr(city)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roster */}
      <div>
        <h2 className="text-xl font-bold text-[#2D3E40] mb-4">Roster</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-3 w-max pb-2">
            {roster.map((player) => (
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
        <h2 className="text-xl font-bold text-[#2D3E40] mb-4">Last Games</h2>
        <GameLog games={games} />
      </div>
    </div>
  );
}
