"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function BasketballIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 2.5C9.8 5.8 9 9 9 12s.8 6.2 3 9.5M12 2.5c2.2 3.3 3 6.5 3 9.5s-.8 6.2-3 9.5M2.5 12h19" />
    </svg>
  );
}

function FootballIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
      <ellipse cx="12" cy="12" rx="9" ry="5.5" transform="rotate(-45 12 12)" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
      <line x1="10" y1="7" x2="7" y2="10" />
      <line x1="14" y1="17" x2="17" y2="14" />
    </svg>
  );
}

function BaseballIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8.5 4.5C9.5 7 9.5 9.5 8.5 12s-1 7.5 0 8" />
      <path d="M15.5 4.5C14.5 7 14.5 9.5 15.5 12s1 7.5 0 8" />
    </svg>
  );
}

function HockeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
      <line x1="5" y1="5" x2="5" y2="16" />
      <path d="M5 16 Q5 19 9 19 H15 Q19 19 19 16" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="9.5" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <circle cx="12" cy="7.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

const leagues = [
  { label: "NBA", href: "/nba", icon: <BasketballIcon /> },
  { label: "NFL", href: "/nfl", icon: <FootballIcon /> },
  { label: "MLB", href: "/mlb", icon: <BaseballIcon /> },
  { label: "NHL", href: "/nhl", icon: <HockeyIcon /> },
  { label: "About", href: "/about", icon: <InfoIcon /> },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1e293b] border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
        {leagues.map(({ label, href, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-3 border-b-2 transition-colors ${
                isActive
                  ? "text-white border-white"
                  : "text-slate-400 border-transparent hover:text-white"
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
