"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LeaderEntry {
  rank: number;
  player_id: number;
  player: string;
  team: string;
  gp: number;
  value: number;
}

interface LeaderSet {
  leaders: LeaderEntry[];
  stat: string;
}

interface Props {
  pts: LeaderSet;
  reb: LeaderSet;
  ast: LeaderSet;
}

const TABS = [
  { key: "pts", label: "PPG" },
  { key: "reb", label: "RPG" },
  { key: "ast", label: "APG" },
] as const;

type TabKey = "pts" | "reb" | "ast";

export default function DashboardLeaders({ pts, reb, ast }: Props) {
  const [tab, setTab] = useState<TabKey>("pts");
  const data = { pts, reb, ast }[tab];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">League Leaders</h2>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                tab === t.key
                  ? "bg-accent text-base"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="space-y-1">
        {data.leaders.map((entry) => (
          <li key={entry.player_id}>
            <Link
              href={`/nba/players/${entry.player_id}`}
              className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-edge transition-colors group"
            >
              <span className="text-xs text-muted w-4 text-right shrink-0">{entry.rank}</span>
              <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden bg-card">
                <Image
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${entry.player_id}.png`}
                  alt={entry.player}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-primary text-xs font-medium truncate group-hover:text-accent transition-colors">
                  {entry.player}
                </p>
                <p className="text-muted text-[10px]">{entry.team}</p>
              </div>
              <span className="text-primary font-bold text-sm tabular-nums shrink-0">
                {Number(entry.value).toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
