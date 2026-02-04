
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="flex gap-4 p-4 border-b border-zinc-800">
      <Link href="/nba" className="hover:text-orange-500">NBA</Link>
      <Link href="/nfl" className="hover:text-orange-500">NFL</Link>
      <Link href="/mlb" className="hover:text-orange-500">MLB</Link>
      <Link href="/nhl" className="hover:text-orange-500">NHL</Link>
      <Link href="/players" className="hover:text-orange-500">Players</Link>
    </nav>
  );

}