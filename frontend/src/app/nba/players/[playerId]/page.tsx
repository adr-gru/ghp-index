import Image from "next/image";
import { getTeamColor } from "@/utils/teamColors";
import TeamInfoNote from "@/components/TeamInfoNote";
import PlayerTabs from "@/components/PlayerTabs";


export async function generateMetadata({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const response = await fetch(`${process.env.API_URL}/api/players/${playerId}`);
  const player = await response.json();

  const name = player.info.resultSets[0].rowSet[0][3];


  return {
    title: `${name} | GHP-Index`,
  };

}

interface PlayerPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;

  const response = await fetch(`${process.env.API_URL}/api/players/${playerId}`);
  const player = await response.json();
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

  const [playerlogResponse, projectionResponse] = await Promise.all([
    fetch(`${process.env.API_URL}/api/players/${playerId}/playergamelog/`),
    fetch(`${process.env.API_URL}/api/players/${playerId}/projection/`),
  ]);
  const playerlog = playerlogResponse.ok ? await playerlogResponse.json() : null;
  const projection = projectionResponse.ok ? await projectionResponse.json() : null;
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Player Hero */}
      <div className="bg-card rounded-md border border-edge p-8 flex items-start gap-8" style={{ borderTopColor: teamColor }}>
        <div className="overflow-hidden shrink-0">
          <div className="relative w-40 h-32">
            <Image
              src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`}
              alt="Player Headshot"
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-1">{name}</h1>
          <p className="text-sm text-secondary mb-4">{city} {teamName} · #{jersey} · {position}</p>
          <div className="flex gap-3">
            <TeamInfoNote title="Points" info={points ?? "—"} teamColor={teamColor} />
            <TeamInfoNote title="Assists" info={assists ?? "—"} teamColor={teamColor} />
            <TeamInfoNote title="Rebounds" info={rebounds ?? "—"} teamColor={teamColor} />
          </div>
        </div>
        <div className="h-40 w-px ml-auto" style={{ backgroundColor: teamColor, opacity: 0.4 }}></div>
        <dl className="flex flex-col gap-1.5 text-sm shrink-0">
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
        <PlayerTabs stats={playerLogs} projection={projection} playerId={Number(playerId)} teamId={Number(playerInfo[0].team)} apiUrl={process.env.API_URL!} playerName={name} teamColor={teamColor} />
      </div>
    </div>
  );
}
