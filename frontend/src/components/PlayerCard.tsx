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
      className="bg-[#1e293b] rounded-md border border-[#334155] p-3 hover:border-[#38bdf8] transition-colors w-44">
      <div className="overflow-hidden mb-3">
        <div className="relative w-full h-28">
          <Image
            src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`}
            alt={`${fullName} headshot`}
            fill
            className="object-cover object-top"
          />
        </div>
      </div>
      <p className="font-semibold text-[#f1f5f9] text-sm leading-tight">{fullName}</p>
      <p className="text-xs text-[#94a3b8] mt-0.5">#{playerNumber} · {position}</p>
    </Link>
  );
}
