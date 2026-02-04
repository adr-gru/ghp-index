import NavBar from "@/components/NavBar";
import Header from "@/components/Header";

// Dynamic metadata - fetches team name for the title
export async function generateMetadata({ params }: TeamPageProps) {
  const { teamId } = await params;
  const response = await fetch(`http://localhost:8000/api/teams/${teamId}`);
  const team = await response.json();
  
  const city = team.info.resultSets[0].rowSet[0][2];
  const name = team.info.resultSets[0].rowSet[0][3];
  
  return {
    title: `${city} ${name} | GHP-Index`,
  };
}

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
      <Header />
 
      <NavBar />

      <h1>Team: {team.info.resultSets[0].rowSet[0][2]} {team.info.resultSets[0].rowSet[0][3]} {team.info.resultSets[0].rowSet[0][4]} {team.info.resultSets[0].rowSet[0][5]}
      </h1>
    </div>
  );
}
