import Link from "next/link";
import Image from "next/image";
import TeamCard from "@/components/TeamCard";
import DashboardStandings from "@/components/DashboardStandings";
import DashboardLeaders from "@/components/DashboardLeaders";
import RecentGamesBar from "@/components/RecentGamesBar";

export const metadata = {
  title: "Dashboard | GHP-Index",
};

const LEAGUES = [
  { name: "NBA", slug: "nba", active: true },
  { name: "NFL", slug: "nfl", active: false },
  { name: "MLB", slug: "mlb", active: false },
  { name: "NHL", slug: "nhl", active: false },
];

interface Game {
  game_id: string;
  status: string;
  home_team_id: number;
  away_team_id: number;
  home_abbr: string | null;
  away_abbr: string | null;
  home_city: string | null;
  away_city: string | null;
  home_pts: number | null;
  away_pts: number | null;
  home_record: string | null;
  away_record: string | null;
}

export default async function Home() {
  const API = process.env.API_URL;

  const [teamsRes, standingsRes, todayRes, ptsRes, rebRes, astRes, recentRes] =
    await Promise.allSettled([
      fetch(`${API}/api/teams`, { next: { revalidate: 3600 } }),
      fetch(`${API}/api/standings`, { next: { revalidate: 300 } }),
      fetch(`${API}/api/games/today`, { next: { revalidate: 60 } }),
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

  const today =
    todayRes.status === "fulfilled" && todayRes.value.ok
      ? await todayRes.value.json()
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

  const games: Game[] = today?.games ?? [];
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

      {/* Scoreboard */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Today&apos;s Games
        </h2>
        {games.length === 0 ? (
          <p className="text-secondary text-sm">No games scheduled today.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => (
              <div
                key={game.game_id}
                className="bg-card border border-edge rounded-md px-4 py-3"
              >
                {/* Away team */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 shrink-0">
                      <Image
                        src={`https://cdn.nba.com/logos/nba/${game.away_team_id}/primary/L/logo.svg`}
                        alt={game.away_abbr ?? ""}
                        fill
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary">{game.away_abbr}</p>
                      <p className="text-[10px] text-muted">{game.away_record}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    {game.away_pts ?? "–"}
                  </span>
                </div>

                {/* Home team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 shrink-0">
                      <Image
                        src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/primary/L/logo.svg`}
                        alt={game.home_abbr ?? ""}
                        fill
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary">{game.home_abbr}</p>
                      <p className="text-[10px] text-muted">{game.home_record}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    {game.home_pts ?? "–"}
                  </span>
                </div>

                <p className="text-[10px] text-accent mt-2 text-center font-medium">
                  {game.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

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
          <Link
            href="/nba"
            className="text-xs text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        {teams.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {teams.map((team: { id: number; full_name: string; abbreviation: string }) => (
              <TeamCard
                key={team.id}
                id={team.id}
                full_name={team.full_name}
                abbreviation={team.abbreviation}
              />
            ))}
          </div>
        ) : (
          <p className="text-secondary text-sm">Teams unavailable.</p>
        )}
      </section>
    </main>
  );
}
