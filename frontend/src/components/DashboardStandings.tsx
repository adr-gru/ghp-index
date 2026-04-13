"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface StandingEntry {
  team_id: number;
  city: string;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  rank: number;
  clinch: string;
  home: string;
  road: string;
  l10: string;
  streak: string;
}

interface Props {
  east: StandingEntry[];
  west: StandingEntry[];
}

export default function DashboardStandings({ east, west }: Props) {
  const [tab, setTab] = useState<"East" | "West">("East");
  const rows = tab === "East" ? east : west;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Standings</h2>
        <div className="flex gap-1">
          {(["East", "West"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                tab === t
                  ? "bg-accent text-base"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted border-b border-edge">
              <th className="text-left pb-2 font-medium w-6">#</th>
              <th className="text-left pb-2 font-medium">Team</th>
              <th className="text-right pb-2 font-medium px-2">W</th>
              <th className="text-right pb-2 font-medium px-2">L</th>
              <th className="text-right pb-2 font-medium px-2">PCT</th>
              <th className="text-right pb-2 font-medium px-2">Home</th>
              <th className="text-right pb-2 font-medium px-2">Away</th>
              <th className="text-right pb-2 font-medium px-2">L10</th>
              <th className="text-right pb-2 font-medium pl-2">Strk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((team, i) => (
              <tr
                key={team.team_id}
                className={`border-b border-card hover:bg-card transition-colors ${
                  i === 5 ? "border-b-2 border-b-accent/40" : ""
                }`}
              >
                <td className="py-1.5 text-muted">{team.rank}</td>
                <td className="py-1.5">
                  <Link
                    href={`/nba/teams/${team.team_id}`}
                    className="flex items-center gap-2 hover:text-accent transition-colors"
                  >
                    <div className="relative w-5 h-5 shrink-0">
                      <Image
                        src={`https://cdn.nba.com/logos/nba/${team.team_id}/primary/L/logo.svg`}
                        alt={team.name}
                        fill
                      />
                    </div>
                    <span className="text-primary font-medium">
                      {team.city} {team.name}
                      {team.clinch ? (
                        <span className="ml-1 text-accent text-[10px]">{team.clinch}</span>
                      ) : null}
                    </span>
                  </Link>
                </td>
                <td className="py-1.5 text-right text-primary font-semibold px-2">{team.wins}</td>
                <td className="py-1.5 text-right text-secondary px-2">{team.losses}</td>
                <td className="py-1.5 text-right text-secondary px-2">{Number(team.pct).toFixed(3)}</td>
                <td className="py-1.5 text-right text-secondary px-2">{team.home}</td>
                <td className="py-1.5 text-right text-secondary px-2">{team.road}</td>
                <td className="py-1.5 text-right text-secondary px-2">{team.l10}</td>
                <td className="py-1.5 text-right pl-2">
                  <span
                    className={
                      team.streak?.startsWith("W")
                        ? "text-green-400"
                        : team.streak?.startsWith("L")
                        ? "text-red-400"
                        : "text-secondary"
                    }
                  >
                    {team.streak}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
