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
      className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700">

      <div className="flex item-center">
        <div className="relative w-35 h-35">
          <Image
            src={`https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`}
            alt="Team Logo"
            fill
          />
        </div>
        <div className="pl-4">
          <h1 className="text-2xl font-bold">{full_name}</h1>
          <h3>{abbreviation}</h3>
        </div>
      </div>



    </Link>
  );

}