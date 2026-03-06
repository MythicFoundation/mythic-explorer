"use client";

import { useState } from "react";
import Link from "next/link";

interface Transaction {
  signature: string;
  slot: number;
  time: string | null;
  success: boolean;
  memo?: string | null;
}

interface Props {
  initialTransactions: Transaction[];
  address: string;
  network: string;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "--";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return seconds + "s ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

function truncSig(sig: string): string {
  if (sig.length <= 20) return sig;
  return sig.slice(0, 10) + "..." + sig.slice(-10);
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
        "/api/address-txs?address=" + encodeURIComponent(address) + "&before=" + encodeURIComponent(lastSig) + "&network=" + encodeURIComponent(network)
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

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="font-mono text-[0.7rem] text-text-400">No transactions found for this address</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
        <h2 className="font-display font-semibold text-[0.8rem] text-text-200">Transaction History</h2>
        <span className="badge badge-violet">
          {transactions.length}{hasMore ? "+" : ""}
        </span>
      </div>

      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-2 border-b border-white/[0.06]">
        <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-text-400 w-2"></span>
        <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-text-400">Signature</span>
        <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-text-400 text-right w-24">Time</span>
        <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-text-400 text-right w-28">Slot</span>
      </div>

      <div>
        {transactions.map((tx) => (
          <Link
            key={tx.signature}
            href={"/" + network + "/tx/" + tx.signature}
            className="grid sm:grid-cols-[auto_1fr_auto_auto] gap-2 sm:gap-4 items-center px-5 py-3 border-b border-white/[0.06] table-row"
          >
            <span
              className={"inline-block w-2 h-2 flex-shrink-0 " +
                (tx.success ? "bg-[#39FF14]" : "bg-[#F87171]")
              }
            />
            <span className="font-mono text-[0.7rem] text-text-200 truncate">
              {truncSig(tx.signature)}
            </span>
            <span className="font-mono text-[0.65rem] text-text-400 text-right w-24">
              {timeAgo(tx.time)}
            </span>
            <span className="font-mono text-[0.65rem] text-text-400 text-right w-28">
              {tx.slot.toLocaleString("en-US")}
            </span>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="px-5 py-4 border-t border-white/[0.08]">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-3 bg-bg-2 border border-white/[0.08] text-text-200 font-mono text-[0.65rem] tracking-[0.08em] uppercase hover:border-[#7B2FFF]/30 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              "Load More Transactions"
            )}
          </button>
        </div>
      )}
    </div>
  );
}