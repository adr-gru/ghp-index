import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-card border-b border-edge">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link href="/">
          <span className="text-xl font-bold text-primary tracking-tight">GHP-Index</span>
        </Link>
      </div>
    </header>
  );
}
