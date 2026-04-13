"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const leagues = [
  { label: "NBA", href: "/nba" },
  { label: "NFL", href: "/nfl" },
  { label: "MLB", href: "/mlb" },
  { label: "NHL", href: "/nhl" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-edge">
      <div className="max-w-7xl mx-auto px-6 flex gap-1">
        {leagues.map(({ label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium px-3 py-3 border-b-2 transition-colors ${
                isActive
                  ? "text-accent border-accent"
                  : "text-secondary border-transparent hover:text-primary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
