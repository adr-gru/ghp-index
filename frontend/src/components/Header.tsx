import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-[#93BFB7]/40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link href="/">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#387373]">GHP</span>
            <span className="text-[#2D3E40]">-Index</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
