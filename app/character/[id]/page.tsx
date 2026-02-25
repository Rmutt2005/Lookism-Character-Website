import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCharacterById } from "@/data/characters";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({ params }: Props) {
  const { id } = await params;
  const character = getCharacterById(id);

  if (!character) notFound();

  return (
    <div className="min-h-dvh">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-10 sm:pt-14 pb-14">
        <div className="animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-4 py-2 text-sm text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 hover:bg-white transition"
          >
            <span className="text-lg leading-none">‹</span>
            Back
          </Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-10 shadow-[0_18px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-200/60 via-sky-100/70 to-rose-200/60" />
              <div className="pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />

              <div className="relative mx-auto h-[320px] w-[320px] sm:h-[420px] sm:w-[420px]">
                <Image
                  src={character.image}
                  alt={character.name}
                  fill
                  sizes="(max-width: 640px) 320px, 420px"
                  className="object-contain drop-shadow-[0_30px_40px_rgba(2,6,23,0.18)] animate-float"
                  priority
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-500">
                {character.source}
              </div>
              <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
                {character.name}
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                {character.description}
              </p>

              <div className="mt-8 rounded-2xl bg-white/60 backdrop-blur-md p-6 ring-1 ring-slate-900/5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <div className="text-sm font-semibold text-slate-900">
                  Extra Info
                </div>
                <div className="mt-2 text-sm text-slate-600 leading-6">
                  Minimal placeholder section for future fields (stats, abilities, roles, etc.).
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
