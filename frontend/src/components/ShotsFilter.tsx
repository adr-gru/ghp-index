"use client"

import { useState, useEffect } from "react"
import ShotChart from "@/components/ShotChart"

interface Player {
  id: number
  full_name: string
}

interface Team {
  id: number
  full_name: string
  abbreviation: string
}

interface Shot {
  x: number
  y: number
  made: boolean
  player: string
  team_name: string
  action_type: string
  shot_type: string
  zone: string
  distance: number
}

interface ShotsFilterProps {
  apiUrl: string
  // Omit a list to lock that dimension (dropdown hidden, initial ID used)
  players?: Player[]
  teams?: Team[]
  initialPlayerId?: string
  initialTeamId?: string
}

export default function ShotsFilter({
  apiUrl,
  players,
  teams,
  initialPlayerId = "",
  initialTeamId = "",
}: ShotsFilterProps) {
  const [playerId, setPlayerId] = useState(initialPlayerId)
  const [teamId, setTeamId] = useState(initialTeamId)
  const [context, setContext] = useState("FGA")
  const [shots, setShots] = useState<Shot[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!playerId && !teamId) return

    setLoading(true)
    setError("")
    setShots(null)

    const params = new URLSearchParams()
    if (playerId) params.set("player_id", playerId)
    if (teamId) params.set("team_id", teamId)
    params.set("context", context)

    fetch(`${apiUrl}/api/shots?${params}`)
      .then((res) => {
        if (!res.ok) return res.json().then((b) => { throw new Error(b.detail ?? "Failed to fetch shots") })
        return res.json()
      })
      .then((data) => setShots(data.shots))
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setLoading(false))
  }, [playerId, teamId, context, apiUrl])

  const made = shots?.filter((s) => s.made).length ?? 0
  const missed = shots ? shots.length - made : 0

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Player dropdown — only shown when list is provided */}
        {players && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#94a3b8]">Player (optional)</label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] text-sm rounded px-3 py-2 min-w-[220px] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="">— All Players —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Shot type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#94a3b8]">Shot Type</label>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] text-sm rounded px-3 py-2 focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="FGA">FGA — All field goals</option>
            <option value="FG3A">FG3A — 3-point attempts</option>
            <option value="FGM">FGM — Made field goals</option>
            <option value="FG3M">FG3M — Made 3-pointers</option>
            <option value="FTA">FTA — Free throw attempts</option>
            <option value="DUNK_FGA">DUNK_FGA — Dunk attempts</option>
            <option value="DUNK_FGM">DUNK_FGM — Made dunks</option>
            <option value="BLKA">BLKA — Blocked attempts</option>
          </select>
        </div>

        {/* Team dropdown — only shown when list is provided */}
        {teams && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#94a3b8]">Team (optional)</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] text-sm rounded px-3 py-2 min-w-[180px] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="">— All Teams —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && <p className="text-sm text-[#94a3b8] self-end pb-2">Loading…</p>}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Summary */}
      {shots && (
        <div className="flex gap-4 text-sm">
          <span className="text-[#94a3b8]">
            Total: <span className="text-[#f1f5f9] font-medium">{shots.length}</span>
          </span>
          <span className="text-[#94a3b8]">
            Made: <span className="text-green-400 font-medium">{made}</span>
          </span>
          <span className="text-[#94a3b8]">
            Missed: <span className="text-red-400 font-medium">{missed}</span>
          </span>
          {shots.length > 0 && (
            <span className="text-[#94a3b8]">
              FG%:{" "}
              <span className="text-[#f1f5f9] font-medium">
                {((made / shots.length) * 100).toFixed(1)}%
              </span>
            </span>
          )}
        </div>
      )}

      {shots && shots.length > 0 && <ShotChart shots={shots} />}

      {shots && shots.length === 0 && (
        <p className="text-sm text-[#94a3b8]">No shots found for this selection.</p>
      )}
    </div>
  )
}
