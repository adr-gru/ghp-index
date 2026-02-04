from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import teaminfocommon, commonteamroster

# Create the FastAPI app
app = FastAPI()

# Allow the frontend to make requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your first endpoint - returns all NBA teams
@app.get("/api/teams")
def get_teams():
    nba_teams = teams.get_teams()
    return nba_teams

@app.get("/api/players")
def get_players():
    nba_players = players.get_players()
    return nba_players

# Get a specific team by ID
@app.get("/api/teams/{team_id}")
def get_team(team_id: int):
    # Get team info (name, city, conference, division, etc.)
    team_info = teaminfocommon.TeamInfoCommon(team_id=team_id)
    
    # Get team roster (all players on the team)
    roster = commonteamroster.CommonTeamRoster(team_id=team_id)
    
    return {
        "info": team_info.get_dict(),
        "roster": roster.get_dict()
    }