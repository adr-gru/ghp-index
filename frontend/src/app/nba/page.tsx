import TeamCard from "@/components/TeamCard";
import NavBar from "@/components/NavBar";
import Header from "@/components/Header";

export const metadata = {
  title: "NBA Teams | GHP-Index",
};

export default async function NbaPage() {

  const response = await fetch("http://localhost:8000/api/teams");
  const teams = await response.json();

  return (
    <div>
      <Header />
      <NavBar />

      {/* Main content area */}
       <main className="p-6">
        <h1 className="text-xl mb-4">Teams</h1>
        <div className="grid grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              id={team.id}
              full_name={team.full_name}
              abbreviation={team.abbreviation}
            />
          ))}
        </div>
      </main>

    </div>
  );
}