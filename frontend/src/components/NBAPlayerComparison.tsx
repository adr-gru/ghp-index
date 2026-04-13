"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Player {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
}

interface PlayerStats {
  gp: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  min: number;
}

interface PlayerComparisonProps {
  currentPlayerId: number;
  currentPlayerName: string;
  apiUrl: string;
}

export default function NBAPlayerComparison({
  currentPlayerId,
  currentPlayerName,
  apiUrl
}: PlayerComparisonProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentPlayerStats, setCurrentPlayerStats] = useState<PlayerStats | null>(null);
  const [comparePlayerStats, setComparePlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all players for search
  useEffect(() => {
    fetch(`${apiUrl}/api/players`)
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error("Failed to fetch players:", err));
  }, [apiUrl]);

  // Fetch current player stats
  useEffect(() => {
    fetchPlayerStats(currentPlayerId).then(stats => setCurrentPlayerStats(stats));
  }, [currentPlayerId]);

  // Fetch selected player stats
  useEffect(() => {
    if (selectedPlayer) {
      setLoading(true);
      fetchPlayerStats(selectedPlayer.id).then(stats => {
        setComparePlayerStats(stats);
        setLoading(false);
      });
    }
  }, [selectedPlayer]);

  const fetchPlayerStats = async (playerId: number): Promise<PlayerStats | null> => {
    try {
      const res = await fetch(`${apiUrl}/api/players/${playerId}/career/`);
      const data = await res.json();
      // Use the last row of resultSets[0] which contains complete career totals
      const regularSeasonData = data.info.resultSets[0];
      const totalsData = regularSeasonData.rowSet[regularSeasonData.rowSet.length - 1];

      const gp = totalsData[6];
      return {
        gp,
        min: parseFloat(totalsData[8]) / gp,
        pts: parseFloat(totalsData[26]) / gp,
        reb: parseFloat(totalsData[20]) / gp,
        ast: parseFloat(totalsData[21]) / gp,
        stl: parseFloat(totalsData[22]) / gp,
        blk: parseFloat(totalsData[23]) / gp,
        tov: parseFloat(totalsData[24]) / gp,
        fgPct: parseFloat(totalsData[11]),
        fg3Pct: parseFloat(totalsData[14]),
        ftPct: parseFloat(totalsData[17]),
      };
    } catch (err) {
      console.error("Failed to fetch player stats:", err);
      return null;
    }
  };

  const filteredPlayers = players
    .filter(p =>
      p.id !== currentPlayerId &&
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 10);

  const StatRow = ({
    label,
    stat1,
    stat2,
    format = (v: number) => v.toFixed(1),
    reverseComparison = false
  }: {
    label: string;
    stat1: number;
    stat2: number;
    format?: (v: number) => string;
    reverseComparison?: boolean;
  }) => {
    const better1 = reverseComparison ? stat1 < stat2 : stat1 > stat2;
    const better2 = reverseComparison ? stat2 < stat1 : stat2 > stat1;

    return (
      <tr className="border-b border-edge/60">
        <td className={`px-4 py-3 text-right font-semibold ${better1 ? "text-green-400" : "text-primary"}`}>
          {format(stat1)}
        </td>
        <td className="px-4 py-3 text-center text-secondary text-sm">{label}</td>
        <td className={`px-4 py-3 text-left font-semibold ${better2 ? "text-green-400" : "text-primary"}`}>
          {format(stat2)}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-card border border-edge rounded-md p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Compare With Another Player</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-edge rounded text-white placeholder-zinc-400 focus:outline-none focus:border-accent"
          />
          {searchTerm && filteredPlayers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-edge rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => {
                    setSelectedPlayer(player);
                    setSearchTerm("");
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors"
                >
                  {player.full_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedPlayer && currentPlayerStats && comparePlayerStats && !loading ? (
        <div className="bg-card border border-edge rounded-md overflow-hidden">
          {/* Player Headers */}
          <div className="grid grid-cols-3 bg-zinc-800 border-b border-edge">
            <div className="p-6 text-center border-r border-edge">
              <div className="relative w-24 h-24 mx-auto mb-3 overflow-hidden rounded-full">
                <Image
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${currentPlayerId}.png`}
                  alt={currentPlayerName}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="font-bold text-white">{currentPlayerName}</div>
              <div className="text-xs text-secondary mt-1">{currentPlayerStats.gp} Career Games</div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-2xl font-bold text-accent">VS</div>
            </div>
            <div className="p-6 text-center border-l border-edge">
              <div className="relative w-24 h-24 mx-auto mb-3 overflow-hidden rounded-full">
                <Image
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${selectedPlayer.id}.png`}
                  alt={selectedPlayer.full_name}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="font-bold text-white">{selectedPlayer.full_name}</div>
              <div className="text-xs text-secondary mt-1">{comparePlayerStats.gp} Career Games</div>
            </div>
          </div>

          {/* Stats Comparison */}
          <table className="w-full text-sm">
            <tbody>
              <StatRow label="PPG" stat1={currentPlayerStats.pts} stat2={comparePlayerStats.pts} />
              <StatRow label="RPG" stat1={currentPlayerStats.reb} stat2={comparePlayerStats.reb} />
              <StatRow label="APG" stat1={currentPlayerStats.ast} stat2={comparePlayerStats.ast} />
              <StatRow label="SPG" stat1={currentPlayerStats.stl} stat2={comparePlayerStats.stl} />
              <StatRow label="BPG" stat1={currentPlayerStats.blk} stat2={comparePlayerStats.blk} />
              <StatRow label="TOV" stat1={currentPlayerStats.tov} stat2={comparePlayerStats.tov} reverseComparison />
              <StatRow label="MPG" stat1={currentPlayerStats.min} stat2={comparePlayerStats.min} />
              <StatRow
                label="FG%"
                stat1={currentPlayerStats.fgPct}
                stat2={comparePlayerStats.fgPct}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
              <StatRow
                label="3P%"
                stat1={currentPlayerStats.fg3Pct}
                stat2={comparePlayerStats.fg3Pct}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
              <StatRow
                label="FT%"
                stat1={currentPlayerStats.ftPct}
                stat2={comparePlayerStats.ftPct}
                format={(v) => `${(v * 100).toFixed(1)}%`}
              />
            </tbody>
          </table>
        </div>
      ) : selectedPlayer && loading ? (
        <div className="text-center py-8 text-secondary">Loading comparison...</div>
      ) : (
        <div className="text-center py-8 text-secondary">Select a player to compare</div>
      )}
    </div>
  );
}