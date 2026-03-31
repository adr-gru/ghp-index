import Link from "next/link";
import Image from "next/image";

interface PlayerCardValues {
  id: number;
  fullName: string;
  position: string;
  playerNumber: number;
}

export default function PlayerCard({ id, fullName, playerNumber, position }: PlayerCardValues) {
  return (
    <Link
      href={`/nba/players/${id}`}
      className="bg-white rounded-xl border border-[#93BFB7]/40 shadow-sm p-3 hover:shadow-md hover:border-[#93BFB7] transition-all w-44">
      <div className="bg-[#93BFB7]/20 rounded-lg overflow-hidden mb-3">
        <div className="relative w-full h-28">
          <Image
            src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`}
            alt={`${fullName} headshot`}
            fill
            className="object-cover object-top"
          />
        </div>
      </div>
      <p className="font-semibold text-[#2D3E40] text-sm leading-tight">{fullName}</p>
      <p className="text-xs text-[#97A6A0] mt-0.5">#{playerNumber} · {position}</p>
    </Link>
  );
}
