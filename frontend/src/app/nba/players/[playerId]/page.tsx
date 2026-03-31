import Image from "next/image";


export async function generateMetadata({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const response = await fetch(`http://localhost:8000/api/players/${playerId}`);
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

  const response = await fetch(`http://localhost:8000/api/players/${playerId}`);
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Player Hero */}
      <div className="bg-white rounded-2xl border border-[#93BFB7]/40 shadow-sm p-8 flex items-start gap-8">
        <div className="bg-[#93BFB7]/20 rounded-xl overflow-hidden shrink-0">
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
          <h1 className="text-4xl font-bold text-[#2D3E40] tracking-tight">{name}</h1>
          <div className="flex gap-3 mt-4">
            <div className="bg-[#E4F2E7]/60 rounded-lg px-4 py-2 border border-[#93BFB7]/40">
              <p className="text-xs text-[#97A6A0] uppercase tracking-wider font-semibold">Team</p>
              <p className="text-lg font-bold text-[#2D3E40] mt-0.5">{team}</p>
            </div>
            <div className="bg-[#E4F2E7]/60 rounded-lg px-4 py-2 border border-[#93BFB7]/40">
              <p className="text-xs text-[#97A6A0] uppercase tracking-wider font-semibold">Height</p>
              <p className="text-lg font-bold text-[#2D3E40] mt-0.5">{height}</p>
            </div>
            <div className="bg-[#E4F2E7]/60 rounded-lg px-4 py-2 border border-[#93BFB7]/40">
              <p className="text-xs text-[#97A6A0] uppercase tracking-wider font-semibold">Weight</p>
              <p className="text-lg font-bold text-[#2D3E40] mt-0.5">{weight} lbs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Games */}
      <div>
        <h2 className="text-xl font-bold text-[#2D3E40] mb-4">Last Games</h2>
      </div>
    </div>
  );
}
