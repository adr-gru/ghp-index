import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#0f172a] border-b border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold text-white tracking-tight">GHP-Index</span>
        </Link>
        <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
          About
        </Link>
      </div>
    </header>
  );
}
