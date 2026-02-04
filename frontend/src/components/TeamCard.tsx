import Link from "next/link";

interface TeamCardValues {
  id: number;
  full_name: string;
  abbreviation: string;
}

export default function TeamCard({ id, full_name, abbreviation }: TeamCardValues) {
  return (
    <Link
      href={`/nba/teams/${id}`}
      className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700">
      {/* Icon would go here */}
      <h2>{full_name}</h2>
      <h3>{abbreviation}</h3>
      <p>{id}</p>
    </Link>
  );

}