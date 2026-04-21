import Link from "next/link";
import Image from "next/image";

interface NFLTeamCardProps {
  id: string;
  display_name: string;
  abbreviation: string;
  logo: string;
  color: string;
  record: string;
  wins: number;
  losses: number;
}

export default function NFLTeamCard({
  id,
  display_name,
  abbreviation,
  logo,
  color,
  record,
}: NFLTeamCardProps) {
  return (
    <Link
      href={`/nfl/teams/${id}`}
      className="bg-card rounded-md border border-edge p-3 hover:border-accent transition-colors flex items-center gap-3 min-w-0 group"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="relative w-9 h-9 shrink-0">
        <Image
          src={logo}
          alt={`${display_name} logo`}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-primary text-sm leading-tight truncate group-hover:text-accent transition-colors">
          {display_name}
        </p>
        <p className="text-xs text-muted font-medium mt-0.5">{record}</p>
      </div>
      <p className="text-xs text-secondary font-mono shrink-0">{abbreviation}</p>
    </Link>
  );
}
