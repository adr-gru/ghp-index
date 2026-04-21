"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Player {
  id: number;
  full_name: string;
  is_active: boolean;
}

export default function PlayerSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/players`)
      .then((r) => r.json())
      .then((data) => setAllPlayers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const results =
    query.length >= 2
      ? allPlayers
          .filter((p) => p.full_name.toLowerCase().includes(query.toLowerCase()))
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
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search players..."
          className="w-full pl-9 pr-4 py-2 bg-card border border-edge rounded-md text-primary text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
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
              href={`/nba/players/${player.id}`}
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-edge/60 transition-colors"
            >
              <div className="relative w-8 h-6 shrink-0 overflow-hidden rounded-sm bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`}
                  alt=""
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-sm text-primary flex-1">{player.full_name}</span>
              {!player.is_active && (
                <span className="text-[10px] text-muted bg-zinc-800 px-1.5 py-0.5 rounded">
                  Inactive
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-edge rounded-md shadow-xl px-4 py-3">
          <p className="text-sm text-muted">No players found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
