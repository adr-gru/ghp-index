import Link from "next/link";
import Image from "next/image";
import { getMLBTeamColor } from "@/utils/mlbTeamColors";

interface MLBTeamCardProps {
  id: number;
  name: string;
  abbreviation: string;
  division?: string;
}

// Shorten "American League East" → "AL East"
function shortDivision(div: string): string {
  return div.replace("American League", "AL").replace("National League", "NL");
}

export default function MLBTeamCard({ id, name, abbreviation, division }: MLBTeamCardProps) {
  const color = getMLBTeamColor(id);

  return (
    <Link
      href={`/mlb/teams/${id}`}
      className="bg-card rounded-md border border-edge p-4 hover:border-accent transition-colors group"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-11 h-11 shrink-0">
          <Image
            src={`https://www.mlbstatic.com/team-logos/${id}.svg`}
            alt={`${name} logo`}
            fill
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-primary leading-tight truncate text-sm">{name}</p>
          <p className="text-xs text-secondary font-medium mt-0.5">{abbreviation}</p>
        </div>
        {division && (
          <span className="text-[10px] text-muted font-medium shrink-0 hidden sm:block">
            {shortDivision(division)}
          </span>
        )}
      </div>
    </Link>
  );
}
