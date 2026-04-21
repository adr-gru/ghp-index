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
    <nav className="bg-[#1e293b] border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
        {leagues.map(({ label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium px-3 py-3 border-b-2 transition-colors ${
                isActive
                  ? "text-white border-white"
                  : "text-slate-400 border-transparent hover:text-white"
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
