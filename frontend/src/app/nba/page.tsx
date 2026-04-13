import TeamCard from "@/components/TeamCard";

export const metadata = {
  title: "NBA Teams | GHP-Index",
};

export default async function NbaPage() {

  const response = await fetch(`${process.env.API_URL}/api/teams`);
  const data = await response.json();

  // Handle if data is not an array (error case)
  const teams = Array.isArray(data) ? data : [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">NBA Teams</h1>
        <p className="text-secondary text-sm mt-1">{teams.length} teams</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {teams.map((team: { id: number; full_name: string; abbreviation: string }) => (
          <TeamCard
            key={team.id}
            id={team.id}
            full_name={team.full_name}
            abbreviation={team.abbreviation}
          />
        ))}
      </div>
    </main>
  );
}
