from fastapi import FastAPI, HTTPException, Query
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import teaminfocommon, commonteamroster, commonplayerinfo, teamgamelog, playergamelog, shotchartdetail
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
      data = team_info.get_dict()
      result_set=data["resultSets"][0]
      rows = result_set["rowSet"]

      if not rows:
        raise HTTPException(status_code=404, detail="no team found")
      
      df = pd.DataFrame(rows, columns=result_set["headers"])
      window = min(10, len(df))
      # nba_api returns most recent first; reverse slice to get chronological order
      recent = df.head(window).iloc[::-1].reset_index(drop=True)

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
    for col in ["PTS", "REB", "AST", "STL", "BLK", "TOV"]:
        df[col] = pd.to_numeric(df[col])

    window = min(10, len(df))
    # nba_api returns most recent first; reverse slice to get chronological order
    recent = df.head(window).iloc[::-1].reset_index(drop=True)

    return {
        "pts": project_stat("PTS", recent, df),
        "reb": project_stat("REB", recent, df),
        "ast": project_stat("AST", recent, df),
        "stl": project_stat("STL", recent, df),
        "blk": project_stat("BLK", recent, df),
        "games_used": window,
    }

def project_stat(col: str, recent: pd.DataFrame, df: pd.DataFrame) -> dict:
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

@app.get("/api/shots")
def get_shots(
    player_id: int = 0,
    team_id: int = 0,
    context: Literal["FGA", "FG3A", "FTA", "FG3M", "FGM", "FTM", "BLKA", "DUNK_FGM", "DUNK_FGA"] = Query(
        default="FGA", description="Shot context measure"
    ),
):
    if player_id == 0 and team_id == 0:
        raise HTTPException(status_code=400, detail="Provide at least a player_id or team_id")

    shot_data = shotchartdetail.ShotChartDetail(
        player_id=player_id,
        team_id=team_id,
        context_measure_simple=context,
    )
    data = shot_data.get_dict()
    result_set = data["resultSets"][0]
    rows = result_set["rowSet"]

    shots = [
        {
            "x": row[17],           # LOC_X
            "y": row[18],           # LOC_Y
            "made": row[20] == 1,   # SHOT_MADE_FLAG (int 0/1)
            "player": row[4],       # PLAYER_NAME
            "team_name": row[6],    # TEAM_NAME
            "action_type": row[11], # ACTION_TYPE
            "shot_type": row[12],   # SHOT_TYPE
            "zone": row[13],        # SHOT_ZONE_BASIC
            "distance": row[16],    # SHOT_DISTANCE
        }
        for row in rows
    ]

    return {"shots": shots, "count": len(shots)}