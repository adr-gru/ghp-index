//import Link from "next/link";
//leave for future, possibly adding conference pages etc...

interface TeamInfoValue {
  title: string;
  info: string;
  accentColor?: string;
  teamColor?: string;
}

export default function TeamInfoNote({ title, info, accentColor = "border-l-edge", teamColor }: TeamInfoValue) {
  return (
    <div
      className={`bg-card rounded-md px-4 py-2 border border-edge border-l-4 ${teamColor ? "" : accentColor}`}
      style={teamColor ? { borderLeftColor: teamColor } : undefined}
    >
      <p className="text-xs text-secondary font-medium">{title}</p>
      <p className="text-lg font-bold text-primary mt-0.5">{info}</p>
    </div>
  );
}
