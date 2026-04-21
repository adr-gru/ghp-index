"use client";

import { useEffect, useState } from "react";
import TeamCard from "@/components/TeamCard";
import PlayerSearch from "@/components/PlayerSearch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Tab = "Teams" | "Players";

export default function NbaPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Teams");

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
      setError(
        err.name === "AbortError" ? "Request timed out" : "Failed to load teams"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <div className="h-8 bg-zinc-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-zinc-700 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-700 rounded animate-pulse"></div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-card rounded-md border border-edge p-6 text-center space-y-4">
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">NBA</h1>
          <p className="text-secondary text-sm mt-1">{teams.length} teams · 2024–25 season</p>
        </div>
        <div className="sm:ml-auto w-full sm:w-72">
          <PlayerSearch />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-edge mb-6">
        {(["Teams", "Players"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Teams Grid */}
      {activeTab === "Teams" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {teams.map(
            (team: { id: number; full_name: string; abbreviation: string }) => (
              <TeamCard
                key={team.id}
                id={team.id}
                full_name={team.full_name}
                abbreviation={team.abbreviation}
              />
            )
          )}
        </div>
      )}

      {/* Players Search */}
      {activeTab === "Players" && (
        <div className="max-w-lg">
          <p className="text-secondary text-sm mb-4">
            Search for any current or historical NBA player.
          </p>
          <PlayerSearch />
        </div>
      )}
    </main>
  );
}
