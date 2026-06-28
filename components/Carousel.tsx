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

// จำนวน copy ของรายการ — buffer ใหญ่เผื่อการเลื่อนก่อน re-anchor
const COPY_COUNT = 5;
// index ของ copy ตรงกลาง (COPY_COUNT เป็นเลขคี่)
const MIDDLE_COPY = Math.floor(COPY_COUNT / 2);
// ระยะหน่วง (ms) หลัง scroll หยุด ก่อนจะ re-anchor กลับ copy กลาง
const SETTLE_DELAY = 120;

export default function Carousel({
  characters,
  selectedId,
  onCenteredChange,
  requestedScrollToId,
}: Props) {
  const loop = React.useMemo(() => {
    const base = characters;
    if (base.length === 0) return [] as Character[];
    return Array.from({ length: COPY_COUNT }, () => base).flat();
  }, [characters]);

  const baseCount = characters.length;
  const totalCount = loop.length;
  const middleStart = MIDDLE_COPY * baseCount;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  // tracking ว่ากำลังทำ programmatic jump อยู่ เพื่อไม่ให้ scroll event รบกวน
  const jumping = React.useRef(false);
  // physical index ที่ track ล่าสุด (source of truth สำหรับการเลื่อน)
  const physicalRef = React.useRef(middleStart);

  // centerIndex เก็บค่า LOGICAL (0..baseCount-1) สำหรับ highlight/report
  const [centerIndex, setCenterIndex] = React.useState(0);
  // physicalIndex เก็บค่า PHYSICAL (0..totalCount-1) สำหรับ render highlight
  const [physicalIndex, setPhysicalIndex] = React.useState(middleStart);

  // หา physical item ที่ใกล้ศูนย์กลาง viewport ที่สุด โดยวัดจาก DOM จริง
  // → ทำงานถูกต้องทุกขนาดหน้าจอ / padding / gap โดยอัตโนมัติ
  const getClosestPhysical = React.useCallback((): number => {
    const el = containerRef.current;
    if (!el) return middleStart;

    const flex = el.firstElementChild as HTMLElement | null;
    if (!flex) return middleStart;

    const containerRect = el.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closest = middleStart;
    let minDist = Infinity;

    for (let i = 0; i < flex.children.length; i++) {
      const child = flex.children[i] as HTMLElement;
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const dist = Math.abs(childCenter - containerCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }

    return closest;
  }, [middleStart]);

  // คำนวณ scrollLeft ที่ทำให้ physical item `index` อยู่กึ่งกลาง viewport
  const scrollToPhysical = React.useCallback(
    (index: number, behavior: ScrollBehavior = "auto") => {
      const el = containerRef.current;
      const flex = el?.firstElementChild as HTMLElement | null;
      if (!el || !flex) return;

      const child = flex.children[index] as HTMLElement | undefined;
      if (!child) return;

      const containerRect = el.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const targetLeft =
        el.scrollLeft +
        (childRect.left -
          containerRect.left -
          (containerRect.width - childRect.width) / 2);

      el.scrollTo({ left: targetLeft, behavior });
    },
    [],
  );

  // กระโดดไป physical index แบบ instant (พราวตา) — ใช้สำหรับ re-anchor
  // user มองไม่เห็นการกระโดดเพราะภาพการ์ดเหมือนกันในทุก copy
  const jumpInstantly = React.useCallback((index: number) => {
    const el = containerRef.current;
    const flex = el?.firstElementChild as HTMLElement | null;
    if (!el || !flex) return;

    const child = flex.children[index] as HTMLElement | undefined;
    if (!child) return;

    const containerRect = el.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const targetLeft =
      el.scrollLeft +
      (childRect.left -
        containerRect.left -
        (containerRect.width - childRect.width) / 2);

    jumping.current = true;
    el.style.scrollBehavior = "auto";
    el.scrollTo({ left: targetLeft, behavior: "auto" });
    // ปลด flag หลัง commit เฟรมถัดไป เพื่อให้ scroll event ที่เกิดจาก jump ถูกข้าม
    requestAnimationFrame(() => {
      jumping.current = false;
    });
  }, []);

  // ตั้ง physical index (ทั้ง ref, state และ logical state)
  const setPhysical = React.useCallback(
    (physical: number) => {
      physicalRef.current = physical;
      setPhysicalIndex(physical);
      setCenterIndex(mod(physical, baseCount));
    },
    [baseCount],
  );

  // Re-anchor: ถ้าตอน idle physical scroll อยู่นอก copy กลาง → jump instant กลับ copy กลาง
  // ที่ logical index เดียวกัน
  const reanchor = React.useCallback(() => {
    if (baseCount === 0) return;

    const physical = getClosestPhysical();
    const currentCopy = Math.floor(physical / baseCount);

    if (currentCopy === MIDDLE_COPY) {
      setPhysical(physical);
      return;
    }

    // กระโดดกลับ copy กลางที่ logical index เดียวกัน
    const logical = mod(physical, baseCount);
    jumpInstantly(middleStart + logical);
    setPhysical(middleStart + logical);
  }, [baseCount, getClosestPhysical, jumpInstantly, middleStart, setPhysical]);

  // เริ่มต้นที่ copy กลาง
  React.useLayoutEffect(() => {
    if (!containerRef.current || baseCount === 0) return;
    const start = middleStart;
    setPhysical(start);
    scrollToPhysical(start, "auto");
  }, [baseCount, middleStart, scrollToPhysical, setPhysical]);

  // ตอบสนองคำขอ scroll ไปยัง id ใด id หนึ่ง
  React.useEffect(() => {
    if (!requestedScrollToId) return;
    if (!containerRef.current) return;
    if (baseCount === 0) return;

    const idx = characters.findIndex((c) => c.id === requestedScrollToId);
    if (idx < 0) return;

    const target = middleStart + idx;
    setPhysical(target);
    scrollToPhysical(target, "smooth");
  }, [requestedScrollToId, baseCount, characters, middleStart, scrollToPhysical, setPhysical]);

  // แจ้ง id ที่อยู่ตรงกลางให้ parent
  React.useEffect(() => {
    if (baseCount === 0) return;
    const id = characters[centerIndex]?.id;
    if (id) onCenteredChange?.(id);
  }, [centerIndex, baseCount, characters, onCenteredChange]);

  // scroll listener — อัปเดต highlight ทันที, re-anchor เมื่อ scroll หยุดนิ่ง
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      // ข้าม scroll event ที่เกิดจาก jump instant ของเราเอง
      if (jumping.current) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const physical = getClosestPhysical();
        setCenterIndex(mod(physical, baseCount));
      });

      // re-anchor หลัง scroll หยุดนิ่ง SETTLE_DELAY ms
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(reanchor, SETTLE_DELAY);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      if (settleTimer) clearTimeout(settleTimer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [getClosestPhysical, reanchor, baseCount]);

  // คงการ์ดตรงกลางเมื่อ viewport เปลี่ยนขนาด (resize / หมุนจอ)
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      scrollToPhysical(physicalRef.current, "auto");
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollToPhysical]);

  // scrollBy แบบ infinity แท้ — เลื่อนไปข้างเคียงจริงเสมอ (current physical + dir)
  // ไม่มีการ mod logical ที่ทำให้ย้อนกลับ → ไม่มี "เด้งกลับอันแรก"
  // เมื่อเลยขอบ buffer → jump instant กลับตำแหน่งเทียบเท่าใน copy กลางก่อน แล้วค่อยเลื่อนต่อ
  const scrollBy = (dir: -1 | 1) => {
    if (!containerRef.current || baseCount === 0) return;

    const current = physicalRef.current;
    let target = current + dir;

    // หลุดขอบ buffer → jump instant กลับ copy กลางที่ logical เดียวกับ current ก่อน
    // แล้วค่อนเลื่อนต่อ 1 ก้าว (ทำให้รู้สึกต่อเนื่อง)
    if (target < 0 || target >= totalCount) {
      const currentLogical = mod(current, baseCount);
      const recentered = middleStart + currentLogical;
      jumpInstantly(recentered);
      physicalRef.current = recentered;
      target = recentered + dir;
    }

    setPhysical(target);
    scrollToPhysical(target, "smooth");
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
        className="flex items-center justify-center absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 text-slate-800 hover:bg-white active:scale-95 transition"
        aria-label="Previous"
      >
        <span className="text-lg sm:text-xl leading-none">‹</span>
      </button>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        className="flex items-center justify-center absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 text-slate-800 hover:bg-white active:scale-95 transition"
        aria-label="Next"
      >
        <span className="text-lg sm:text-xl leading-none">›</span>
      </button>

      <div
        ref={containerRef}
        className="mx-auto w-full overflow-x-auto no-scrollbar px-4 sm:px-10"
        style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "auto" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="flex items-center gap-4 sm:gap-6 py-10">
          {loop.map((c, i) => {
            const isCenter = i === physicalIndex;
            const isSelected = selectedId ? c.id === selectedId : isCenter;
            return (
              <div
                key={`${c.id}-${i}`}
                className={
                  "shrink-0 transition-transform duration-300 ease-out will-change-transform " +
                  (isCenter
                    ? "scale-[1.04] sm:scale-[1.08] opacity-100"
                    : "scale-[0.96] sm:scale-[0.98] opacity-80")
                }
              >
                <div className="w-[300px] sm:w-[380px]">
                  <CharacterCard character={c} selected={isSelected} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
