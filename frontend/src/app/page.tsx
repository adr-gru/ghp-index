export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">GHP-Index</h1>
      </header>

      {/* Navigation */}
      <nav className="flex gap-4 p-4 border-b border-zinc-800">
        <a href="/games" className="hover:text-orange-500">NBA</a>
        <a href="/games" className="hover:text-orange-500">NFL</a>
        <a href="/games" className="hover:text-orange-500">MLB</a>
        <a href="/games" className="hover:text-orange-500">NHL</a> 
        <a href="/games" className="hover:text-orange-500">Players</a> 
      </nav>

      {/* Main content area */}
      <main className="p-6">
        <h2 className="text-xl">Dashboard</h2>
        <p className="text-zinc-400">Coming soon...</p>
      </main>
    </div>
  );
}