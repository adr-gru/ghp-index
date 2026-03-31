import Image from "next/image";
import { findStateAbr } from "@/utils/states";


export async function generateMetadata({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const response = await fetch(`http://localhost:8000/api/commonplayerinfo?player_id=${playerId}`);
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

  const response = await fetch(`http://localhost:8000/api/commonplayerinfo?player_id=${playerId}`);
  const player = await response.json();
  const name = player.info.resultSets[0].rowSet[0][3];
  const birthday = player.info.resultSets[0].rowSet[0][3];
  const school = player.info.resultSets[0].rowSet[0][8];
  const country = player.info.resultSets[0].rowSet[0][9];
  const team = player.info.resultSets[0].rowSet[0][18];
  const teamAbr = player.info.resultSets[0].rowSet[0][19];
  const city = player.info.resultSets[0].rowSet[0][21];
  const height = player.info.resultSets[0].rowSet[0][11];
  const weight = player.info.resultSets[0].rowSet[0][12];

  return (
    <div>
      <div className="flex">
        <div className="relative w-110 h-90">
          <Image
            src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`}
            alt="Player Headshot"
            fill
          />
        </div>
        <div className="pl-4 pt-4">
          <h1 className="text-6xl">{name}</h1>
          <div className="text-xl">
            <p>
            
            </p>
          </div>
        </div>
      </div>
      <div className="flex">

        <h2 className="p-4 text-4xl mb-2">Last Games</h2>
      </div>
    </div>
  );
}
