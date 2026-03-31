import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-white border-b border-[#93BFB7]/30">
      <div className="max-w-7xl mx-auto px-6 flex gap-1">
        <Link href="/nba" className="text-xs font-semibold tracking-widest uppercase text-[#97A6A0] hover:text-[#387373] px-3 py-3 border-b-2 border-transparent hover:border-[#387373] transition-colors">NBA</Link>
        <Link href="/nfl" className="text-xs font-semibold tracking-widest uppercase text-[#97A6A0] hover:text-[#387373] px-3 py-3 border-b-2 border-transparent hover:border-[#387373] transition-colors">NFL</Link>
        <Link href="/mlb" className="text-xs font-semibold tracking-widest uppercase text-[#97A6A0] hover:text-[#387373] px-3 py-3 border-b-2 border-transparent hover:border-[#387373] transition-colors">MLB</Link>
        <Link href="/nhl" className="text-xs font-semibold tracking-widest uppercase text-[#97A6A0] hover:text-[#387373] px-3 py-3 border-b-2 border-transparent hover:border-[#387373] transition-colors">NHL</Link>
      </div>
    </nav>
  );
}
