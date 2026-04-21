import Link from "next/link";
import TeamCard from "@/components/TeamCard";
import DashboardStandings from "@/components/DashboardStandings";
import DashboardLeaders from "@/components/DashboardLeaders";
import RecentGamesBar from "@/components/RecentGamesBar";
import DashboardScoreboard from "@/components/DashboardScoreboard";

export const metadata = {
  title: "Dashboard | GHP-Index",
};

const LEAGUES = [
  { name: "NBA", slug: "nba", active: true },
  { name: "NFL", slug: "nfl", active: false },
  { name: "MLB", slug: "mlb", active: false },
  { name: "NHL", slug: "nhl", active: false },
];

export default async function Home() {
  const API = process.env.API_URL;

  const [teamsRes, standingsRes, ptsRes, rebRes, astRes, recentRes] =
    await Promise.allSettled([
      fetch(`${API}/api/teams`, { next: { revalidate: 3600 } }),
      fetch(`${API}/api/standings`, { next: { revalidate: 300 } }),
      fetch(`${API}/api/leaders?stat=PTS`, { next: { revalidate: 3600 } }),
      fetch(`${API}/api/leaders?stat=REB`, { next: { revalidate: 3600 } }),
      fetch(`${API}/api/leaders?stat=AST`, { next: { revalidate: 3600 } }),
      fetch(`${API}/api/games/recent?limit=15`, { next: { revalidate: 300 } }),
    ]);

  const teams =
    teamsRes.status === "fulfilled" && teamsRes.value.ok
      ? await teamsRes.value.json()
      : [];

  const standings =
    standingsRes.status === "fulfilled" && standingsRes.value.ok
      ? await standingsRes.value.json()
      : null;

  const ptsData =
    ptsRes.status === "fulfilled" && ptsRes.value.ok
      ? await ptsRes.value.json()
      : null;

  const rebData =
    rebRes.status === "fulfilled" && rebRes.value.ok
      ? await rebRes.value.json()
      : null;

  const astData =
    astRes.status === "fulfilled" && astRes.value.ok
      ? await astRes.value.json()
      : null;

  const recentData =
    recentRes.status === "fulfilled" && recentRes.value.ok
      ? await recentRes.value.json()
      : null;

  const recentGames = recentData?.games ?? [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* League Hub */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Leagues
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LEAGUES.map((league) => (
            <Link
              key={league.slug}
              href={`/${league.slug}`}
              className={`relative flex items-center justify-between px-5 py-4 rounded-md border transition-colors ${
                league.active
                  ? "bg-card border-edge hover:border-accent"
                  : "bg-base border-card opacity-50 pointer-events-none"
              }`}
            >
              <span className="text-xl font-bold text-primary">{league.name}</span>
              {!league.active && (
                <span className="text-[10px] text-muted font-medium">Soon</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Scoreboard — client component with date navigation */}
      <DashboardScoreboard />

      {/* Recent Results */}
      {recentGames.length > 0 && <RecentGamesBar games={recentGames} />}

      {/* Leaders + Standings side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card border border-edge rounded-md p-4">
          {ptsData && rebData && astData ? (
            <DashboardLeaders pts={ptsData} reb={rebData} ast={astData} />
          ) : (
            <p className="text-secondary text-sm">Leaders unavailable.</p>
          )}
        </section>

        <section className="bg-card border border-edge rounded-md p-4">
          {standings ? (
            <DashboardStandings east={standings.east} west={standings.west} />
          ) : (
            <p className="text-secondary text-sm">Standings unavailable.</p>
          )}
        </section>
      </div>

      {/* NBA Teams grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
            NBA Teams
          </h2>
          <Link href="/nba" className="text-xs text-accent hover:underline">
            View all →
          </Link>
        </div>
        {teams.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {teams.map(
              (team: { id: number; full_name: string; abbreviation: string }) => (
                <TeamCard
                  key={team.id}
                  id={team.id}
                  full_name={team.full_name}
                  abbreviation={team.abbreviation}
                />
              )
            )}
          </div>
        ) : (
          <p className="text-secondary text-sm">Teams unavailable.</p>
        )}
      </section>
    </main>
  );
}
