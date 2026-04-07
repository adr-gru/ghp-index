//import Link from "next/link";
//leave for future, possibly adding conference pages etc...

interface TeamInfoValue {
  title: string;
  info: string;
}

export default function TeamInfoNote({ title, info }: TeamInfoValue) {
  return (
    <div className="bg-[#0f172a] rounded-md px-4 py-2 border border-[#334155]">
      <p className="text-xs text-[#94a3b8] font-medium">{title}</p>
      <p className="text-lg font-bold text-[#f1f5f9] mt-0.5">{info}</p>
    </div>
  );
}
