from fastapi import FastAPI, HTTPException, Query
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import teaminfocommon, commonteamroster, commonplayerinfo, teamgamelog, playergamelog, shotchartdetail, scoreboardv2, leagueleaders, leaguestandingsv3, leaguegamefinder, playercareerstats
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
    team_info = teaminfocommon.TeamInfoCommon(team_id=team_id)
    roster = commonteamroster.CommonTeamRoster(team_id=team_id)

    info_dict = team_info.get_dict()

    # TeamSeasonRanks (resultSets[1]) goes empty post-season.
    # Fall back to computing season averages from the game log.
    computed_stats = None
    if not info_dict["resultSets"][1]["rowSet"]:
        log = teamgamelog.TeamGameLog(team_id=team_id)
        log_data = log.get_dict()
        log_rs = log_data["resultSets"][0]
        rows = log_rs["rowSet"]
        if rows:
            df = pd.DataFrame(rows, columns=log_rs["headers"])
            for col in ["PTS", "REB", "AST"]:
                df[col] = pd.to_numeric(df[col])
            computed_stats = {
                "ppg": round(float(df["PTS"].mean()), 1),
                "rpg": round(float(df["REB"].mean()), 1),
                "apg": round(float(df["AST"].mean()), 1),
            }

    return {
        "info": info_dict,
        "roster": roster.get_dict(),
        "computed_stats": computed_stats,
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

@app.get("/api/players/{player_id}/career/")
def get_player_career(player_id: int):
    career_stats = playercareerstats.PlayerCareerStats(player_id=player_id)
    data = career_stats.get_dict()

    return {
        "info": data
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


@app.get("/api/games/today")
def get_games_today():
    board = scoreboardv2.ScoreboardV2()
    data = board.get_dict()

    g_rs = data["resultSets"][0]   # GameHeader
    l_rs = data["resultSets"][1]   # LineScore

    g_headers = g_rs["headers"]
    l_headers = l_rs["headers"]

    def g_idx(name): return g_headers.index(name)
    def l_idx(name): return l_headers.index(name)

    games = {}
    for row in g_rs["rowSet"]:
        game_id = row[g_idx("GAME_ID")]
        games[game_id] = {
            "game_id": game_id,
            "status": row[g_idx("GAME_STATUS_TEXT")],
            "home_team_id": row[g_idx("HOME_TEAM_ID")],
            "away_team_id": row[g_idx("VISITOR_TEAM_ID")],
            "home_abbr": None,
            "away_abbr": None,
            "home_city": None,
            "away_city": None,
            "home_pts": None,
            "away_pts": None,
            "home_record": None,
            "away_record": None,
        }

    for row in l_rs["rowSet"]:
        game_id = row[l_idx("GAME_ID")]
        team_id = row[l_idx("TEAM_ID")]
        if game_id not in games:
            continue
        g = games[game_id]
        entry = {
            "abbr": row[l_idx("TEAM_ABBREVIATION")],
            "city": row[l_idx("TEAM_CITY_NAME")],
            "pts": row[l_idx("PTS")],
            "record": row[l_idx("TEAM_WINS_LOSSES")],
        }
        if team_id == g["home_team_id"]:
            g["home_abbr"] = entry["abbr"]
            g["home_city"] = entry["city"]
            g["home_pts"] = entry["pts"]
            g["home_record"] = entry["record"]
        else:
            g["away_abbr"] = entry["abbr"]
            g["away_city"] = entry["city"]
            g["away_pts"] = entry["pts"]
            g["away_record"] = entry["record"]

    return {"games": list(games.values())}


@app.get("/api/games/recent")
def get_recent_games(limit: int = 15):
    finder = leaguegamefinder.LeagueGameFinder(
        league_id_nullable="00",
        season_type_nullable="Regular Season",
    )
    data = finder.get_dict()
    rs = data["resultSets"][0]
    headers = rs["headers"]
    rows = rs["rowSet"]

    def idx(name): return headers.index(name)

    # Group rows by game_id (each game has two rows: home + away)
    games: dict = {}
    for row in rows:
        game_id = row[idx("GAME_ID")]
        if game_id not in games:
            if len(games) >= limit * 2:
                break
            games[game_id] = {"game_id": game_id, "game_date": row[idx("GAME_DATE")], "teams": []}
        games[game_id]["teams"].append({
            "team_id": row[idx("TEAM_ID")],
            "team_abbr": row[idx("TEAM_ABBREVIATION")],
            "pts": row[idx("PTS")],
            "wl": row[idx("WL")],
            "matchup": row[idx("MATCHUP")],
        })

    result = []
    for g in games.values():
        if len(g["teams"]) != 2:
            continue
        t1, t2 = g["teams"]
        # Home team matchup has "vs." not "@"
        if "@" not in t1["matchup"]:
            home, away = t1, t2
        else:
            home, away = t2, t1
        result.append({
            "game_id": g["game_id"],
            "game_date": g["game_date"],
            "home_team_id": home["team_id"],
            "home_abbr": home["team_abbr"],
            "home_pts": home["pts"],
            "away_team_id": away["team_id"],
            "away_abbr": away["team_abbr"],
            "away_pts": away["pts"],
        })
        if len(result) >= limit:
            break

    return {"games": result}


@app.get("/api/leaders")
def get_league_leaders(stat: str = "PTS"):
    data = leagueleaders.LeagueLeaders(
        stat_category_abbreviation=stat,
        per_mode48="PerGame",
        season_type_all_star="Regular Season",
        season="2024-25",
    ).get_dict()
    rs = data["resultSet"]
    headers = rs["headers"]

    def idx(name): return headers.index(name)

    result = []
    for row in rs["rowSet"][:10]:
        result.append({
            "rank": row[idx("RANK")],
            "player_id": row[idx("PLAYER_ID")],
            "player": row[idx("PLAYER")],
            "team": row[idx("TEAM")],
            "gp": row[idx("GP")],
            "value": row[idx(stat)],
        })
    return {"leaders": result, "stat": stat}


@app.get("/api/standings")
def get_standings():
    data = leaguestandingsv3.LeagueStandingsV3().get_dict()
    rs = data["resultSets"][0]
    headers = rs["headers"]

    def idx(name): return headers.index(name) if name in headers else -1

    east, west = [], []
    for row in rs["rowSet"]:
        conference = row[idx("Conference")]
        clinch_i = idx("ClinchIndicator")
        home_i = idx("HOME")
        road_i = idx("ROAD")
        l10_i = idx("L10")
        streak_i = idx("strCurrentStreak")

        team_data = {
            "team_id": row[idx("TeamID")],
            "city": row[idx("TeamCity")],
            "name": row[idx("TeamName")],
            "wins": row[idx("WINS")],
            "losses": row[idx("LOSSES")],
            "pct": row[idx("WinPCT")],
            "rank": row[idx("PlayoffRank")],
            "clinch": row[clinch_i] if clinch_i >= 0 else "",
            "home": row[home_i] if home_i >= 0 else "",
            "road": row[road_i] if road_i >= 0 else "",
            "l10": row[l10_i] if l10_i >= 0 else "",
            "streak": row[streak_i] if streak_i >= 0 else "",
        }
        if conference == "East":
            east.append(team_data)
        else:
            west.append(team_data)

    east.sort(key=lambda x: x["rank"])
    west.sort(key=lambda x: x["rank"])
    return {"east": east, "west": west}