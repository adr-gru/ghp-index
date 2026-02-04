import TeamCard from "@/components/TeamCard";
import NavBar from "@/components/NavBar";
import Header from "@/components/Header";

export const metadata = {
  title: "NFL Teams | GHP-Index",
};

export default async function NflPage() {

  //const response = await fetch("http://localhost:8000/api/teams");
  //const teams = await response.json();

  return (
    <div>
      <Header />
      <NavBar />

      {/* Main content area */}
       <main className="p-6">
        <h1 className="text-xl mb-4">Coming soon...</h1>
        <div className="grid grid-cols-3 gap-4">
           
        </div>
      </main>

    </div>
  );
}