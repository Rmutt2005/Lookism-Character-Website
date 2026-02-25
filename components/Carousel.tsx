"use client";

import * as React from "react";

import type { Character } from "@/data/characters";
import CharacterCard from "@/components/CharacterCard";

type Props = {
  characters: Character[];
  selectedId?: string;
  onCenteredChange?: (id: string) => void;
  requestedScrollToId?: string;
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export default function Carousel({
  characters,
  selectedId,
  onCenteredChange,
  requestedScrollToId,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [centerIndex, setCenterIndex] = React.useState(0);
  const itemW = 380;

  const loop = React.useMemo(() => {
    const base = characters;
    if (base.length === 0) return [] as Character[];
    return [...base, ...base, ...base];
  }, [characters]);

  const baseCount = characters.length;

  React.useEffect(() => {
    if (!containerRef.current) return;
    if (baseCount === 0) return;

    const start = baseCount;
    setCenterIndex(start);

    const el = containerRef.current;
    el.scrollLeft = start * itemW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCount]);

  React.useEffect(() => {
    if (!requestedScrollToId) return;
    if (!containerRef.current) return;
    if (baseCount === 0) return;

    const idx = characters.findIndex((c) => c.id === requestedScrollToId);
    if (idx < 0) return;

    const target = baseCount + idx;
    setCenterIndex(target);
    containerRef.current.scrollTo({ left: target * itemW, behavior: "smooth" });
  }, [requestedScrollToId, baseCount, characters]);

  React.useEffect(() => {
    if (baseCount === 0) return;

    const normalized = mod(centerIndex, baseCount);
    const id = characters[normalized]?.id;
    if (id) onCenteredChange?.(id);
  }, [centerIndex, baseCount, characters, onCenteredChange]);

  const reanchorIfNeeded = React.useCallback(() => {
    if (!containerRef.current) return;
    if (baseCount === 0) return;

    const el = containerRef.current;
    const rawIndex = Math.round(el.scrollLeft / itemW);

    if (rawIndex < baseCount * 0.5) {
      const normalized = mod(rawIndex, baseCount);
      const next = baseCount + normalized;
      el.scrollLeft = next * itemW;
      setCenterIndex(next);
      return;
    }

    if (rawIndex > baseCount * 2.5) {
      const normalized = mod(rawIndex, baseCount);
      const next = baseCount + normalized;
      el.scrollLeft = next * itemW;
      setCenterIndex(next);
      return;
    }

    setCenterIndex(rawIndex);
  }, [baseCount, itemW]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        reanchorIfNeeded();
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [reanchorIfNeeded]);

  const scrollBy = (dir: -1 | 1) => {
    if (!containerRef.current) return;
    const next = centerIndex + dir;
    setCenterIndex(next);
    containerRef.current.scrollTo({ left: next * itemW, behavior: "smooth" });
  };

  const pointer = React.useRef<{ x: number; y: number; t: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    pointer.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = pointer.current;
    pointer.current = null;
    if (!p) return;

    const dx = e.clientX - p.x;
    const dt = performance.now() - p.t;

    if (dt < 450 && Math.abs(dx) > 40) {
      scrollBy(dx < 0 ? 1 : -1);
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        className="hidden sm:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 text-slate-800 hover:bg-white transition"
        aria-label="Previous"
      >
        <span className="text-xl leading-none">‹</span>
      </button>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        className="hidden sm:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 text-slate-800 hover:bg-white transition"
        aria-label="Next"
      >
        <span className="text-xl leading-none">›</span>
      </button>

      <div
        ref={containerRef}
        className="mx-auto w-full overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory px-4 sm:px-10"
        style={{ WebkitOverflowScrolling: "touch" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="flex items-center gap-6 py-10">
          {loop.map((c, i) => {
            const isCenter = i === centerIndex;
            const isSelected = selectedId ? c.id === selectedId : isCenter;
            return (
              <div
                key={`${c.id}-${i}`}
                className={
                  "snap-center shrink-0 transition-transform duration-300 ease-out will-change-transform " +
                  (isCenter ? "scale-[1.04] sm:scale-[1.08]" : "scale-[0.96] sm:scale-[0.98] opacity-90")
                }
                style={{ width: itemW }}
              >
                <CharacterCard character={c} selected={isSelected} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
