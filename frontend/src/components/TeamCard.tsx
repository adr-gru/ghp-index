import Link from "next/link";
import Image from "next/image";

interface TeamCardValues {
  id: number;
  full_name: string;
  abbreviation: string;
}

export default function TeamCard({ id, full_name, abbreviation }: TeamCardValues) {
  return (
    <Link
      href={`/nba/teams/${id}`}
      className="bg-card rounded-md border border-edge p-4 hover:border-accent transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <Image
            src={`https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`}
            alt={`${full_name} logo`}
            fill
          />
        </div>
        <div>
          <p className="font-semibold text-primary leading-tight">{full_name}</p>
          <p className="text-xs text-secondary font-medium mt-0.5">{abbreviation}</p>
        </div>
      </div>
    </Link>
  );
}
