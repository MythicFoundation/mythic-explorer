"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ network = "mainnet" }: { network?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    const base = `/${network}`;
    if (q.length >= 80) {
      router.push(`${base}/tx/${q}`);
    } else if (/^\d+$/.test(q)) {
      router.push(`${base}/block/${q}`);
    } else {
      router.push(`${base}/address/${q}`);
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by address, tx signature, or block slot..."
          className="w-full bg-mythic-surface border border-mythic-border px-4 py-3 pr-24 text-sm font-mono text-mythic-text placeholder:text-mythic-muted/50 focus:outline-none focus:border-mythic-green/50 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-5 bg-mythic-green/10 border-l border-mythic-border text-mythic-green text-sm font-semibold hover:bg-mythic-green/20 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
