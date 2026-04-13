"use client";

import { useEffect, useState } from "react";
import TeamCard from "@/components/TeamCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NbaPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_URL}/api/teams`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }

      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching teams:", err);
      setError(err.name === "AbortError" ? "Request timed out" : "Failed to load teams");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="h-8 bg-zinc-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-zinc-700 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-700 rounded animate-pulse"></div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-card rounded-md border border-edge p-8 text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-primary">Unable to load teams</h1>
          <p className="text-secondary">{error}</p>
          <button
            onClick={fetchTeams}
            className="px-6 py-2 bg-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">NBA Teams</h1>
        <p className="text-secondary text-sm mt-1">{teams.length} teams</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {teams.map((team: { id: number; full_name: string; abbreviation: string }) => (
          <TeamCard
            key={team.id}
            id={team.id}
            full_name={team.full_name}
            abbreviation={team.abbreviation}
          />
        ))}
      </div>
    </main>
  );
}
