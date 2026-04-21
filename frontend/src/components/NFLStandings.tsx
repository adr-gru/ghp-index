"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const DIVISIONS = ["East", "North", "South", "West"] as const;

interface NFLTeam {
  id: string;
  display_name: string;
  abbreviation: string;
  logo: string;
  color: string;
  wins: number;
  losses: number;
  record: string;
}

interface Props {
  standings: Record<string, Record<string, NFLTeam[]>>;
}

export default function NFLStandings({ standings }: Props) {
  const [conf, setConf] = useState<"AFC" | "NFC">("AFC");
  const confData = standings[conf] ?? {};

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Standings
        </h2>
        <div className="flex gap-1">
          {(["AFC", "NFC"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setConf(c)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                conf === c
                  ? "bg-accent text-white"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {DIVISIONS.map((div) => {
          const teams = confData[div] ?? [];
          if (teams.length === 0) return null;
          return (
            <div key={div}>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">
                {conf} {div}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted border-b border-edge">
                      <th className="text-left pb-1.5 font-medium">Team</th>
                      <th className="text-right pb-1.5 font-medium px-2">W</th>
                      <th className="text-right pb-1.5 font-medium px-2">L</th>
                      <th className="text-right pb-1.5 font-medium pl-2">PCT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, i) => {
                      const pct = (team.wins + team.losses) > 0
                        ? (team.wins / (team.wins + team.losses)).toFixed(3)
                        : ".000";
                      return (
                        <tr
                          key={team.id}
                          className="border-b border-card hover:bg-base transition-colors"
                          style={i === 0 ? { borderLeftColor: team.color, borderLeftWidth: 2 } : {}}
                        >
                          <td className="py-1.5">
                            <Link
                              href={`/nfl/teams/${team.id}`}
                              className="flex items-center gap-2 hover:text-accent transition-colors"
                            >
                              {team.logo && (
                                <div className="relative w-5 h-5 shrink-0">
                                  <Image
                                    src={team.logo}
                                    alt={team.abbreviation}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className={`text-primary font-medium ${i === 0 ? "font-semibold" : ""}`}>
                                {team.display_name}
                              </span>
                            </Link>
                          </td>
                          <td className="py-1.5 text-right font-semibold text-primary px-2">{team.wins}</td>
                          <td className="py-1.5 text-right text-secondary px-2">{team.losses}</td>
                          <td className="py-1.5 text-right text-secondary pl-2">{pct}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
