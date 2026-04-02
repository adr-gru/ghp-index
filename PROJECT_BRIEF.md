# GHP-Index: Sports Statistics Web Application

> **Last Updated:** April 1, 2026
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
- [x] NBA team detail page — team info, record, conference, roster grid
- [x] NBA player detail page — headshot, basic player info (partial — stats section pending)
- [x] Reusable components: `Header`, `NavBar`, `TeamCard`, `PlayerCard`, `GameLog`
- [x] Dynamic routing: `/nba/teams/[teamId]` and `/nba/players/[playerId]`
- [x] League pages scaffolded: NBA, NFL, MLB, NHL (placeholders)
- [x] Backend endpoints: `/api/teams`, `/api/teams/{id}`, `/api/players/{id}`, `/api/{team_id}/teamgamelog/`
- [x] NBA CDN images working (team logos + player headshots)
- [x] `Header` + `NavBar` moved into `layout.tsx` — no longer duplicated per page
- [x] "Last Games" game log table on team detail page (via `GameLog` component)
- [x] Complete visual refactor — cohesive dark theme with custom color palette

### In Progress
- [ ] NBA player detail page — fix birthday data bug, build out stats section
- [ ] Player game log ("Last Games" on player page)

### Known Issues (Fix Before Moving Forward)
- [ ] **Hardcoded backend URL** — `http://localhost:8000` used everywhere, needs `.env.local`
- [ ] **No error handling** — fetch calls will crash the page if backend is down
- [ ] **Magic array indices** — nba_api data accessed by number (`rowSet[0][14]`) with no type definitions
- [ ] **Player page birthday bug** — wrong array index assigned, pulls player name instead
- [ ] **No active link state** — NavBar doesn't show which page is currently active

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
│   │   │   ├── page.tsx                # Home/dashboard (Coming Soon placeholder)
│   │   │   ├── globals.css
│   │   │   ├── nba/
│   │   │   │   ├── page.tsx            # NBA teams listing — WORKING
│   │   │   │   ├── teams/[teamId]/page.tsx    # Team detail + roster + game log — WORKING
│   │   │   │   └── players/[playerId]/page.tsx # Player profile — PARTIAL
│   │   │   ├── nfl/page.tsx            # Placeholder
│   │   │   ├── mlb/page.tsx            # Placeholder
│   │   │   ├── nhl/page.tsx            # Placeholder
│   │   │   └── players/page.tsx        # Unused
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   └── GameLog.tsx             # Expandable game stats table
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

> **Goal:** Finish the NBA section cleanly end-to-end before anything else.

### Sprint Tasks (Priority Order)

**Cleanup & Stability**
- [ ] Add `.env.local` with `NEXT_PUBLIC_API_URL` — replace all hardcoded `localhost:8000` references
- [ ] Add `try/catch` + fallback UI to all fetch calls (show error message if backend is down)
- [ ] Define TypeScript interfaces for nba_api response shapes — eliminate magic array indices

**NBA Player Page**
- [ ] Fix birthday bug on player page (wrong array index — pulls name instead of birthday)
- [ ] Add season averages to player page (pts, reb, ast, stl, blk, fg%, 3p%)
- [ ] Add "Last Games" game log table to player page (reuse `GameLog` component)
- [ ] Show team name + link on player page

**Polish**
- [ ] Add active link highlighting to NavBar (show current page)
- [ ] Wire up `states.ts` to team detail page, or remove the file if unused

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

### Phase 4: NBA Dashboard
1. Home page with today's games, top performers, league leaders
2. Search across players and teams

### Phase 5: NBA Enhanced Features
1. Player comparison tool (side-by-side stats)
2. Team standings page
3. Season stat leaders

### Phase 6: AI Features
1. AI-powered game/performance breakdowns
2. Player projections (fantasy-style scoring)
3. Trend analysis

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
