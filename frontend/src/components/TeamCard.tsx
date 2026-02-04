interface TeamCardValues {
  id: number;
  full_name: string;
  abbreviation: string;
}

export default function TeamCard({ id, full_name, abbreviation }: TeamCardValues) {
  return (
    <a
      href={`nba/teams/${id}`}
      className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700">
      {/* Icon would go here */}
      <h3>{full_name}</h3>
      <p>{abbreviation}</p>
      <p>{id}</p>
    </a>
  );

}