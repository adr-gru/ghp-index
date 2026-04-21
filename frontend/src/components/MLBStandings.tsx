"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StandingTeam {
  team_id: number;
  name: string;
  abbreviation: string;
  wins: number;
  losses: number;
  pct: string;
  gb: string;
  streak: string;
  last10: string;
  home: string;
  away: string;
}

interface Division {
  division: string;
  league: string;
  teams: StandingTeam[];
}

function shortDivision(div: string): string {
  return div.replace("American League", "AL").replace("National League", "NL");
}

function DivisionTable({ division }: { division: Division }) {
  const label = shortDivision(division.division);
  const isAL = division.league === "American League" || division.division.startsWith("American");

  return (
    <div className="bg-card border border-edge rounded-md overflow-hidden">
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottomWidth: 1, borderBottomColor: "var(--edge)" }}
      >
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
          style={{ backgroundColor: isAL ? "#003087" : "#C41E3A" }}
        >
          {isAL ? "AL" : "NL"}
        </span>
        <h3 className="text-sm font-semibold text-primary">{label}</h3>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted border-b border-edge">
            <th className="text-left px-4 py-1.5 font-medium w-full">Team</th>
            <th className="text-right px-2 py-1.5 font-medium tabular-nums whitespace-nowrap">W</th>
            <th className="text-right px-2 py-1.5 font-medium tabular-nums whitespace-nowrap">L</th>
            <th className="text-right px-2 py-1.5 font-medium tabular-nums whitespace-nowrap">PCT</th>
            <th className="text-right px-3 py-1.5 font-medium tabular-nums whitespace-nowrap">GB</th>
            <th className="text-right px-3 py-1.5 font-medium whitespace-nowrap hidden sm:table-cell">L10</th>
            <th className="text-right px-3 py-1.5 font-medium whitespace-nowrap hidden sm:table-cell">Strk</th>
          </tr>
        </thead>
        <tbody>
          {division.teams.map((team, i) => (
            <tr
              key={team.team_id}
              className="border-b border-edge last:border-0 hover:bg-base transition-colors"
            >
              <td className="px-4 py-2">
                <Link href={`/mlb/teams/${team.team_id}`} className="flex items-center gap-2 group">
                  {i === 0 && (
                    <span className="text-[9px] font-bold text-green-600 uppercase tracking-wide w-6 shrink-0">1st</span>
                  )}
                  {i > 0 && <span className="w-6 shrink-0" />}
                  <span className="font-medium text-primary group-hover:text-accent transition-colors truncate">
                    {team.name}
                  </span>
                </Link>
              </td>
              <td className="text-right px-2 py-2 tabular-nums text-primary font-semibold">{team.wins}</td>
              <td className="text-right px-2 py-2 tabular-nums text-secondary">{team.losses}</td>
              <td className="text-right px-2 py-2 tabular-nums text-secondary">{team.pct}</td>
              <td className="text-right px-3 py-2 tabular-nums text-muted">{team.gb === "0.0" ? "—" : team.gb}</td>
              <td className="text-right px-3 py-2 tabular-nums text-secondary hidden sm:table-cell">{team.last10}</td>
              <td
                className={`text-right px-3 py-2 font-semibold hidden sm:table-cell ${
                  team.streak.startsWith("W") ? "text-green-600" : "text-red-500"
                }`}
              >
                {team.streak}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MLBStandings() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(`${API_URL}/api/mlb/standings`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      setDivisions(data.divisions ?? []);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setError(e.name === "AbortError" ? "Request timed out" : "Failed to load standings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStandings(); }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-zinc-700 rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-edge rounded-md p-6 text-center space-y-3">
        <p className="text-secondary">{error}</p>
        <button
          onClick={fetchStandings}
          className="px-4 py-1.5 bg-accent text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const alDivisions = divisions.filter(
    (d) => d.league === "American League" || d.division.startsWith("American")
  );
  const nlDivisions = divisions.filter(
    (d) => d.league === "National League" || d.division.startsWith("National")
  );

  return (
    <div className="space-y-6">
      {/* AL */}
      <div>
        <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#003087]" />
          American League
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alDivisions.map((d) => <DivisionTable key={d.division} division={d} />)}
        </div>
      </div>

      {/* NL */}
      <div>
        <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#C41E3A]" />
          National League
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nlDivisions.map((d) => <DivisionTable key={d.division} division={d} />)}
        </div>
      </div>
    </div>
  );
}
