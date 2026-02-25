"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface Block {
  slot: number;
  txCount: number;
  time: string | null;
  parentSlot: number;
}

interface Tx {
  signature: string;
  slot: number;
  success: boolean;
  fee: number;
  time: string | null;
}

interface Stats {
  slot: number;
  blockHeight: number;
  epoch: number;
  epochProgress: number;
  tps?: number;
  blockTimeMs?: number;
  transactionCount?: number;
  totalSupply: number;
  mythSupply?: number;
  l1Supply?: number;
  l2Supply?: number;
  bridgeLocked?: number;
}

interface LiveDashboardProps {
  initialStats: Stats | null;
  initialBlocks: Block[];
  initialTxs: Tx[];
  network: string;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function timeAgo(iso: string | null): string {
  if (!iso) return "--";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function truncSig(sig: string): string {
  if (sig.length <= 16) return sig;
  return sig.slice(0, 8) + "..." + sig.slice(-8);
}

function formatNum(n: number): string {
  return n.toLocaleString();
}

/* ─── Stat card ────────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-mythic-surface border border-mythic-border p-4 transition-colors duration-700 ${
        highlight ? "border-mythic-green/40 bg-mythic-green/5" : ""
      }`}
    >
      <p className="text-mythic-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-heading font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-mythic-muted text-xs mt-1 font-mono">{sub}</p>}
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */

export default function LiveDashboard({
  initialStats,
  initialBlocks,
  initialTxs,
  network,
}: LiveDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(initialStats);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [txs, setTxs] = useState<Tx[]>(initialTxs);
  const [connected, setConnected] = useState(true);
  const [newBlockSlots, setNewBlockSlots] = useState<Set<number>>(new Set());
  const [newTxSigs, setNewTxSigs] = useState<Set<string>>(new Set());
  const [statsChanged, setStatsChanged] = useState(false);
  const prevSlotRef = useRef<number>(initialStats?.slot ?? 0);
  const mountedRef = useRef(true);

  /* ── Fetcher with error handling ── */
  const fetchJSON = useCallback(async (type: string) => {
    try {
      const res = await fetch(`/api/rpc?type=${type}&network=${network}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setConnected(true);
      return await res.json();
    } catch {
      setConnected(false);
      return null;
    }
  }, [network]);

  /* ── Poll blocks ── */
  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(async () => {
      if (!mountedRef.current) return;
      const data = await fetchJSON("blocks");
      if (!data || !Array.isArray(data)) return;
      setBlocks((prev) => {
        const prevSlots = new Set(prev.map((b) => b.slot));
        const fresh = data.filter((b: Block) => !prevSlots.has(b.slot));
        if (fresh.length > 0) {
          setNewBlockSlots(new Set(fresh.map((b: Block) => b.slot)));
          setTimeout(() => setNewBlockSlots(new Set()), 1500);
        }
        return data;
      });
    }, 3000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchJSON, network]);

  /* ── Poll transactions ── */
  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(async () => {
      if (!mountedRef.current) return;
      const data = await fetchJSON("transactions");
      if (!data || !Array.isArray(data)) return;
      setTxs((prev) => {
        const prevSigs = new Set(prev.map((t) => t.signature));
        const fresh = data.filter((t: Tx) => !prevSigs.has(t.signature));
        if (fresh.length > 0) {
          setNewTxSigs(new Set(fresh.map((t: Tx) => t.signature)));
          setTimeout(() => setNewTxSigs(new Set()), 1500);
        }
        return data;
      });
    }, 3000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchJSON, network]);

  /* ── Poll stats ── */
  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(async () => {
      if (!mountedRef.current) return;
      const data = await fetchJSON("stats");
      if (!data) return;
      setStats((prev) => {
        if (prev && data.slot !== prev.slot) {
          setStatsChanged(true);
          setTimeout(() => setStatsChanged(false), 1200);
        }
        prevSlotRef.current = data.slot;
        return data;
      });
    }, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchJSON, network]);

  const netLabel = network === "testnet" ? "Testnet" : "Mainnet";

  return (
    <div className="space-y-6">
      {/* ── Live indicator ── */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 ${
            connected ? "bg-mythic-green pulse-dot" : "bg-red-400"
          }`}
        />
        <span
          className={`text-xs font-mono font-semibold uppercase tracking-widest ${
            connected ? "text-mythic-green" : "text-red-400"
          }`}
        >
          {connected ? "LIVE" : "DISCONNECTED"}
        </span>
        <span className="text-mythic-muted text-xs font-mono ml-2">
          Auto-updating
        </span>
      </div>

      {/* ── Stats grid ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-mythic-border">
          <StatCard
            label="Slot"
            value={formatNum(stats.slot)}
            highlight={statsChanged}
          />
          <StatCard
            label="Block Height"
            value={formatNum(stats.blockHeight)}
            highlight={statsChanged}
          />
          <StatCard
            label="Epoch"
            value={stats.epoch}
            sub={`${stats.epochProgress}% complete`}
          />
          <StatCard
            label="Block Time"
            value={stats.blockTimeMs != null ? `${stats.blockTimeMs}ms` : "\u2014"}
          />
          <StatCard
            label="Transactions"
            value={stats.transactionCount ? formatNum(stats.transactionCount) : "\u2014"}
            highlight={statsChanged}
          />
          <StatCard
            label="Total Supply"
            value={stats.mythSupply ? stats.mythSupply.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "1,000,000,000"}
            sub="$MYTH"
          />
        </div>
      )}

      {/* ── Blocks + Transactions side by side ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Recent Blocks ── */}
        <div className="bg-mythic-surface border border-mythic-border">
          <div className="px-4 py-3 border-b border-mythic-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-white">
              Recent Blocks
            </h2>
            <span className="text-mythic-muted text-[10px] font-mono">
              {blocks.length} shown
            </span>
          </div>
          <div className="divide-y divide-mythic-border">
            {blocks.slice(0, 10).map((b) => {
              const isNew = newBlockSlots.has(b.slot);
              return (
                <Link
                  key={b.slot}
                  href={`/${network}/block/${b.slot}`}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-mythic-border/30 transition-all duration-500 ${
                    isNew
                      ? "bg-mythic-green/10 border-l-2 border-l-mythic-green"
                      : "border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-mythic-green text-sm">
                      {b.slot.toLocaleString()}
                    </span>
                    <span className="text-mythic-muted text-xs">{timeAgo(b.time)}</span>
                  </div>
                  <span className="text-mythic-muted text-xs font-mono">
                    {b.txCount} txs
                  </span>
                </Link>
              );
            })}
            {blocks.length === 0 && (
              <div className="px-4 py-6 text-center text-mythic-muted text-xs">
                Waiting for blocks...
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div className="bg-mythic-surface border border-mythic-border">
          <div className="px-4 py-3 border-b border-mythic-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-white">
              Recent Transactions
            </h2>
            <span className="text-mythic-muted text-[10px] font-mono">
              {txs.length} shown
            </span>
          </div>
          <div className="divide-y divide-mythic-border">
            {txs.slice(0, 10).map((tx) => {
              const isNew = newTxSigs.has(tx.signature);
              return (
                <Link
                  key={tx.signature}
                  href={`/${network}/tx/${tx.signature}`}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-mythic-border/30 transition-all duration-500 ${
                    isNew
                      ? "bg-mythic-green/10 border-l-2 border-l-mythic-green"
                      : "border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-block w-1.5 h-1.5 flex-shrink-0 ${
                        tx.success ? "bg-mythic-green" : "bg-red-400"
                      }`}
                    />
                    <span className="font-mono text-xs text-mythic-text truncate max-w-[200px]">
                      {truncSig(tx.signature)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-mythic-muted text-xs">{timeAgo(tx.time)}</span>
                    <span className="text-mythic-muted text-xs font-mono">
                      Slot {tx.slot.toLocaleString()}
                    </span>
                  </div>
                </Link>
              );
            })}
            {txs.length === 0 && (
              <div className="px-4 py-6 text-center text-mythic-muted text-xs">
                Waiting for transactions...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
