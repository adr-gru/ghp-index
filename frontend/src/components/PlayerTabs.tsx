"use client";

import { useState } from "react";
import PlayerGameLog from "@/components/PlayerGameLog";
import NBAPlayerProjection from "@/components/NBAPlayerProjection";
import ShotsFilter from "@/components/ShotsFilter";
import PlayerCareer from "@/components/PlayerCareer";
import NBAPlayerComparison from "@/components/NBAPlayerComparison";

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
  playerName,
  teamColor,
}: {
  stats: PlayerStats[];
  projection: ProjectionData;
  playerId: number;
  teamId: number;
  apiUrl: string;
  playerName: string;
  teamColor: string;
}) {
  const [activeTab, setActiveTab] = useState("Last Games");

  return (
    <div>
      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-edge mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors shrink-0
              ${activeTab === tab
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-primary"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Last Games" && <PlayerGameLog stats={stats} teamColor={teamColor} />}
      {activeTab === "Projections" && <NBAPlayerProjection projection={projection} teamColor={teamColor} />}
      {activeTab === "Shots" && (
        <ShotsFilter apiUrl={apiUrl} initialPlayerId={String(playerId)} initialTeamId={String(teamId)} />
      )}
      {activeTab === "Career" && <PlayerCareer playerId={playerId} apiUrl={apiUrl} />}
      {activeTab === "Compare" && (
        <NBAPlayerComparison
          currentPlayerId={playerId}
          currentPlayerName={playerName}
          apiUrl={apiUrl}
        />
      )}
    </div>
  );
}
