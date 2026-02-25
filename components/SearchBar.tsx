"use client";

import * as React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="w-full max-w-xl">
      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search a character..."
          className="w-full bg-transparent px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          aria-label="Search characters"
          inputMode="search"
        />
      </div>
    </div>
  );
}
