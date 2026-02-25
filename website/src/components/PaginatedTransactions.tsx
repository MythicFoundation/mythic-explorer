"use client";

import { useState } from "react";
import Link from "next/link";

interface Transaction {
  signature: string;
  slot: number;
  time: string | null;
  success: boolean;
}

interface Props {
  initialTransactions: Transaction[];
  address: string;
  network: string;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncateSig(sig: string): string {
  if (sig.length <= 16) return sig;
  return sig.slice(0, 8) + "\u2026" + sig.slice(-8);
}

export default function PaginatedTransactions({ initialTransactions, address, network }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTransactions.length >= 25);

  const loadMore = async () => {
    if (loading || !hasMore || transactions.length === 0) return;
    setLoading(true);
    try {
      const lastSig = transactions[transactions.length - 1].signature;
      const res = await fetch(
        `/api/address-txs?address=${encodeURIComponent(address)}&before=${encodeURIComponent(lastSig)}&network=${encodeURIComponent(network)}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const newTxs: Transaction[] = await res.json();
      setTransactions((prev) => [...prev, ...newTxs]);
      if (newTxs.length < 25) setHasMore(false);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  if (transactions.length === 0) return null;

  return (
    <div className="bg-mythic-surface border border-mythic-border">
      <div className="px-4 py-3 border-b border-mythic-border flex items-center justify-between">
        <h2 className="font-heading font-semibold text-sm text-white">
          Transaction History ({transactions.length}{hasMore ? "+" : ""})
        </h2>
      </div>

      {/* Header row */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 border-b border-mythic-border/50">
        <span className="text-mythic-muted text-[10px] uppercase tracking-wider">Signature</span>
        <span className="text-mythic-muted text-[10px] uppercase tracking-wider text-right w-24">Time</span>
        <span className="text-mythic-muted text-[10px] uppercase tracking-wider text-right w-28">Slot</span>
      </div>

      <div className="divide-y divide-mythic-border">
        {transactions.map((tx) => (
          <Link
            key={tx.signature}
            href={`/${network}/tx/${tx.signature}`}
            className="grid sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 items-center px-4 py-3 hover:bg-mythic-border/30 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-block w-1.5 h-1.5 flex-shrink-0 ${
                  tx.success ? "bg-mythic-green" : "bg-red-400"
                }`}
              />
              <span className="font-mono text-xs text-mythic-green truncate">
                {truncateSig(tx.signature)}
              </span>
            </div>
            <span className="text-mythic-muted text-xs font-mono text-right w-24">
              {timeAgo(tx.time)}
            </span>
            <span className="text-mythic-muted text-xs font-mono text-right w-28">
              {tx.slot.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="px-4 py-3 border-t border-mythic-border">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-2.5 bg-mythic-green/10 border border-mythic-green/30 text-mythic-green text-xs font-heading font-semibold uppercase tracking-wider hover:bg-mythic-green/20 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
