export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">GHP-Index</h1>
      </header>

      {/* Navigation */}
      <nav className="flex gap-4 p-4 border-b border-zinc-800">
        <a href="/games" className="hover:text-orange-500">Games</a>
        <a href="/players" className="hover:text-orange-500">Players</a>
        <a href="/teams" className="hover:text-blue-500">Teams</a>
      </nav>

      {/* Main content area */}
      <main className="p-6">
        <h2 className="text-xl">NBA Dashboard</h2>
        <p className="text-zinc-400">Coming soon...</p>
      </main>
    </div>
  );
}