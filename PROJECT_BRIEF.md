# GHP-Index: Sports Statistics Web Application

> **Last Updated:** April 13, 2026
> **Project Owner:** Adrian G. (4th Year CS Student)
> **Purpose:** Portfolio project + skill development

---

## Project Vision

GHP-Index is a web application that aggregates and displays statistics from the four major North American sports leagues (NFL, NBA, MLB, NHL). Users can explore teams, rosters, individual player profiles, and game data. The app aims to eventually incorporate AI-powered analysis, projections, and player comparisons.

**Design Target:** Modern, dark-themed, data-focused — clean access to stats without clutter.

---

## Current Status

### Completed
- [x] Next.js + React 19 + TypeScript + Tailwind CSS 4 project initialized
- [x] Python FastAPI backend with `nba_api` integration
- [x] NBA team listing page — fetches all teams, displays as logo cards
- [x] NBA team detail page — team info, record, conference, division, rankings, PPG/RPG/APG, roster grid, game log
- [x] NBA player detail page — headshot, bio, season averages, game log via `PlayerTabs`
- [x] Reusable components: `Header`, `NavBar`, `TeamCard`, `PlayerCard`, `GameLog`, `PlayerGameLog`, `PlayerTabs`, `TeamInfoNote`
- [x] Dynamic routing: `/nba/teams/[teamId]` and `/nba/players/[playerId]`
- [x] League pages scaffolded: NBA, NFL, MLB, NHL (placeholders)
- [x] Backend endpoints: `/api/teams`, `/api/teams/{id}`, `/api/players/{id}`, `/api/{team_id}/teamgamelog/`, `/api/players/{id}/playergamelog/`
- [x] NBA CDN images working (team logos + player headshots)
- [x] `Header` + `NavBar` moved into `layout.tsx` — no longer duplicated per page
- [x] Complete visual refactor — cohesive dark theme with custom color palette (Slate Noir)
- [x] All hardcoded `localhost:8000` URLs replaced with `process.env.API_URL` via `.env.local`
- [x] nba_api array indices replaced with named mappings throughout team + player pages
- [x] `PlayerTabs` component with Last Games, Projections (stub), Career (stub) tabs
- [x] `/api/players/{id}/projection` endpoint — EWMA + linregress trend for PTS/REB/AST and extended stats
- [x] `NBAPlayerProjection.tsx` — built out with StatCard, trend indicators, projection range
- [x] Roster panel on team page — 2-column scrollable grid sized to match GameLog height
- [x] Dashboard page — league hub cards, scoreboard, league leaders (PPG/RPG/APG tabs), standings (East/West tabs), NBA teams grid
- [x] Backend endpoints: `/api/games/today` (`ScoreboardV2`), `/api/leaders?stat=` (`LeagueLeaders`), `/api/standings` (`LeagueStandingsV3`)
- [x] `DashboardLeaders.tsx` + `DashboardStandings.tsx` — client components with tabbed UI
- [x] Dashboard fetches all data with `Promise.allSettled` — graceful fallback if any endpoint fails
- [x] Team page `teamRanks[0]` null guard — post-season `TeamInfoCommon` returns empty rankings

### In Progress
- [ ] Shot chart heatmap — `ShotChartDetail` endpoint integration (endpoint done, frontend tab in progress)

### Known Issues (Fix Before Moving Forward)
- [x] ~~Hardcoded backend URL~~ — replaced with `process.env.API_URL` via `.env.local`
- [x] ~~Magic array indices~~ — team and player pages now use named mappings
- [ ] **No error handling on team/player pages** — fetch calls crash when backend returns a non-JSON response. Dashboard page is already guarded via `Promise.allSettled`. Team/player pages still need `try/catch` + fallback UI.
- [x] ~~No active link state~~ — NavBar now highlights active route via `usePathname`
- [x] ~~`teamRanks[0]` crash~~ — guarded with `?? {}` fallback; occurs post-season when `TeamInfoCommon` returns empty rankings

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Library | React 19 | Component system, UI state |
| Language | TypeScript | Typed JavaScript |
| Framework | Next.js 16 (App Router) | Routing, server components, project structure |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Backend | FastAPI (Python) | REST API serving NBA data |
| Data Source | `nba_api` | Python library wrapping official NBA stats |
| Database | TBD | |
| AI Features | TBD | OpenAI or local models for projections/breakdowns |

---

## Project Structure

```
ghp-index/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout — Header + NavBar live here
│   │   │   ├── page.tsx                # Dashboard — scoreboard, leaders, standings, team grid
│   │   │   ├── globals.css
│   │   │   ├── nba/
│   │   │   │   ├── page.tsx            # NBA teams listing — WORKING
│   │   │   │   ├── teams/[teamId]/page.tsx    # Team detail + roster + game log + shot chart — WORKING
│   │   │   │   └── players/[playerId]/page.tsx # Player profile + projections + shot chart — WORKING
│   │   │   ├── nfl/page.tsx            # Placeholder
│   │   │   ├── mlb/page.tsx            # Placeholder
│   │   │   ├── nhl/page.tsx            # Placeholder
│   │   │   └── players/page.tsx        # Unused
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── GameLog.tsx             # Expandable game stats table
│   │   │   ├── PlayerGameLog.tsx
│   │   │   ├── PlayerTabs.tsx          # Last Games / Projections / Shot Chart tabs
│   │   │   ├── NBAPlayerProjection.tsx # EWMA + trend projection card
│   │   │   ├── NBAPlayerComparison.tsx
│   │   │   ├── ShotChart.tsx           # SVG court + shot dot heatmap
│   │   │   ├── ShotsFilter.tsx         # Shot chart filter controls
│   │   │   ├── TeamInfoNote.tsx
│   │   │   ├── DashboardLeaders.tsx    # League leaders with PPG/RPG/APG tabs
│   │   │   └── DashboardStandings.tsx  # Standings with East/West tabs
│   │   └── utils/
│   │       └── states.ts               # City → state mapping
│   ├── public/
│   └── package.json
├── backend/
│   ├── main.py                         # FastAPI app
│   └── requirements.txt
├── PROJECT_BRIEF.md
└── LEARNING_NOTES.md
```

---

## Current Sprint

> **Goal:** Add error handling to team/player pages; then move to NBA Games view.

### Sprint Tasks (Priority Order)

**Stability**
- [ ] Add `try/catch` + fallback UI to team page fetch calls
- [ ] Add `try/catch` + fallback UI to player page fetch calls
- [ ] Add `try/except` in FastAPI endpoints to return JSON error responses instead of plain text 500s

**Polish**
- [ ] Add team page link on player page hero (city + team name → `/nba/teams/{teamId}`)

**NBA Games View (next)**
- [ ] Backend: `/api/games/{game_id}/boxscore` endpoint
- [ ] Scores page with game cards linking to box score view


---

## Sprint: Shot Chart Heatmap

> **Goal:** Add a court heatmap to the player page showing shot location frequency and FG% by zone.

### Background

`nba_api` exposes `ShotChartDetail` which returns every shot attempt with `LOC_X`, `LOC_Y`, and made/missed status. This is the same data source the official NBA stats site uses for its shot charts.

### Backend

**New endpoint:** `/api/players/{player_id}/shotchart`

```python
from nba_api.stats.endpoints import shotchartdetail

@app.get("/api/players/{player_id}/shotchart")
def get_shot_chart(player_id: int):
    chart = shotchartdetail.ShotChartDetail(
        player_id=player_id,
        team_id=0,
        context_measure_simple="FGA"
    )
    data = chart.get_dict()
    shots = data["resultSets"][0]
    return {
        "headers": shots["headers"],
        "rows": shots["rowSet"]
    }
```

Key columns returned: `LOC_X`, `LOC_Y`, `SHOT_MADE_FLAG`, `SHOT_ZONE_BASIC`, `SHOT_ZONE_AREA`, `SHOT_DISTANCE`

### Frontend Options

**Option A — Canvas/SVG heatmap (no extra deps)**
- Render shot dots on an SVG court outline
- Color by made (green) / missed (red), or opacity by density
- Court outline is a static SVG asset or drawn with SVG primitives

**Option B — `react-heatmap-grid` or `d3`**
- Bin shots into zones, color by FG%
- More work but looks more like the official NBA chart

**Recommended starting point:** Option A with SVG dots — straightforward, no new library, visually clear.

### Sprint Tasks (Priority Order)

- [ ] Add `/api/players/{player_id}/shotchart` endpoint to `backend/main.py`
- [ ] Create `ShotChart.tsx` — renders court SVG + shot dots from `LOC_X`/`LOC_Y`
- [ ] Add "Shot Chart" tab to `PlayerTabs.tsx`
- [ ] Wire `ShotChart` into the new tab with a fetch from the shotchart endpoint
- [ ] (Stretch) Color zones by FG% instead of individual dots — bin shots by `SHOT_ZONE_BASIC`

---

## Roadmap

> **Strategy:** Finish NBA cleanly before expanding to other leagues.

### Phase 1: Clean Up ✅ (Mostly Done)
1. ~~Move `Header` + `NavBar` into `layout.tsx`~~ ✅
2. Add `.env.local` with `NEXT_PUBLIC_API_URL`
3. Add `try/catch` and fallback UI to all fetch calls
4. Define TypeScript interfaces for nba_api response shapes
5. Fix player page birthday bug
6. Add active link highlighting to NavBar

### Phase 2: NBA Player Pages (Current)
1. Display player stats (season averages, career stats)
2. "Last Games" table — recent game log with stat lines
3. Display team name/link on player page

### Phase 3: NBA Games View
1. Backend endpoint for recent/upcoming games
2. Scores page with game cards
3. Box score view for individual games

### Phase 4: NBA Dashboard ✅
**Completed:**
1. League hub cards — NBA/NFL/MLB/NHL nav cards (NFL/MLB/NHL greyed out, not yet built)
2. NBA team grid — all 30 teams via `/api/teams` + `TeamCard`
3. Scoreboard — today's matchups with scores via `/api/games/today` (`ScoreboardV2`)
4. League leaders — top 10 PPG/RPG/APG (tabbed) via `/api/leaders` (`LeagueLeaders`)
5. Standings — East/West conference table (tabbed) via `/api/standings` (`LeagueStandingsV3`)

**Remaining:**
6. Search across players and teams

### Phase 5: NBA Enhanced Features
1. Player comparison tool (side-by-side stats)
2. Team standings page
3. Season stat leaders

### Phase 6: AI Features (Next Up)
**Player Projections:**
1. Next-game stat projection (pts/reb/ast) based on recent game log trends
2. Fantasy-style scoring projection output
3. Surface projections on player page via existing `NBAPlayerProjection.tsx` component
4. New backend endpoint: `/api/players/{id}/projection`

**Future:**
5. AI-powered game/performance breakdowns (narrative summaries)
6. Trend analysis — hot/cold streaks, usage rate shifts

### Phase 7: Expand to Other Leagues
1. Abstract NBA patterns into reusable components
2. Add NFL, MLB, NHL data sources
3. Replicate team/player/games structure per league

---

## Development Guidelines

1. **Fix known issues before adding features** — don't build on a shaky foundation
2. **TypeScript properly** — define interfaces for all API response shapes
3. **Component-based** — small, reusable, single-responsibility components
4. **No magic numbers** — if accessing array indices from nba_api, name the index with a comment or constant
5. **Environment variables** — never hardcode URLs or secrets
6. **Error handling at boundaries** — wrap all fetch calls, show fallback UI on failure
7. **Mobile-first responsive design** with Tailwind

### Coding Preferences
- Functional components (no class components)
- Tailwind for all styling (no CSS modules)
- Next.js App Router patterns (async server components for data fetching)
- Keep business logic out of UI components

---

## Session Log

| Date | Session | Changes |
|------|---------|---------|
| Jan 29, 2026 | 1 | Project scaffolded, PROJECT_BRIEF.md created, NBA-first approach decided |
| Jan 29, 2026 | 1 | NBA dashboard skeleton, FastAPI backend, `/api/teams` endpoint |
| Feb 4, 2026 | 2 | Reusable components: Header, NavBar, TeamCard; dynamic `[teamId]` routing |
| Feb 4, 2026 | 2 | `/api/teams/{team_id}` endpoint; frontend connected to backend |
| Feb 4, 2026 | 2 | All league pages scaffolded (NFL, MLB, NHL placeholders) |
| ~Feb, 2026 | 3 | PlayerCard component, `/nba/players/[playerId]` page, player headshots |
| Mar 2, 2026 | 4 | Project review — identified known issues, revised and updated PROJECT_BRIEF.md |
| Mar–Apr, 2026 | 5 | Header/NavBar moved to layout.tsx; GameLog component + team game log; complete visual refactor |
| Apr 1, 2026 | 6 | Updated PROJECT_BRIEF.md to reflect completed work; defined current sprint |
| Apr 6, 2026 | 7 | Replaced all hardcoded API URLs with `process.env.API_URL`; fixed team page index mappings (wins/losses off-by-one due to undocumented TEAM_SLUG column); added division, conference rank, win%, since year to team hero; updated PROJECT_BRIEF.md |
| Apr 6, 2026 | 8 | Total visual redesign (Uncodixfy): Slate Noir dark palette (`#0f172a`/`#1e293b`/`#38bdf8`); removed all white cards, oversized border radii, eyebrow labels, zebra stripes, shadow effects; NavBar active route highlighting; `<dl>/<dt>/<dd>` for hero info lists; `NBAPlayerProjection` styled to match; all 14 files updated |
| Apr 8, 2026 | 9 | Projection endpoint built (`/api/players/{id}/projection`) with EWMA + linregress trend; `NBAPlayerProjection.tsx` completed with StatCard components; extended numeric columns added (FG%, 3P%, FT%, OREB/DREB, STL, BLK, TOV); team page roster panel refactored to 2-col scrollable grid alongside GameLog; identified `get_team_logs` bug; added Shot Chart heatmap sprint to PROJECT_BRIEF.md |
| Apr 13, 2026 | 10 | Dashboard page built (Phase 4): league hub cards, scoreboard, league leaders (PPG/RPG/APG tabs), standings (East/West tabs), NBA teams grid; 3 new backend endpoints (`/api/games/today`, `/api/leaders`, `/api/standings`); `DashboardLeaders.tsx` + `DashboardStandings.tsx` client components; `Promise.allSettled` for graceful per-section error handling; fixed team page crash when `teamRanks[0]` is undefined post-season |

---

## Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev
# Runs at http://localhost:3000

# Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload
# Runs at http://localhost:8000
```

---

*Update this file when making significant changes. Add a row to the Session Log each session.*
