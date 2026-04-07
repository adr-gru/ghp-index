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
      className="bg-[#1e293b] rounded-md border border-[#334155] p-4 hover:border-[#38bdf8] transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <Image
            src={`https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`}
            alt={`${full_name} logo`}
            fill
          />
        </div>
        <div>
          <p className="font-semibold text-[#f1f5f9] leading-tight">{full_name}</p>
          <p className="text-xs text-[#94a3b8] font-medium mt-0.5">{abbreviation}</p>
        </div>
      </div>
    </Link>
  );
}
