"use client";

import { useState } from "react";
import PlayerGameLog from "@/components/PlayerGameLog";
import NBAPlayerProjection from "@/components/NBAPlayerProjection";

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

const tabs = ["Last Games", "Projections", "Career"];

export default function PlayerTabs({ stats, projection }: { stats: PlayerStats[]; projection: ProjectionData }) {
  const [activeTab, setActiveTab] = useState("Last Games");

  return (
    <div>
      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-[#334155] mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors
              ${activeTab === tab
                ? "border-b-2 border-[#38bdf8] text-[#38bdf8]"
                : "text-[#94a3b8] hover:text-[#f1f5f9]"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Last Games" && <PlayerGameLog stats={stats} />}
      {activeTab === "Projections" && <NBAPlayerProjection projection={projection} />}
      {activeTab === "Career" && <div>Career coming soon</div>}
    </div>
  );
}
