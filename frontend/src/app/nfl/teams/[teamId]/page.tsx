import NavBar from "@/components/NavBar";
import Header from "@/components/Header";

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
  const city = team.info.resultSets[0].rowSet[0][2];
  const teamName = team.info.resultSets[0].rowSet[0][3];
  const teamAbr = team.info.resultSets[0].rowSet[0][4];
  const conference = team.info.resultSets[0].rowSet[0][5];

  return (
    <div> 

      <h1>whatss: {city} {teamName} {teamAbr} {conference}
      </h1>
    </div>
  );
}
