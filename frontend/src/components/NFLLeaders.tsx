"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LeaderEntry {
  athlete_id: string;
  display_name: string;
  headshot: string;
  team_id: string;
  team_abbr: string;
  value: number;
  display_value: string;
}

interface LeaderCategory {
  name: string;
  display_name: string;
  leaders: LeaderEntry[];
}

interface Props {
  leaders: Record<string, LeaderCategory>;
}

const TAB_ORDER = [
  { key: "passingYards",      label: "Pass Yds" },
  { key: "rushingYards",      label: "Rush Yds" },
  { key: "receivingYards",    label: "Rec Yds" },
  { key: "passingTouchdowns", label: "Pass TDs" },
  { key: "rushingTouchdowns", label: "Rush TDs" },
];

export default function NFLLeaders({ leaders }: Props) {
  const availableTabs = TAB_ORDER.filter((t) => leaders[t.key]?.leaders?.length);
  const [tab, setTab] = useState(availableTabs[0]?.key ?? "");

  const data = leaders[tab];

  if (!data) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          League Leaders
        </h2>
        <p className="text-secondary text-sm">Leaders not available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
          League Leaders
        </h2>
        <div className="flex gap-1 flex-wrap">
          {availableTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                tab === t.key
                  ? "bg-accent text-white"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="space-y-1">
        {data.leaders.map((entry, i) => (
          <li key={entry.athlete_id}>
            <Link
              href={`/nfl/players/${entry.athlete_id}`}
              className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-edge transition-colors group"
            >
              <span className="text-xs text-muted w-4 text-right shrink-0">{i + 1}</span>
              <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden bg-zinc-100">
                {entry.headshot ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={entry.headshot}
                    alt={entry.display_name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-primary text-xs font-medium truncate group-hover:text-accent transition-colors">
                  {entry.display_name}
                </p>
                <p className="text-muted text-[10px]">{entry.team_abbr}</p>
              </div>
              <span className="text-primary font-bold text-sm tabular-nums shrink-0">
                {entry.display_value || entry.value}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
