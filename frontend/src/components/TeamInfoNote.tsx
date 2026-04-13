//import Link from "next/link";
//leave for future, possibly adding conference pages etc...

interface TeamInfoValue {
  title: string;
  info: string;
}

export default function TeamInfoNote({ title, info }: TeamInfoValue) {
  return (
    <div className="bg-base rounded-md px-4 py-2 border border-edge">
      <p className="text-xs text-secondary font-medium">{title}</p>
      <p className="text-lg font-bold text-primary mt-0.5">{info}</p>
    </div>
  );
}
