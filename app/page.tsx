"use client";

import * as React from "react";

import Carousel from "@/components/Carousel";
import SearchBar from "@/components/SearchBar";
import { characters } from "@/data/characters";

export default function Home() {
  const [query, setQuery] = React.useState("");
  const [requestedId, setRequestedId] = React.useState<string | undefined>(
    undefined,
  );
  const [centeredId, setCenteredId] = React.useState<string>(characters[0]?.id);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) || c.source.toLowerCase().includes(q)
      );
    });
  }, [query]);

  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const exact = characters.find((c) => c.name.toLowerCase() === q);
    if (exact) setRequestedId(exact.id);
  }, [query]);

  return (
    <div className="min-h-dvh">
      <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center px-4 sm:px-8">
        <div className="pt-10 sm:pt-14 w-full flex flex-col items-center animate-fade-in">
          <div className="text-center">
            <div className="text-sm font-medium text-slate-500">
              Character Gallery
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Choose your favorite mascot
            </h1>
            <div className="mt-3 text-sm sm:text-base text-slate-600">
              Swipe on mobile, or use arrows on desktop.
            </div>
          </div>

          <div className="mt-7 sm:mt-9 flex w-full justify-center">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>

        <div className="w-full flex-1 flex items-center justify-center">
          <Carousel
            characters={filtered.length ? filtered : characters}
            selectedId={requestedId ?? centeredId}
            onCenteredChange={(id) => {
              setCenteredId(id);
              if (requestedId && requestedId === id) {
                window.setTimeout(() => setRequestedId(undefined), 600);
              }
            }}
            requestedScrollToId={requestedId}
          />
        </div>

        <footer className="pb-10 text-xs text-slate-500">
          Click a card to view details.
        </footer>
      </main>
    </div>
  );
}
