"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ network = "mainnet" }: { network?: string }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    const base = "/" + network;
    if (v.length >= 80) router.push(base + "/tx/" + v);
    else if (/^\d+$/.test(v)) router.push(base + "/block/" + v);
    else router.push(base + "/address/" + v);
  }

  return (
    <form onSubmit={go} className="w-full">
      <div className={"relative bg-[#0C0C14] border transition-all duration-300 " + (focused ? "border-[#39FF14]/30 glow-green" : "border-[#39FF14]/[0.06]")}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? "#39FF14" : "#555568"} strokeWidth="2" className="transition-colors duration-300">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="Search by address, tx signature, or block slot..."
          className="w-full bg-transparent pl-11 pr-24 py-3.5 font-mono text-[0.7rem] tracking-[0.02em] text-white placeholder:text-[#555568] focus:outline-none" />
        <button type="submit" className="absolute right-0 top-0 h-full px-5 border-l border-[#39FF14]/[0.06] font-mono text-[0.6rem] tracking-[0.12em] uppercase text-[#39FF14]/70 hover:text-[#39FF14] hover:bg-[#39FF14]/[0.03] transition-colors">
          Search
        </button>
      </div>
    </form>
  );
}
