import NavBar from "@/components/NavBar";
import Header from "@/components/Header";
import Image from "next/image";
import { findStateAbr } from "@/utils/states";
import PlayerCard from "@/components/PlayerCard";


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
  const roster = team.roster.resultSets[0]

  return (
    <div>
      <Header />

      <NavBar />

      <div className="flex pt-4 pl-4">
        <div className="relative w-100 h-100">
          <Image
            src={`https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`}
            alt="Team Logo"
            fill
          />
        </div>
        <div className="pl-4 pt-4">
          <h1 className="text-6xl">{city} {teamName} ({teamAbr})</h1>
          <div className="text-xl">
            <p>Current Record (W-L): {wins} - {losses}</p>
            <p>Top Performer: </p>
            <p>Location: {city}, {findStateAbr(city)}</p>
            <p>Conference: {conference}</p></div>
        </div>
      </div>
      <div className="flex">
        <div>
          <h2 className="p-4 text-4xl mb-2">Players</h2>
          <div className="p-4 grid grid-cols-2 gap-5 w-180">
            {roster.rowSet.map((player) => (
              <PlayerCard
                key={player[14]}
                id={player[14]}
                fullName={player[3]}
                position={player[7]}
                playerNumber={player[6]}
              />
            ))}
          </div>
        </div>
        <h2 className="p-4 text-4xl mb-2">Last Games</h2>
      </div>
    </div>
  );
}
