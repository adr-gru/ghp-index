"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NFLPlayer {
  id: string;
  display_name: string;
  position: string;
  jersey: string;
  team_abbr: string;
  team_name: string;
  team_color: string;
}

export default function NFLPlayerSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [allPlayers, setAllPlayers] = useState<NFLPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/nfl/players`, { signal: AbortSignal.timeout(60000) })
      .then((r) => r.json())
      .then((data) => setAllPlayers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const results =
    query.length >= 2
      ? allPlayers
          .filter((p) => p.display_name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 12)
      : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? "Loading players…" : "Search NFL players…"}
          disabled={loading}
          className="w-full pl-9 pr-4 py-2 bg-card border border-edge rounded-md text-primary text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors disabled:opacity-60"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
          >
            ×
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-edge rounded-md shadow-xl overflow-hidden">
          {results.map((player) => (
            <Link
              key={player.id}
              href={`/nfl/players/${player.id}`}
              onClick={() => { setQuery(""); setOpen(false); }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-edge/60 transition-colors"
            >
              {/* Color dot for team */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: player.team_color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-primary font-medium truncate">{player.display_name}</p>
                <p className="text-xs text-muted">{player.team_abbr} · {player.position}</p>
              </div>
              {player.jersey && (
                <span className="text-xs text-muted font-mono shrink-0">#{player.jersey}</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-edge rounded-md shadow-xl px-4 py-3">
          <p className="text-sm text-muted">No players found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
