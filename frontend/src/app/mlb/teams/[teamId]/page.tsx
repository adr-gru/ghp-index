import NavBar from "@/components/NavBar";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;

  // Use the teamId in the URL to fetch that specific team
  const response = await fetch(`${process.env.API_URL}/api/teams/${teamId}`);
  const team = await response.json();

  return (
    <div> 

      <h1>Team: {team.info.resultSets[0].rowSet[0][2]} {team.info.resultSets[0].rowSet[0][3]} {team.info.resultSets[0].rowSet[0][4]} {team.info.resultSets[0].rowSet[0][5]}
      </h1>
    </div>
  );
}
