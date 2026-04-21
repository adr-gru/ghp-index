from fastapi import FastAPI, HTTPException, Query
from typing import Literal, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import teaminfocommon, commonteamroster, commonplayerinfo, teamgamelog, playergamelog, shotchartdetail, scoreboardv2, leagueleaders, leaguestandingsv3, leaguegamefinder, playercareerstats
import pandas as pd
import numpy as np
from scipy import stats
from datetime import datetime, timedelta
import time
import os
import threading
import diskcache as dc
import requests

app = FastAPI()

# ---------------------------------------------------------------------------
# Persistent disk cache
# ---------------------------------------------------------------------------
# Survives process restarts. For full cross-deployment persistence on Railway,
# mount a volume and set CACHE_DIR=/data/nba_cache in your environment variables.
CACHE_DIR = os.environ.get("CACHE_DIR", "/tmp/nba_cache")
_cache = dc.Cache(CACHE_DIR)

STALE_TTL_SECONDS = 7 * 24 * 60 * 60  # keep data on disk for 7 days


def cache_get(key: str, ttl_minutes: int) -> Optional[Any]:
    """Return cached data if fresher than ttl_minutes, else None."""
    entry = _cache.get(key)
    if entry is None:
        return None
    if datetime.now() - datetime.fromisoformat(entry["ts"]) < timedelta(minutes=ttl_minutes):
        return entry["data"]
    return None


def cache_get_stale(key: str) -> Optional[Any]:
    """Return any cached data regardless of age (stale fallback)."""
    entry = _cache.get(key)
    return entry["data"] if entry else None


def cache_set(key: str, value: Any) -> None:
    _cache.set(key, {"data": value, "ts": datetime.now().isoformat()}, expire=STALE_TTL_SECONDS)


# ---------------------------------------------------------------------------
# Retry helper — 2 retries × 9 s timeout = ~19 s worst-case, fits frontend window
# ---------------------------------------------------------------------------
def retry_api_call(func, max_retries: int = 2, initial_delay: float = 1.0):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(initial_delay * (2 ** attempt))


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup cache warming — pre-populates all 30 teams in the background so a
# cold restart doesn't leave users hitting a slow nba.com cold.
# ---------------------------------------------------------------------------
def _warm_cache():
    time.sleep(10)  # let the server fully start first
    nba_teams = teams.get_teams()
    for team in nba_teams:
        team_id = team["id"]
        if cache_get(f"team_{team_id}", ttl_minutes=30) is not None:
            continue  # already fresh, skip
        try:
            get_team(team_id)
            time.sleep(2)  # stay well within nba.com rate limits
        except Exception:
            pass  # warming is best-effort


@app.on_event("startup")
async def startup_event():
    threading.Thread(target=_warm_cache, daemon=True).start()


# ---------------------------------------------------------------------------
# Static endpoints (no nba.com call needed)
# ---------------------------------------------------------------------------
@app.get("/api/teams")
def get_teams():
    return teams.get_teams()


@app.get("/api/players")
def get_players():
    return players.get_players()


# ---------------------------------------------------------------------------
# Team endpoints
# ---------------------------------------------------------------------------
@app.get("/api/teams/{team_id}")
def get_team(team_id: int):
    cache_key = f"team_{team_id}"
    cached = cache_get(cache_key, ttl_minutes=30)
    if cached:
        return cached

    try:
        def fetch_team_info():
            return teaminfocommon.TeamInfoCommon(team_id=team_id, timeout=9)

        def fetch_roster():
            return commonteamroster.CommonTeamRoster(team_id=team_id, timeout=9)

        team_info = retry_api_call(fetch_team_info)
        roster = retry_api_call(fetch_roster)
        info_dict = team_info.get_dict()

        # TeamSeasonRanks (resultSets[1]) goes empty post-season — compute from game log.
        computed_stats = None
        if not info_dict["resultSets"][1]["rowSet"]:
            def fetch_game_log():
                return teamgamelog.TeamGameLog(team_id=team_id, timeout=9)

            log = retry_api_call(fetch_game_log)
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

        result = {
            "info": info_dict,
            "roster": roster.get_dict(),
            "computed_stats": computed_stats,
        }
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


@app.get("/api/{team_id}/teamgamelog/")
def get_team_logs(team_id: int):
    cache_key = f"team_gamelog_{team_id}"
    cached = cache_get(cache_key, ttl_minutes=10)
    if cached:
        return cached

    try:
        def fetch():
            return teamgamelog.TeamGameLog(team_id=team_id, timeout=9)

        team_log = retry_api_call(fetch)
        data = team_log.get_dict()
        result_set = data["resultSets"][0]
        rows = result_set["rowSet"]

        if not rows:
            raise HTTPException(status_code=404, detail="No game log found")

        result = {"info": team_log.get_dict()}
        cache_set(cache_key, result)
        return result

    except HTTPException:
        raise
    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


# ---------------------------------------------------------------------------
# Player endpoints
# ---------------------------------------------------------------------------
@app.get("/api/players/{player_id}")
def get_player(player_id: int):
    cache_key = f"player_{player_id}"
    cached = cache_get(cache_key, ttl_minutes=30)
    if cached:
        return cached

    try:
        def fetch_player():
            return commonplayerinfo.CommonPlayerInfo(player_id=player_id, timeout=9)

        player_info = retry_api_call(fetch_player)
        result = {"info": player_info.get_dict()}
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


@app.get("/api/players/{player_id}/playergamelog/")
def get_player_game_logs(player_id: int):
    cache_key = f"player_gamelog_{player_id}"
    cached = cache_get(cache_key, ttl_minutes=10)
    if cached:
        return cached

    try:
        def fetch_gamelog():
            return playergamelog.PlayerGameLog(player_id=player_id, timeout=9)

        player_stats = retry_api_call(fetch_gamelog)
        result = {"info": player_stats.get_dict()}
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


@app.get("/api/players/{player_id}/projection/")
def get_player_projection(player_id: int):
    cache_key = f"player_projection_{player_id}"
    cached = cache_get(cache_key, ttl_minutes=10)
    if cached:
        return cached

    try:
        def fetch_gamelog():
            return playergamelog.PlayerGameLog(player_id=player_id, timeout=9)

        player_stats = retry_api_call(fetch_gamelog)
        data = player_stats.get_dict()
        result_set = data["resultSets"][0]
        rows = result_set["rowSet"]

        if not rows:
            raise HTTPException(status_code=404, detail="No game log found")

        df = pd.DataFrame(rows, columns=result_set["headers"])
        for col in ["PTS", "REB", "AST", "STL", "BLK", "TOV"]:
            df[col] = pd.to_numeric(df[col])

        window = min(10, len(df))
        recent = df.head(window).iloc[::-1].reset_index(drop=True)

        result = {
            "pts": project_stat("PTS", recent, df),
            "reb": project_stat("REB", recent, df),
            "ast": project_stat("AST", recent, df),
            "stl": project_stat("STL", recent, df),
            "blk": project_stat("BLK", recent, df),
            "games_used": window,
        }
        cache_set(cache_key, result)
        return result

    except HTTPException:
        raise
    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


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
    cache_key = f"player_career_totals_{player_id}"
    cached = cache_get(cache_key, ttl_minutes=60)
    if cached:
        return cached

    try:
        def fetch_career():
            # Totals mode: resultSets[1] contains true career counting totals
            # (PerGame default would give per-game averages there instead)
            return playercareerstats.PlayerCareerStats(
                player_id=player_id, per_mode36="Totals", timeout=9
            )

        career_stats = retry_api_call(fetch_career)
        result = {"info": career_stats.get_dict()}
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


# ---------------------------------------------------------------------------
# Shots
# ---------------------------------------------------------------------------
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

    cache_key = f"shots_{player_id}_{team_id}_{context}"
    cached = cache_get(cache_key, ttl_minutes=60)
    if cached:
        return cached

    try:
        def fetch():
            return shotchartdetail.ShotChartDetail(
                player_id=player_id,
                team_id=team_id,
                context_measure_simple=context,
            )

        shot_data = retry_api_call(fetch)
        data = shot_data.get_dict()
        result_set = data["resultSets"][0]
        rows = result_set["rowSet"]

        result = {
            "shots": [
                {
                    "x": row[17],
                    "y": row[18],
                    "made": row[20] == 1,
                    "player": row[4],
                    "team_name": row[6],
                    "action_type": row[11],
                    "shot_type": row[12],
                    "zone": row[13],
                    "distance": row[16],
                }
                for row in rows
            ],
            "count": len(rows),
        }
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


# ---------------------------------------------------------------------------
# Games / scores
# ---------------------------------------------------------------------------
def _parse_scoreboard(board) -> list:
    """Shared helper: parse a ScoreboardV2 response into a list of game dicts."""
    data = board.get_dict()
    g_rs = data["resultSets"][0]
    l_rs = data["resultSets"][1]
    g_headers = g_rs["headers"]
    l_headers = l_rs["headers"]

    def g_idx(name): return g_headers.index(name)
    def l_idx(name): return l_headers.index(name)

    games: dict = {}
    for row in g_rs["rowSet"]:
        game_id = row[g_idx("GAME_ID")]
        games[game_id] = {
            "game_id": game_id,
            "status": row[g_idx("GAME_STATUS_TEXT")],
            "home_team_id": row[g_idx("HOME_TEAM_ID")],
            "away_team_id": row[g_idx("VISITOR_TEAM_ID")],
            "home_abbr": None, "away_abbr": None,
            "home_city": None, "away_city": None,
            "home_pts": None, "away_pts": None,
            "home_record": None, "away_record": None,
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

    return list(games.values())


@app.get("/api/games/today")
def get_games_today():
    cache_key = "games_today"
    cached = cache_get(cache_key, ttl_minutes=5)
    if cached:
        return cached

    try:
        def fetch():
            return scoreboardv2.ScoreboardV2(timeout=9)

        board = retry_api_call(fetch)
        result = {"games": _parse_scoreboard(board)}
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


@app.get("/api/games/scoreboard")
def get_scoreboard(date: Optional[str] = None):
    """Get scoreboard for any date. date param: YYYY-MM-DD (defaults to today)."""
    if date:
        try:
            game_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        game_date = datetime.now()

    date_str = game_date.strftime("%Y-%m-%d")
    is_today = date_str == datetime.now().strftime("%Y-%m-%d")
    ttl = 2 if is_today else 1440  # 2 min for today, 24 h for past dates
    cache_key = f"games_scoreboard_{date_str}"
    cached = cache_get(cache_key, ttl_minutes=ttl)
    if cached:
        return cached

    try:
        def fetch():
            return scoreboardv2.ScoreboardV2(game_date=game_date.strftime("%m/%d/%Y"), timeout=9)

        board = retry_api_call(fetch)
        result = {"games": _parse_scoreboard(board), "date": date_str}
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


@app.get("/api/games/recent")
def get_recent_games(limit: int = 15):
    cache_key = f"games_recent_{limit}"
    cached = cache_get(cache_key, ttl_minutes=30)
    if cached:
        return cached

    try:
        def fetch():
            return leaguegamefinder.LeagueGameFinder(
                league_id_nullable="00",
                season_type_nullable="Regular Season",
            )

        finder = retry_api_call(fetch)
        data = finder.get_dict()
        rs = data["resultSets"][0]
        headers = rs["headers"]
        rows = rs["rowSet"]

        def idx(name): return headers.index(name)

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

        output = []
        for g in games.values():
            if len(g["teams"]) != 2:
                continue
            t1, t2 = g["teams"]
            if "@" not in t1["matchup"]:
                home, away = t1, t2
            else:
                home, away = t2, t1
            output.append({
                "game_id": g["game_id"],
                "game_date": g["game_date"],
                "home_team_id": home["team_id"],
                "home_abbr": home["team_abbr"],
                "home_pts": home["pts"],
                "away_team_id": away["team_id"],
                "away_abbr": away["team_abbr"],
                "away_pts": away["pts"],
            })
            if len(output) >= limit:
                break

        result = {"games": output}
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


# ---------------------------------------------------------------------------
# League data
# ---------------------------------------------------------------------------
@app.get("/api/leaders")
def get_league_leaders(stat: str = "PTS"):
    cache_key = f"leaders_{stat}"
    cached = cache_get(cache_key, ttl_minutes=60)
    if cached:
        return cached

    try:
        def fetch():
            return leagueleaders.LeagueLeaders(
                stat_category_abbreviation=stat,
                per_mode48="PerGame",
                season_type_all_star="Regular Season",
                season="2024-25",
            )

        leaders = retry_api_call(fetch)
        data = leaders.get_dict()
        rs = data["resultSet"]
        headers = rs["headers"]

        def idx(name): return headers.index(name)

        result = {
            "leaders": [
                {
                    "rank": row[idx("RANK")],
                    "player_id": row[idx("PLAYER_ID")],
                    "player": row[idx("PLAYER")],
                    "team": row[idx("TEAM")],
                    "gp": row[idx("GP")],
                    "value": row[idx(stat)],
                }
                for row in rs["rowSet"][:10]
            ],
            "stat": stat,
        }
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


@app.get("/api/standings")
def get_standings():
    cache_key = "standings"
    cached = cache_get(cache_key, ttl_minutes=60)
    if cached:
        return cached

    try:
        def fetch():
            return leaguestandingsv3.LeagueStandingsV3()

        standings = retry_api_call(fetch)
        data = standings.get_dict()
        rs = data["resultSets"][0]
        headers = rs["headers"]

        def idx(name): return headers.index(name) if name in headers else -1

        east, west = [], []
        for row in rs["rowSet"]:
            conference = row[idx("Conference")]
            team_data = {
                "team_id": row[idx("TeamID")],
                "city": row[idx("TeamCity")],
                "name": row[idx("TeamName")],
                "wins": row[idx("WINS")],
                "losses": row[idx("LOSSES")],
                "pct": row[idx("WinPCT")],
                "rank": row[idx("PlayoffRank")],
                "clinch": row[idx("ClinchIndicator")] if idx("ClinchIndicator") >= 0 else "",
                "home": row[idx("HOME")] if idx("HOME") >= 0 else "",
                "road": row[idx("ROAD")] if idx("ROAD") >= 0 else "",
                "l10": row[idx("L10")] if idx("L10") >= 0 else "",
                "streak": row[idx("strCurrentStreak")] if idx("strCurrentStreak") >= 0 else "",
            }
            if conference == "East":
                east.append(team_data)
            else:
                west.append(team_data)

        east.sort(key=lambda x: x["rank"])
        west.sort(key=lambda x: x["rank"])
        result = {"east": east, "west": west}
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"NBA API timeout or error: {str(e)}")


# ---------------------------------------------------------------------------
# Cache management
# ---------------------------------------------------------------------------
@app.get("/api/cache/stats")
def get_cache_stats():
    return {
        "entries": len(_cache),
        "keys": list(_cache.iterkeys()),
    }


@app.post("/api/cache/clear")
def clear_cache():
    _cache.clear()
    return {"message": "Cache cleared successfully"}


# ---------------------------------------------------------------------------
# NFL endpoints — powered by ESPN public API
# ---------------------------------------------------------------------------
_NFL_ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"
_NFL_HEADERS = {"User-Agent": "ghp-index/1.0"}

# Static conference / division mapping — won't change unless expansion
_NFL_CONF_DIV: dict[str, tuple[str, str]] = {}
for _conf, _divs in {
    "AFC": {
        "East":  ["BUF", "MIA", "NE",  "NYJ"],
        "North": ["BAL", "CIN", "CLE", "PIT"],
        "South": ["HOU", "IND", "JAX", "TEN"],
        "West":  ["DEN", "KC",  "LV",  "LAC"],
    },
    "NFC": {
        "East":  ["DAL", "NYG", "PHI", "WAS"],
        "North": ["CHI", "DET", "GB",  "MIN"],
        "South": ["ATL", "CAR", "NO",  "TB"],
        "West":  ["ARI", "LAR", "SF",  "SEA"],
    },
}.items():
    for _div, _abbrs in _divs.items():
        for _abbr in _abbrs:
            _NFL_CONF_DIV[_abbr] = (_conf, _div)


def _espn_get(url: str, timeout: int = 10) -> dict:
    resp = requests.get(url, timeout=timeout, headers=_NFL_HEADERS)
    resp.raise_for_status()
    return resp.json()


def _parse_nfl_record(record_obj: dict) -> tuple[str, int, int]:
    """Extract (summary, wins, losses) from an ESPN record object."""
    items = record_obj.get("items", [{}]) if record_obj else [{}]
    first = items[0] if items else {}
    summary = first.get("summary", "0-0")
    stats = first.get("stats", [])
    wins   = int(next((s["value"] for s in stats if s["name"] == "wins"),   0))
    losses = int(next((s["value"] for s in stats if s["name"] == "losses"), 0))
    return summary, wins, losses


def _team_logo(t: dict) -> str:
    logos = t.get("logos", [])
    return logos[0]["href"] if logos else ""


@app.get("/api/nfl/teams")
def get_nfl_teams():
    cache_key = "nfl_teams"
    cached = cache_get(cache_key, ttl_minutes=60)
    if cached:
        return cached

    try:
        data = retry_api_call(
            lambda: _espn_get(f"{_NFL_ESPN_BASE}/teams?limit=32")
        )
        raw = data["sports"][0]["leagues"][0]["teams"]

        out = []
        for item in raw:
            t = item["team"]
            abbr = t["abbreviation"]
            conf, div = _NFL_CONF_DIV.get(abbr, ("", ""))
            summary, wins, losses = _parse_nfl_record(item.get("record", {}))
            out.append({
                "id":              t["id"],
                "abbreviation":    abbr,
                "display_name":    t["displayName"],
                "nickname":        t.get("nickname") or t.get("name", ""),
                "location":        t.get("location", ""),
                "color":           f"#{t.get('color', '1a1a1a')}",
                "alternate_color": f"#{t.get('alternateColor', 'ffffff')}",
                "logo":            _team_logo(t),
                "conference":      conf,
                "division":        div,
                "record":          summary,
                "wins":            wins,
                "losses":          losses,
            })

        out.sort(key=lambda x: (x["conference"], x["division"], x["display_name"]))
        cache_set(cache_key, out)
        return out

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"ESPN API error: {str(e)}")


@app.get("/api/nfl/teams/{team_id}")
def get_nfl_team(team_id: str):
    cache_key = f"nfl_team_{team_id}"
    cached = cache_get(cache_key, ttl_minutes=30)
    if cached:
        return cached

    try:
        data = retry_api_call(
            lambda: _espn_get(f"{_NFL_ESPN_BASE}/teams/{team_id}")
        )
        t = data["team"]
        abbr = t["abbreviation"]
        conf, div = _NFL_CONF_DIV.get(abbr, ("", ""))
        summary, wins, losses = _parse_nfl_record(t.get("record", {}))

        # Schedule
        sched_data = retry_api_call(
            lambda: _espn_get(f"{_NFL_ESPN_BASE}/teams/{team_id}/schedule")
        )
        games = []
        for event in sched_data.get("events", []):
            comps = event.get("competitions", [{}])
            comp  = comps[0] if comps else {}
            competitors = comp.get("competitors", [])
            status_type = comp.get("status", {}).get("type", {})
            completed   = bool(status_type.get("completed", False))

            home_comp = next((c for c in competitors if c.get("homeAway") == "home"), {})
            away_comp = next((c for c in competitors if c.get("homeAway") == "away"), {})
            home_team = home_comp.get("team", {})
            away_team = away_comp.get("team", {})

            is_home    = home_team.get("abbreviation") == abbr
            this_comp  = home_comp if is_home else away_comp
            opp_comp   = away_comp if is_home else home_comp
            opp_team   = away_team if is_home else home_team

            opp_logos  = opp_team.get("logos", [])
            opp_logo   = opp_logos[0]["href"] if opp_logos else ""

            result = ""
            if completed:
                if this_comp.get("winner"):
                    result = "W"
                elif opp_comp.get("winner"):
                    result = "L"
                else:
                    result = "T"

            def _score(comp_obj: dict) -> Optional[int]:
                raw = comp_obj.get("score")
                try:
                    return int(raw) if raw is not None else None
                except (ValueError, TypeError):
                    return None

            games.append({
                "id":            event.get("id"),
                "date":          event.get("date"),
                "week":          event.get("week", {}).get("number"),
                "opponent_abbr": opp_team.get("abbreviation", ""),
                "opponent_id":   opp_team.get("id", ""),
                "opponent_name": opp_team.get("displayName", ""),
                "opponent_logo": opp_logo,
                "is_home":       is_home,
                "this_score":    _score(this_comp) if completed else None,
                "opp_score":     _score(opp_comp)  if completed else None,
                "result":        result,
                "completed":     completed,
                "status_text":   status_type.get("description", ""),
            })

        result_obj = {
            "id":              t["id"],
            "abbreviation":    abbr,
            "display_name":    t["displayName"],
            "nickname":        t.get("nickname") or t.get("name", ""),
            "location":        t.get("location", ""),
            "color":           f"#{t.get('color', '1a1a1a')}",
            "alternate_color": f"#{t.get('alternateColor', 'ffffff')}",
            "logo":            _team_logo(t),
            "conference":      conf,
            "division":        div,
            "record":          summary,
            "wins":            wins,
            "losses":          losses,
            "schedule":        games,
        }
        cache_set(cache_key, result_obj)
        return result_obj

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"ESPN API error: {str(e)}")


@app.get("/api/nfl/scoreboard")
def get_nfl_scoreboard():
    cache_key = "nfl_scoreboard"
    cached = cache_get(cache_key, ttl_minutes=5)
    if cached:
        return cached

    try:
        data = retry_api_call(
            lambda: _espn_get(f"{_NFL_ESPN_BASE}/scoreboard")
        )
        games_out = []
        for event in data.get("events", []):
            comp        = (event.get("competitions") or [{}])[0]
            competitors = comp.get("competitors", [])
            status_type = comp.get("status", {}).get("type", {})
            status_disp = comp.get("status", {}).get("displayClock", "")

            home_comp = next((c for c in competitors if c.get("homeAway") == "home"), {})
            away_comp = next((c for c in competitors if c.get("homeAway") == "away"), {})
            home_team = home_comp.get("team", {})
            away_team = away_comp.get("team", {})

            def _rec(comp_obj):
                recs = comp_obj.get("records", [])
                return recs[0].get("summary", "") if recs else ""

            games_out.append({
                "id":          event.get("id"),
                "date":        event.get("date"),
                "name":        event.get("name"),
                "status":      status_type.get("description", ""),
                "completed":   bool(status_type.get("completed", False)),
                "clock":       status_disp,
                "period":      comp.get("status", {}).get("period", 0),
                "home_id":     home_team.get("id"),
                "home_abbr":   home_team.get("abbreviation"),
                "home_logo":   _team_logo(home_team),
                "home_score":  home_comp.get("score"),
                "home_record": _rec(home_comp),
                "away_id":     away_team.get("id"),
                "away_abbr":   away_team.get("abbreviation"),
                "away_logo":   _team_logo(away_team),
                "away_score":  away_comp.get("score"),
                "away_record": _rec(away_comp),
            })

        result = {
            "games":  games_out,
            "season": data.get("season", {}).get("year"),
            "week":   data.get("week", {}).get("number"),
        }
        cache_set(cache_key, result)
        return result

    except Exception as e:
        stale = cache_get_stale(cache_key)
        if stale:
            return stale
        raise HTTPException(status_code=503, detail=f"ESPN API error: {str(e)}")
