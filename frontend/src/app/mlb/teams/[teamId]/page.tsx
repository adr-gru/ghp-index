import NavBar from "@/components/NavBar";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;

  // Use the teamId in the URL to fetch that specific team
  const response = await fetch(`http://localhost:8000/api/teams/${teamId}`);
  const team = await response.json();

  return (
    <div>
      <header className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">GHP-Index</h1>
      </header>
 
      <NavBar />

      <h1>Team: {team.info.resultSets[0].rowSet[0][2]} {team.info.resultSets[0].rowSet[0][3]} {team.info.resultSets[0].rowSet[0][4]} {team.info.resultSets[0].rowSet[0][5]}
      </h1>
    </div>
  );
}
