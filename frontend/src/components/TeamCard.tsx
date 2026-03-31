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
      className="bg-white rounded-xl border border-[#93BFB7]/40 shadow-sm p-4 hover:shadow-md hover:border-[#93BFB7] transition-all">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <Image
            src={`https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`}
            alt={`${full_name} logo`}
            fill
          />
        </div>
        <div>
          <p className="font-semibold text-[#2D3E40] leading-tight">{full_name}</p>
          <p className="text-xs text-[#97A6A0] font-medium tracking-wider mt-0.5">{abbreviation}</p>
        </div>
      </div>
    </Link>
  );
}
