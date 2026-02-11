import Link from "next/link";
import Image from "next/image";

interface PlayerCardValues {
  id: number
  fullName: string;
  position: string;
  playerNumber: number;
}

export default function PlayerCard({ id, fullName, playerNumber, position }: PlayerCardValues) {
  return (

    <Link
      href={`/nba/players/${id}`}
      className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700">
      <div className="flex item-center">
        <div className="bg-slate-500 rounded-lg w-25 h-22">
          <div className="relative w-24 h-20 items-center justify-center">
            <Image
              src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`}
              alt="Player face"
              fill
            />
          </div>
        </div>


        <div className=" pl-4">
          <h1 className="text-xl">{fullName}</h1>
          <p>#{playerNumber} </p>
          <p>{position}</p>
        </div>
      </div>


    </Link>
  );

}