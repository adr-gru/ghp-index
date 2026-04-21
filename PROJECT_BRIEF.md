# GHP-Index: Sports Statistics Web Application

> **Last Updated:** April 21, 2026
> **Project Owner:** Adrian G. (4th Year CS Student)
> **Purpose:** Portfolio project + skill development
> **Status:** 🟢 Deployed to Production

---

## Project Vision

GHP-Index is a web application that aggregates and displays statistics from the four major North American sports leagues (NFL, NBA, MLB, NHL). Users can explore teams, rosters, individual player profiles, and game data with AI-powered projections and player comparisons.

**Design Target:** Modern, dark-themed, data-focused — clean access to stats without clutter.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 (App Router) + React 19 | Routing, SSR/CSR, project structure |
| Language | TypeScript | Type-safe development |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Backend | FastAPI (Python) | REST API serving sports data |
| Data Source | `nba_api` | Python library wrapping NBA stats API |
| Deployment | Vercel (Frontend) + Railway (Backend) | Production hosting |
| Caching | In-memory TTL cache | API response caching (30-60min) |

---

## Deployment

**Platform:** Vercel (Frontend) + Railway (Backend)

**Environment Variables:**
- `API_URL` - Backend API URL
- `NEXT_PUBLIC_API_URL` - Backend API URL (client-side accessible)

**Deployment Process:**
1. Push to `main` branch on GitHub
2. Vercel auto-deploys frontend (1-2 min)
3. Railway auto-deploys backend (1-2 min)

---

## Current Status

### ✅ Completed Features

**Core Infrastructure:**
- Next.js + React 19 + TypeScript + Tailwind CSS 4 setup
- FastAPI backend with `nba_api` integration
- Production deployment on Vercel + Railway
- CORS configuration for production domains
- Client-side rendering with skeleton loaders
- Comprehensive error handling with retry mechanisms

**Backend Reliability:**
- In-memory caching system with configurable TTL (30-60min per endpoint)
- Retry logic with exponential backoff (3 attempts)
- Increased API timeouts (20 seconds)
- Stale cache fallback for graceful degradation
- Cache management endpoints (`/api/cache/stats`, `/api/cache/clear`)

**NBA Features:**
- Dashboard: scoreboard with day navigation (← / →), league leaders, standings, team grid
- Team pages: tabbed layout — Overview (streaks, splits, season avgs, result badges), Roster, Game Log, Shot Chart
- Player pages: bio, stats, projections, career stats, comparison tool
- Player search: client-side search across all ~4500 players with headshots (NBA page + Players tab)
- Recent performance chart: Recharts bar chart (last 15 games, PTS/REB/AST/STL/BLK selector, team-colored bars)
- Career progression chart: per-game averages across all seasons with animated stat selector
- Projections: confidence range bars (low/projection/high gauge) with season-avg marker
- Shot chart with filters (player/team/context controls)
- Player comparison with side-by-side stats and color-coded differentials
- Career stats: season-by-season table, totals/averages, career highs
- AI projections: EWMA + trend analysis for next-game stats

**UI/UX:**
- Slate Noir dark theme with custom color palette
- Skeleton loaders for all data-loading states
- Retry buttons on all error states
- Active route highlighting in navigation
- Responsive design with mobile support
- Proper contrast for accessibility


### 🔧 Known Issues

**Minor:**
- None currently blocking

---

## Project Structure

```
ghp-index/
├── frontend/                    # Next.js app (Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout with Header + NavBar
│   │   │   ├── page.tsx         # Dashboard (client-side)
│   │   │   ├── nba/
│   │   │   │   ├── page.tsx     # NBA teams list (client-side)
│   │   │   │   ├── teams/[teamId]/page.tsx    # Team detail (client-side)
│   │   │   │   └── players/[playerId]/page.tsx # Player detail (client-side)
│   │   │   ├── nfl/page.tsx     # Placeholder
│   │   │   ├── mlb/page.tsx     # Placeholder
│   │   │   └── nhl/page.tsx     # Placeholder
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── GameLog.tsx
│   │   │   ├── PlayerTabs.tsx            # Last Games / Projections / Shots / Career / Compare
│   │   │   ├── PlayerStatChart.tsx       # Recent game bar chart (Recharts, per-stat selector)
│   │   │   ├── NBAPlayerProjection.tsx   # EWMA projection + confidence range bars
│   │   │   ├── NBAPlayerComparison.tsx   # Side-by-side comparison
│   │   │   ├── PlayerCareer.tsx          # Career stats + progression chart
│   │   │   ├── PlayerSearch.tsx          # Client-side player search with headshots
│   │   │   ├── DashboardScoreboard.tsx   # Scoreboard with day navigation
│   │   │   ├── ShotChart.tsx             # SVG court + shot heatmap
│   │   │   ├── ShotsFilter.tsx           # Shot chart controls
│   │   │   ├── DashboardLeaders.tsx      # League leaders widget
│   │   │   └── DashboardStandings.tsx    # Standings widget
│   │   └── utils/
│   │       ├── states.ts        # City → state mapping
│   │       └── teamColors.ts    # Team color mappings
│   └── package.json
├── backend/                     # FastAPI app (Railway)
│   ├── main.py                  # API endpoints + caching
│   └── requirements.txt
└── PROJECT_BRIEF.md
```

---

## API Endpoints

**Teams:**
- `GET /api/teams` - List all NBA teams (static data)
- `GET /api/teams/{team_id}` - Team info, roster, stats (cached 30min)
- `GET /api/{team_id}/teamgamelog/` - Team game log

**Players:**
- `GET /api/players` - List all NBA players (static data)
- `GET /api/players/{player_id}` - Player info (cached 30min)
- `GET /api/players/{player_id}/playergamelog/` - Player game log (cached 10min)
- `GET /api/players/{player_id}/projection/` - AI projections (cached 10min)
- `GET /api/players/{player_id}/career/` - Career stats (cached 60min)

**Games & Stats:**
- `GET /api/games/today` - Today's scores/games
- `GET /api/games/scoreboard?date=YYYY-MM-DD` - Scoreboard for any date (2-min TTL today, 24h past)
- `GET /api/games/recent` - Recent games
- `GET /api/leaders?stat={stat}` - League leaders (PPG/RPG/APG)
- `GET /api/standings` - Conference standings
- `GET /api/shots` - Shot chart data with filters

**Cache Management:**
- `GET /api/cache/stats` - View cache statistics
- `POST /api/cache/clear` - Clear all cache
- `DELETE /api/cache/clear-old` - Remove stale entries

---

## Roadmap

### ✅ Phase 1: NBA Core (Completed)
- Team pages with roster and game logs
- Player pages with stats and projections
- Dashboard with scoreboard, leaders, standings
- Shot charts with filtering
- Career stats and player comparison
- Production deployment

### 🟡 Phase 2: Enhanced Features (In Progress — `feature/enhanced-dashboard`)

**Done:**
- [x] Player search (client-side, all players)
- [x] Scoreboard date navigation (any date in season)
- [x] Recent game performance chart (bar chart, per-stat selector)
- [x] Career progression chart (Recharts, season-by-season)
- [x] Projection confidence range visualization
- [x] Team page tabbed layout (Overview / Roster / Game Log / Shot Chart)

**Remaining:**
- [ ] Box score view for individual games
- [ ] Head-to-head matchup history
- [ ] Advanced stats (PER, TS%, Usage Rate)
- [ ] Bookmarks/favorites system
- [ ] Last-updated timestamps on cached data

### Phase 3: Multi-League Expansion
- [ ] Abstract NBA patterns into reusable components
- [ ] Add NFL data source and pages
- [ ] Add MLB data source and pages
- [ ] Add NHL data source and pages

### Phase 4: AI Features
- [ ] AI-powered game summaries
- [ ] Performance breakdowns (narrative analysis)
- [ ] Fantasy scoring projections
- [ ] Injury impact analysis

---

## Development Guidelines

**Architecture:**
1. Client-side rendering for all dynamic pages
2. Skeleton loaders for every loading state
3. Error boundaries with retry buttons
4. Environment variables for all external URLs
5. TypeScript interfaces for all API responses

**Code Quality:**
- Functional components only (no class components)
- Tailwind for all styling (no CSS modules)
- Small, single-responsibility components
- Named constants instead of magic numbers
- Comprehensive error handling at API boundaries

**Performance:**
- Backend caching to reduce API load
- Client-side fetch timeouts (15-20s)
- Retry logic with exponential backoff
- Graceful degradation when APIs fail

---

## Session Log

| Date | Session | Major Changes |
|------|---------|---------------|
| Jan 29, 2026 | 1 | Project scaffolded, NBA-first approach decided |
| Feb 4, 2026 | 2 | Core routing, team/player pages, FastAPI backend |
| Mar–Apr, 2026 | 3-6 | Visual refactor, GameLog, environment variables |
| Apr 6, 2026 | 7-8 | Slate Noir theme, NavBar improvements |
| Apr 8, 2026 | 9 | Projections endpoint, shot charts |
| Apr 13, 2026 | 10 | Dashboard with scoreboard/leaders/standings |
| Apr 13, 2026 | 11 | Career stats, player comparison |
| Apr 13, 2026 | 12 | **Production deployment & reliability:** Backend caching with TTL (30-60min), retry logic with exponential backoff, 20s timeouts, stale cache fallback; Frontend converted to CSR with skeleton loaders, error states with retry buttons; Fixed career stats bugs; Deployed to Vercel + Railway |
| Apr 21, 2026 | 13 | **Enhanced dashboard (branch: `feature/enhanced-dashboard`):** Scoreboard day navigation; player search across all ~4500 players; recent game bar chart + career progression chart (Recharts); projection confidence range bars; team page tabbed layout with Overview stats |

---

## Quick Start

**Local Development:**
```bash
# Backend (start first)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000

# Frontend (in new terminal)
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
# → http://localhost:3000
```

**Production:**
- Configured via Vercel environment variables
- Auto-deploys from `main` branch

---

*Update this file after significant changes. Add session log entries after each work session.*
