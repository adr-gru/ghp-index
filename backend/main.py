from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import teaminfocommon, commonteamroster, commonplayerinfo, teamgamelog, playergamelog
import pandas as pd
import numpy as np
from scipy import stats
 
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

@app.get("/api/players/{player_id}/projection/")
def get_player_projection(player_id: int):
    player_stats = playergamelog.PlayerGameLog(player_id=player_id)
    data = player_stats.get_dict()
    result_set = data["resultSets"][0]
    rows = result_set["rowSet"]

    if not rows:
        raise HTTPException(status_code=404, detail="No game log found")

    df = pd.DataFrame(rows, columns=result_set["headers"])
    for col in ["PTS", "REB", "AST"]:
        df[col] = pd.to_numeric(df[col])

    window = min(10, len(df))
    # nba_api returns most recent first; reverse slice to get chronological order
    recent = df.head(window).iloc[::-1].reset_index(drop=True)

    def project_stat(col: str) -> dict:
        vals = recent[col].values
        ewma_val = float(pd.Series(vals).ewm(span=5, adjust=False).mean().iloc[-1])
        std = float(recent[col].std()) if len(vals) > 1 else 0.0
        season_avg = float(df[col].mean())

        slope, *_ = stats.linregress(np.arange(len(vals)), vals)
        if slope > 0.5:
            trend = "up"
        elif slope < -0.5:
            trend = "down"
        else:
            trend = "flat"

        return {
            "projection": round(ewma_val, 1),
            "low": round(max(0.0, ewma_val - std), 1),
            "high": round(ewma_val + std, 1),
            "season_avg": round(season_avg, 1),
            "trend": trend,
        }

    return {
        "pts": project_stat("PTS"),
        "reb": project_stat("REB"),
        "ast": project_stat("AST"),
        "games_used": window,
    }