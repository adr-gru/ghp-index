export default async function NbaPage() {

  const response = await fetch("http://localhost:8000/api/teams");
  const teams = await response.json();

  return (
    <div>
      <header className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">GHP-Index</h1>
      </header>

      {/* Main content area */}
      <nav className="flex gap-4 p-4 border-b border-zinc-800">

      </nav>

      {/* Main content area */}
      <main className="p-6">
        <h1>Teams</h1>
        <ul>
          {teams.map((team) => (
            <li key={team.id}>{team.full_name}</li>
          ))}
        </ul>
      </main>

    </div>
  );
}