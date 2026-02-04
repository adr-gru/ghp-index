import NavBar from "@/components/NavBar";
import Header from "@/components/Header";
import Link from "next/link";

export const metadata = {
  title: "Homepage | GHP-Index",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />

      {/* Navigation */}
      <NavBar />

      {/* Main content area */}
      <main className="p-6">
        <h2 className="text-xl">Dashboard</h2>
        <p className="text-zinc-400">Coming soon...</p>
      </main>
    </div>
  );
}