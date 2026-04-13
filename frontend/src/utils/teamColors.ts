// Primary brand colors for each NBA team (by team ID)
const TEAM_COLORS: Record<number, string> = {
  1610612737: "#E03A3E", // Atlanta Hawks
  1610612738: "#007A33", // Boston Celtics
  1610612739: "#860038", // Cleveland Cavaliers
  1610612740: "#0C2340", // New Orleans Pelicans
  1610612741: "#CE1141", // Chicago Bulls
  1610612742: "#00538C", // Dallas Mavericks
  1610612743: "#0E2240", // Denver Nuggets
  1610612744: "#1D428A", // Golden State Warriors
  1610612745: "#CE1141", // Houston Rockets
  1610612746: "#C8102E", // LA Clippers
  1610612747: "#552583", // Los Angeles Lakers
  1610612748: "#98002E", // Miami Heat
  1610612749: "#00471B", // Milwaukee Bucks
  1610612750: "#0C2340", // Minnesota Timberwolves
  1610612751: "#000000", // Brooklyn Nets
  1610612752: "#006BB6", // New York Knicks
  1610612753: "#0077C0", // Orlando Magic
  1610612754: "#002D62", // Indiana Pacers
  1610612755: "#006BB6", // Philadelphia 76ers
  1610612756: "#1D1160", // Phoenix Suns
  1610612757: "#E03A3E", // Portland Trail Blazers
  1610612758: "#5A2D81", // Sacramento Kings
  1610612759: "#C4CED4", // San Antonio Spurs
  1610612760: "#007AC1", // Oklahoma City Thunder
  1610612761: "#CE1141", // Toronto Raptors
  1610612762: "#002B5C", // Utah Jazz
  1610612763: "#5D76A9", // Memphis Grizzlies
  1610612764: "#002B5C", // Washington Wizards
  1610612765: "#C8102E", // Detroit Pistons
  1610612766: "#00788C", // Charlotte Hornets
};

export function getTeamColor(teamId: number | string): string {
  return TEAM_COLORS[Number(teamId)] ?? "#38bdf8"; // fallback to accent
}
