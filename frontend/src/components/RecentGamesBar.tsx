import Image from "next/image";

interface RecentGame {
  game_id: string;
  game_date: string;
  home_team_id: number;
  home_abbr: string;
  home_pts: number;
  away_team_id: number;
  away_abbr: string;
  away_pts: number;
}

interface Props {
  games: RecentGame[];
}

function formatDate(dateStr: string) {
  // dateStr is "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RecentGamesBar({ games }: Props) {
  if (!games.length) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
        Recent Results
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {games.map((game) => {
          const homeWon = game.home_pts > game.away_pts;
          return (
            <div
              key={game.game_id}
              className="shrink-0 bg-card border border-edge rounded-md px-3 py-2.5 w-[130px]"
            >
              <p className="text-[10px] text-muted text-center mb-2">
                {formatDate(game.game_date)}
              </p>

              {/* Away */}
              <div className={`flex items-center justify-between mb-1.5 ${homeWon ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-5 h-5 shrink-0">
                    <Image
                      src={`https://cdn.nba.com/logos/nba/${game.away_team_id}/primary/L/logo.svg`}
                      alt={game.away_abbr}
                      fill
                    />
                  </div>
                  <span className={`text-xs font-semibold ${!homeWon ? "text-primary" : "text-secondary"}`}>
                    {game.away_abbr}
                  </span>
                </div>
                <span className={`text-xs font-bold tabular-nums ${!homeWon ? "text-primary" : "text-secondary"}`}>
                  {game.away_pts}
                </span>
              </div>

              {/* Home */}
              <div className={`flex items-center justify-between ${!homeWon ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-5 h-5 shrink-0">
                    <Image
                      src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/primary/L/logo.svg`}
                      alt={game.home_abbr}
                      fill
                    />
                  </div>
                  <span className={`text-xs font-semibold ${homeWon ? "text-primary" : "text-secondary"}`}>
                    {game.home_abbr}
                  </span>
                </div>
                <span className={`text-xs font-bold tabular-nums ${homeWon ? "text-primary" : "text-secondary"}`}>
                  {game.home_pts}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
