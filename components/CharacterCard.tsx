import Image from "next/image";
import Link from "next/link";

import type { Character } from "@/data/characters";

type Props = {
  character: Character;
  selected?: boolean;
};

export default function CharacterCard({ character, selected }: Props) {
  return (
    <Link
      href={`/character/${character.id}`}
      className={
        "group relative block w-[280px] sm:w-[340px] select-none " +
        "transition-transform duration-300 ease-out focus:outline-none"
      }
      aria-label={`Open ${character.name}`}
    >
      <div
        className={
          "relative overflow-hidden rounded-[28px] p-6 sm:p-7 " +
          "shadow-[0_18px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 " +
          "transition-all duration-300 ease-out " +
          "group-hover:shadow-[0_22px_80px_rgba(99,102,241,0.20)] " +
          (selected
            ? "ring-2 ring-indigo-500/60 shadow-[0_22px_90px_rgba(99,102,241,0.25)]"
            : "")
        }
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-200/60 via-sky-100/70 to-rose-200/60" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative">
          <div className="relative mx-auto h-[210px] w-[210px] sm:h-[240px] sm:w-[240px]">
            <div className="absolute inset-0 rounded-full bg-white/45 blur-2xl" />
            <Image
              src={character.image}
              alt={character.name}
              fill
              sizes="(max-width: 640px) 210px, 240px"
              className="object-contain drop-shadow-[0_30px_40px_rgba(2,6,23,0.18)] animate-float"
              priority={false}
            />
          </div>

          <div className="mt-6 text-center">
            <div className="text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-900">
              {character.name}
            </div>
            <div className="mt-1 text-sm text-slate-600">{character.source}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
