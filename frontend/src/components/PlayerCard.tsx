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
      className="bg-card rounded-md border border-edge p-3 hover:border-accent transition-colors w-44">
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
      <p className="font-semibold text-primary text-sm leading-tight">{fullName}</p>
      <p className="text-xs text-secondary mt-0.5">#{playerNumber} · {position}</p>
    </Link>
  );
}
