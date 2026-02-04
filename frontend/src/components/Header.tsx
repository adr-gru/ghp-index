import Link from "next/link";

export default function Header() {
  return (
    <header className="p-6 border-b border-zinc-800">
      <Link href="/">
        <h1 className="text-2xl font-bold">GHP-Index</h1>
      </Link>
    </header>
  );

}