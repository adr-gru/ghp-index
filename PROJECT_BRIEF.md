# GHP-Index: Sports Statistics Web Application

> **Last Updated:** February 4, 2026  
> **Project Owner:** Adrian G. (4th Year CS Student)  
> **Purpose:** Portfolio project + skill development

---

## 🎯 Project Vision

GHP-Index is a web application that aggregates and displays statistics from the four major North American sports leagues (NFL, NBA, MLB, NHL). Users can explore games, player performances, individual players, and teams with relevant statistics. The app aims to eventually incorporate AI-powered analysis, projections, and player comparisons.

---

## 🏗️ Current Status

### ✅ Completed
- [x] Next.js 16 project initialized with React 19
- [x] Tailwind CSS 4 configured for styling
- [x] TypeScript setup complete
- [x] Basic project structure in place
- [x] NBA dashboard skeleton (header, nav, main layout)
- [x] Python backend setup (FastAPI + nba_api)
- [x] /api/teams endpoint returning all NBA teams
- [x] /api/teams/{team_id} endpoint for specific team info + roster
- [x] Reusable components created (Header, NavBar, TeamCard)
- [x] Dynamic routing for team pages (`[teamId]`)
- [x] Frontend connected to backend (NBA teams displaying)
- [x] League pages scaffolded (NBA, NFL, MLB, NHL)

### 🚧 In Progress
- [ ] Style and enhance team detail pages
- [ ] Display roster data on team pages

### ❌ Not Started
**NBA First Approach** - Building out NBA fully before adding other leagues

#### NBA Core (Priority)
- [ ] NBA landing page / dashboard
- [ ] NBA data source integration (API or scraping)
- [ ] NBA Games view (scores, box scores)
- [ ] NBA Player performances view
- [ ] NBA Players directory with stats
- [ ] NBA Teams directory with rosters/standings
- [ ] NBA player images integration
- [ ] NBA AI breakdown feature
- [ ] NBA player projections
- [ ] NBA player comparison tool (points, rebounds, assists, steals, blocks, etc.)

#### Expand to Other Leagues (Later)
- [ ] League selection UI (NFL, NBA, MLB, NHL)
- [ ] NFL integration
- [ ] MLB integration  
- [ ] NHL integration
- [ ] Cross-league comparison tools

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI Library** | React 19 | Building components, managing UI state |
| **Language** | TypeScript | JavaScript with types (`.tsx` files) |
| **Framework** | Next.js 16 | Routing, server features, project structure |
| **Styling** | Tailwind CSS 4 | Utility-first CSS classes |
| **Backend** | FastAPI (Python) | REST API serving NBA data |
| **Data Source** | nba_api | Python library for official NBA stats |
| Database | TBD | |
| AI Features | TBD (OpenAI API, local models, etc.) | |

---

## 📁 Project Structure

```
ghp-index/
├── frontend/                 # Next.js application
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx      # Home page (needs league selector)
│   │       ├── layout.tsx    # Root layout
│   │       └── globals.css   # Global styles
│   ├── public/               # Static assets
│   └── package.json
└── PROJECT_BRIEF.md          # This file
```

---

## 🗺️ Roadmap

> **Strategy:** Build NBA fully first, then replicate patterns for NFL, MLB, NHL

### Phase 1: NBA UI Foundation
1. NBA home/dashboard page
2. Create navigation: Games | Performances | Players | Teams
3. Build reusable UI components (cards, tables, stats displays)
4. Implement responsive design for mobile/desktop

### Phase 2: NBA Data Layer
1. Research and select NBA data source
   - Options: NBA API, ESPN API, Basketball Reference, balldontlie API
2. Set up API routes for fetching NBA data
3. Define TypeScript interfaces for NBA games, players, teams, stats
4. Implement caching to avoid rate limits

### Phase 3: NBA Core Features
1. Games view - recent/upcoming NBA games with scores and box scores
2. Player performances - individual game stat lines
3. Players directory - searchable list of NBA players with season stats
4. Teams directory - rosters, standings, team stats

### Phase 4: NBA Enhanced Features
1. Player headshot images
2. Detailed player profile pages (career stats, trends)
3. Team profile pages
4. Historical data and season comparisons

### Phase 5: NBA AI Features
1. AI-powered game/performance breakdowns
2. Player projections (fantasy-style: points, rebounds, assists, etc.)
3. Player comparison tool (head-to-head stat comparisons)

### Phase 6: Expand to Other Leagues
1. Abstract shared components and patterns from NBA implementation
2. Add league selector UI
3. Integrate NFL, MLB, NHL using same patterns
4. Cross-league comparison features (normalize stats where applicable)

---

## 💡 Design Notes

- **UI Style:** Modern, clean, data-focused (think ESPN meets minimalist design)
- **Color Scheme:** TBD - consider dark mode as primary
- **Key UX Goal:** Quick access to stats without clutter

---

## 🔧 Development Notes for AI Agents

When working on this project:

1. **Ask clarifying questions** if the task is ambiguous
2. **Prioritize clean, maintainable code** - this is a learning project
3. **Use TypeScript properly** - define interfaces/types for all data structures
4. **Component-based architecture** - keep components small and reusable
5. **Mobile-first responsive design** with Tailwind
6. **Document complex logic** with comments
7. **Suggest improvements** - Adrian is learning, so explain your reasoning

### Coding Preferences
- Functional components with hooks
- Tailwind for styling (no CSS modules)
- Keep business logic separate from UI components
- Use Next.js App Router patterns

---

## 📝 Session Log

Use this section to track major changes across sessions:

| Date | Agent/Session | Changes Made |
|------|---------------|--------------|
| Jan 29, 2026 | Initial | Project scaffolded, PROJECT_BRIEF.md created |
| Jan 29, 2026 | Session 1 | Updated roadmap to NBA-first approach |
| Jan 29, 2026 | Session 1 | Created NBA dashboard skeleton in page.tsx (header, nav, main) |
| Jan 29, 2026 | Session 1 | Set up Python backend with FastAPI, created /api/teams endpoint |
| Feb 4, 2026 | Session 2 | Created reusable components: Header, NavBar, TeamCard |
| Feb 4, 2026 | Session 2 | Implemented dynamic routing with `[teamId]` for team pages |
| Feb 4, 2026 | Session 2 | Added `/api/teams/{team_id}` backend endpoint (team info + roster) |
| Feb 4, 2026 | Session 2 | Connected frontend to backend - NBA teams now display with TeamCard |
| Feb 4, 2026 | Session 2 | Scaffolded all league pages (NFL, MLB, NHL) with same structure |
| Feb 4, 2026 | Session 2 | Used Next.js Link component for client-side navigation |

---

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

*This document should be updated as the project evolves. When making significant changes, add an entry to the Session Log.*
