"use client";

import { useState } from "react";
import PlayerGameLog from "@/components/PlayerGameLog";
import NBAPlayerProjection from "@/components/NBAPlayerProjection";
import ShotsFilter from "@/components/ShotsFilter";

interface PlayerStats {
  playerStatsDate: string;
  matchup: string;
  winLoss: string;
  points: string;
  minutes: string;
  rebounds: string;
  assists: string;
  steals: string;
  blocks: string;
  turnovers: string;
  personalFouls: string;
  plusMinus: string
  fieldGoalsMade: string;
  fieldGoalsAttempted: string;
  fieldGoalPercentage: string;
  fieldGoalThreePointsMade: string;
  fieldGoalThreeAttempted: string;
  fieldGoalThreePercentage: string;
  freeThrowsMade: string;
  freeThrowsAttempted: string;
  freeThrowPercentage: string;
  offensiveRebounds: string;
  defensiveRebounds: string;
}

interface StatProjection {
  projection: number;
  low: number;
  high: number;
  season_avg: number;
  trend: "up" | "down" | "flat";
}

export interface ProjectionData {
  pts: StatProjection;
  reb: StatProjection;
  ast: StatProjection;
  stl: StatProjection;
  blk: StatProjection;
  games_used: number;
}

const tabs = ["Last Games", "Projections", "Shots", "Career", "Compare"];

export default function PlayerTabs({
  stats,
  projection,
  playerId,
  teamId,
  apiUrl,
}: {
  stats: PlayerStats[];
  projection: ProjectionData;
  playerId: number;
  teamId: number;
  apiUrl: string;
}) {
  const [activeTab, setActiveTab] = useState("Last Games");

  return (
    <div>
      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-edge mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors
              ${activeTab === tab
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-primary"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Last Games" && <PlayerGameLog stats={stats} />}
      {activeTab === "Projections" && <NBAPlayerProjection projection={projection} />}
      {activeTab === "Shots" && (
        <ShotsFilter apiUrl={apiUrl} initialPlayerId={String(playerId)} initialTeamId={String(teamId)} />
      )}
      {activeTab === "Career" && <div>Career coming soon</div>}
      {activeTab === "Compare" && <div>Comparisons coming soon</div>}
    </div>
  );
}
