from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import teams

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