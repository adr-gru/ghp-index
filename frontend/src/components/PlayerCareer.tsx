"use client";

import { useState, useEffect } from "react";

interface SeasonStats {
  seasonId: string;
  teamAbbreviation: string;
  playerAge: number;
  gp: number;
  gs: number;
  min: number;
  fgm: number;
  fga: number;
  fgPct: number;
  fg3m: number;
  fg3a: number;
  fg3Pct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  pts: number;
}

interface CareerTotals {
  gp: number;
  gs: number;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgm: number;
  fga: number;
  fgPct: number;
  fg3m: number;
  fg3a: number;
  fg3Pct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  oreb: number;
  dreb: number;
}

interface PlayerCareerProps {
  playerId: number;
  apiUrl: string;
}

export default function PlayerCareer({ playerId, apiUrl }: PlayerCareerProps) {
  const [careerData, setCareerData] = useState<{
    seasonStats: SeasonStats[];
    careerTotals: CareerTotals;
    playoffStats: SeasonStats[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayoffs, setShowPlayoffs] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/players/${playerId}/career/`)
      .then(res => res.json())
      .then(data => {
        const regularSeasonData = data.info.resultSets[0];
        const playoffData = data.info.resultSets[1];

        const parseSeasonStats = (rowSet: any[]): SeasonStats[] => {
          // Filter out the career totals row (last row) from season stats
          return rowSet.slice(0, -1).map((row: any[]) => ({
            seasonId: row[1],
            teamAbbreviation: row[4],
            playerAge: row[5],
            gp: row[6],
            gs: row[7],
            min: parseFloat(row[8]) || 0,
            fgm: parseFloat(row[9]) || 0,
            fga: parseFloat(row[10]) || 0,
            fgPct: parseFloat(row[11]) || 0,
            fg3m: parseFloat(row[12]) || 0,
            fg3a: parseFloat(row[13]) || 0,
            fg3Pct: parseFloat(row[14]) || 0,
            ftm: parseFloat(row[15]) || 0,
            fta: parseFloat(row[16]) || 0,
            ftPct: parseFloat(row[17]) || 0,
            oreb: parseFloat(row[18]) || 0,
            dreb: parseFloat(row[19]) || 0,
            reb: parseFloat(row[20]) || 0,
            ast: parseFloat(row[21]) || 0,
            stl: parseFloat(row[22]) || 0,
            blk: parseFloat(row[23]) || 0,
            tov: parseFloat(row[24]) || 0,
            pf: parseFloat(row[25]) || 0,
            pts: parseFloat(row[26]) || 0,
          }));
        };

        // Use the last row of regular season data for career totals
        const totalsRow = regularSeasonData.rowSet[regularSeasonData.rowSet.length - 1];
        const totals: CareerTotals = {
          gp: totalsRow[6],
          gs: totalsRow[7],
          min: parseFloat(totalsRow[8]) || 0,
          fgm: parseFloat(totalsRow[9]) || 0,
          fga: parseFloat(totalsRow[10]) || 0,
          fgPct: parseFloat(totalsRow[11]) || 0,
          fg3m: parseFloat(totalsRow[12]) || 0,
          fg3a: parseFloat(totalsRow[13]) || 0,
          fg3Pct: parseFloat(totalsRow[14]) || 0,
          ftm: parseFloat(totalsRow[15]) || 0,
          fta: parseFloat(totalsRow[16]) || 0,
          ftPct: parseFloat(totalsRow[17]) || 0,
          oreb: parseFloat(totalsRow[18]) || 0,
          dreb: parseFloat(totalsRow[19]) || 0,
          reb: parseFloat(totalsRow[20]) || 0,
          ast: parseFloat(totalsRow[21]) || 0,
          stl: parseFloat(totalsRow[22]) || 0,
          blk: parseFloat(totalsRow[23]) || 0,
          tov: parseFloat(totalsRow[24]) || 0,
          pts: parseFloat(totalsRow[26]) || 0,
        };

        setCareerData({
          seasonStats: parseSeasonStats(regularSeasonData.rowSet),
          playoffStats: parseSeasonStats(playoffData.rowSet),
          careerTotals: totals,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch career data:", err);
        setLoading(false);
      });
  }, [apiUrl, playerId]);

  if (loading) {
    return <div className="text-center py-8 text-secondary">Loading career stats...</div>;
  }

  if (!careerData) {
    return <div className="text-center py-8 text-secondary">No career data available</div>;
  }

  const stats = showPlayoffs ? careerData.playoffStats : careerData.seasonStats;
  const displayedStats = expanded ? stats : stats.slice(0, 5);

  // Calculate career highs from season stats (using per-game averages)
  const careerHighs = careerData.seasonStats.reduce((highs, season) => {
    const ppg = season.gp > 0 ? season.pts / season.gp : 0;
    const rpg = season.gp > 0 ? season.reb / season.gp : 0;
    const apg = season.gp > 0 ? season.ast / season.gp : 0;
    const spg = season.gp > 0 ? season.stl / season.gp : 0;
    const bpg = season.gp > 0 ? season.blk / season.gp : 0;

    return {
      pts: Math.max(highs.pts, ppg),
      reb: Math.max(highs.reb, rpg),
      ast: Math.max(highs.ast, apg),
      stl: Math.max(highs.stl, spg),
      blk: Math.max(highs.blk, bpg),
      fgPct: Math.max(highs.fgPct, season.fgPct),
      fg3Pct: Math.max(highs.fg3Pct, season.fg3Pct),
      ftPct: Math.max(highs.ftPct, season.ftPct),
    };
  }, { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, fgPct: 0, fg3Pct: 0, ftPct: 0 });

  // Calculate career averages
  const careerAvgs = {
    ppg: (careerData.careerTotals.pts / careerData.careerTotals.gp).toFixed(1),
    rpg: (careerData.careerTotals.reb / careerData.careerTotals.gp).toFixed(1),
    apg: (careerData.careerTotals.ast / careerData.careerTotals.gp).toFixed(1),
    spg: (careerData.careerTotals.stl / careerData.careerTotals.gp).toFixed(1),
    bpg: (careerData.careerTotals.blk / careerData.careerTotals.gp).toFixed(1),
    fgPct: (careerData.careerTotals.fgPct * 100).toFixed(1),
    fg3Pct: (careerData.careerTotals.fg3Pct * 100).toFixed(1),
    ftPct: (careerData.careerTotals.ftPct * 100).toFixed(1),
  };

  return (
    <div className="space-y-6">
      {/* Career Totals & Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-edge rounded-md p-4 sm:p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Career Totals</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">Games</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerData.careerTotals.gp}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">Points</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerData.careerTotals.pts.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">Rebounds</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerData.careerTotals.reb.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">Assists</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerData.careerTotals.ast.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">Steals</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerData.careerTotals.stl.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">Blocks</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerData.careerTotals.blk.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-edge rounded-md p-4 sm:p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Career Averages</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">PPG</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerAvgs.ppg}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">RPG</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerAvgs.rpg}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">APG</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerAvgs.apg}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">FG%</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerAvgs.fgPct}%</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">3P%</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerAvgs.fg3Pct}%</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wide">FT%</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{careerAvgs.ftPct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Highs */}
      <div className="bg-card border border-edge rounded-md p-4 sm:p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Career Highs (Season Averages)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">Points</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{careerHighs.pts.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">Rebounds</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{careerHighs.reb.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">Assists</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{careerHighs.ast.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">Steals</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{careerHighs.stl.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">Blocks</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{careerHighs.blk.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">FG%</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{(careerHighs.fgPct * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">3P%</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{(careerHighs.fg3Pct * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wide">FT%</div>
            <div className="text-2xl sm:text-3xl font-bold text-accent">{(careerHighs.ftPct * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Season-by-Season Stats */}
      <div className="bg-card rounded-md border border-edge overflow-hidden">
        <div className="px-6 py-4 bg-zinc-800 border-b border-edge flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Season by Season</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPlayoffs(false)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                !showPlayoffs ? "bg-accent text-white" : "text-zinc-300 hover:text-white"
              }`}
            >
              Regular Season
            </button>
            <button
              onClick={() => setShowPlayoffs(true)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                showPlayoffs ? "bg-accent text-white" : "text-zinc-300 hover:text-white"
              }`}
            >
              Playoffs
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="text-sm text-left w-full">
            <thead>
              <tr className="bg-zinc-800 border-b border-edge">
                {["Season", "Team", "Age", "GP", "GS", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TOV", "FG%", "3P%", "FT%"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-zinc-300 whitespace-nowrap uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedStats.map((season, i) => (
                <tr key={i} className="border-b border-edge/60 hover:bg-edge/40 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-primary whitespace-nowrap">{season.seasonId}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.teamAbbreviation}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.playerAge}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.gp}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.gs}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.min.toFixed(1)}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary">{season.pts.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.reb.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.ast.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.stl.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.blk.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-secondary">{season.tov.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-secondary">{(season.fgPct * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-secondary">{(season.fg3Pct * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-secondary">{(season.ftPct * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stats.length > 5 && (
          <div className="px-4 py-3 bg-zinc-800 border-t border-edge">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium text-accent hover:text-blue-400 transition-colors"
            >
              {expanded ? "Show less" : `Show all ${stats.length} Seasons`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
