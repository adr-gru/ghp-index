//import Link from "next/link"; 
//leave for future, possibly adding conference pages etc...

interface TeamInfoValue {
  title: string;
  info: string;
}

export default function TeamInfoNote({ title, info }: TeamInfoValue) {
  return (
    <div className="bg-[#E4F2E7]/60 rounded-lg px-4 py-2 border border-[#93BFB7]/40">
      <p className="text-xs text-[#97A6A0] uppercase tracking-wider font-semibold">{title}</p>
      <p className="text-lg font-bold text-[#2D3E40] mt-0.5">{info}</p>
    </div>
  );
}
