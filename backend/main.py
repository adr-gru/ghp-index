from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import teaminfocommon, commonteamroster, commonplayerinfo, teamgamelog, playergamelog
 
app = FastAPI()
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_methods=["*"],
    allow_headers=["*"],
)
 
@app.get("/api/teams")
def get_teams():
    nba_teams = teams.get_teams()
    return nba_teams

@app.get("/api/players")
def get_players():
    nba_players = players.get_players()
    return nba_players
 
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
 
@app.get("/api/players/{player_id}")
def get_player(player_id: int):
      player_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id) 
      return {
        "info": player_info.get_dict()
    }
 
@app.get("/api/{team_id}/teamgamelog/")
def get_team_logs(team_id: int):
      team_info = teamgamelog.TeamGameLog(team_id=team_id) 
      return {
        "info": team_info.get_dict()
    }
@app.get("/api/players/{player_id}/playergamelog/")
def get_player_game_logs(player_id: int):
      player_stats = playergamelog.PlayerGameLog(player_id=player_id)
      return {
        "info": player_stats.get_dict()
    }