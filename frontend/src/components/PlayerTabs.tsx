"use client";

import { useState } from "react";
import PlayerGameLog from "@/components/PlayerGameLog";
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
const tabs = ["Last Games", "Projections", "Career"];

export default function PlayerTabs({ stats }: { stats: PlayerStats[] }) {
  const [activeTab, setActiveTab] = useState("Last Games");

  return (
    <div>
      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-[#93BFB7]/40 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors 
              ${activeTab === tab 
                ? "border-b-2 border-[#387373] text-[#387373]" 
                : "text-[#97A6A0] hover:text-[#2D3E40]"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Last Games" && <PlayerGameLog stats={stats} />}
      {activeTab === "Projections" && <div>Projections coming soon</div>}
      {activeTab === "Career" && <div>Career coming soon</div>}
    </div>
  );
}
