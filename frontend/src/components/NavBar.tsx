"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const leagues = [
  { label: "NBA", href: "/nba" },
  { label: "NFL", href: "/nfl" },
  { label: "MLB", href: "/mlb" },
  { label: "NHL", href: "/nhl" },
  { label: "About", href: "/nhl" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#0f172a] border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-6 flex gap-1">
        {leagues.map(({ label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium px-3 py-3 border-b-2 transition-colors ${
                isActive
                  ? "text-[#38bdf8] border-[#38bdf8]"
                  : "text-[#94a3b8] border-transparent hover:text-[#f1f5f9]"
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
