import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#0f172a] border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link href="/">
          <span className="text-xl font-bold text-[#f1f5f9] tracking-tight">GHP-Index</span>
        </Link>
      </div>
    </header>
  );
}
