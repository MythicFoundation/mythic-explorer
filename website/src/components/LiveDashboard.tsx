"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface Block { slot: number; txCount: number; time: string | null; parentSlot: number; blockhash: string; }
interface Tx { signature: string; slot: number; success: boolean; fee: number; time: string | null; type: string; from: string; to: string; amount: string; }
interface Stats { slot: number; blockHeight: number; epoch: number; epochProgress: number; tps?: number; blockTimeMs?: number; transactionCount?: number; totalSupply: number; mythSupply?: number; l1Supply?: number; l2Supply?: number; burned?: number; circulatingSupply?: number; validatorCount?: number; }
interface Props { initialStats: Stats | null; initialBlocks: Block[]; initialTxs: Tx[]; network: string; }

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function timeAgo(iso: string | null): string {
  if (!iso) return "--";
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (d < 5) return "just now";
  if (d < 60) return d + "s ago";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  return Math.floor(d / 86400) + "d ago";
}

function truncSig(s: string): string {
  if (!s || s.length <= 16) return s || "";
  return s.slice(0, 8) + "\u2026" + s.slice(-8);
}

function fmt(n: number): string { return n.toLocaleString("en-US"); }

function fmtSupply(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString("en-US");
}

function txColor(t: string): string {
  switch (t) {
    case "Vote": return "text-[#555568]";
    case "MYTH Transfer": return "text-[#60A5FA]";
    case "Token Transfer": case "Token Operation": return "text-[#FBBF24]";
    case "Create Token Account": return "text-[#A78BFA]";
    case "System": return "text-[#8888A0]";
    default: return "text-[#39FF14]";
  }
}

/* ── Stat Card ────────────────────────────────────────────────────────────── */

function Stat({ label, value, sub, pulse, green }: { label: string; value: string | number; sub?: string; pulse?: boolean; green?: boolean }) {
  return (
    <div className={"stat-card p-4 " + (pulse ? "active glow-green" : "")}>
      <p className="font-mono text-[0.55rem] tracking-[0.14em] uppercase text-[#555568] mb-2">{label}</p>
      <p className={"font-mono text-[1.15rem] font-bold tabular-nums " + (green ? "text-[#39FF14]" : "text-white")}>{value}</p>
      {sub && <p className="font-mono text-[0.5rem] tracking-[0.06em] text-[#555568] mt-1.5">{sub}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */

export default function LiveDashboard({ initialStats, initialBlocks, initialTxs, network }: Props) {
  const [stats, setStats] = useState<Stats | null>(initialStats);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [txs, setTxs] = useState<Tx[]>(initialTxs);
  const [connected, setConnected] = useState(true);
  const [newBlocks, setNewBlocks] = useState<Set<number>>(new Set());
  const [newTxs, setNewTxs] = useState<Set<string>>(new Set());
  const [pulse, setPulse] = useState(false);
  const mounted = useRef(true);

  const api = useCallback(async (type: string) => {
    try {
      const r = await fetch("/api/rpc?type=" + type + "&network=" + network, { cache: "no-store" });
      if (!r.ok) throw new Error();
      setConnected(true);
      return await r.json();
    } catch { setConnected(false); return null; }
  }, [network]);

  useEffect(() => {
    mounted.current = true;
    const iv = setInterval(async () => {
      if (!mounted.current) return;
      const d = await api("blocks");
      if (!d || !Array.isArray(d)) return;
      setBlocks(prev => {
        const old = new Set(prev.map(b => b.slot));
        const fresh = d.filter((b: Block) => !old.has(b.slot));
        if (fresh.length) { setNewBlocks(new Set(fresh.map((b: Block) => b.slot))); setTimeout(() => setNewBlocks(new Set()), 2000); }
        return d;
      });
    }, 3000);
    return () => { mounted.current = false; clearInterval(iv); };
  }, [api]);

  useEffect(() => {
    mounted.current = true;
    const iv = setInterval(async () => {
      if (!mounted.current) return;
      const d = await api("transactions");
      if (!d || !Array.isArray(d)) return;
      setTxs(prev => {
        const old = new Set(prev.map(t => t.signature));
        const fresh = d.filter((t: Tx) => !old.has(t.signature));
        if (fresh.length) { setNewTxs(new Set(fresh.map((t: Tx) => t.signature))); setTimeout(() => setNewTxs(new Set()), 2000); }
        return d;
      });
    }, 3000);
    return () => { mounted.current = false; clearInterval(iv); };
  }, [api]);

  useEffect(() => {
    mounted.current = true;
    const iv = setInterval(async () => {
      if (!mounted.current) return;
      const d = await api("stats");
      if (!d) return;
      setStats(prev => {
        if (prev && d.slot !== prev.slot) { setPulse(true); setTimeout(() => setPulse(false), 1200); }
        return d;
      });
    }, 5000);
    return () => { mounted.current = false; clearInterval(iv); };
  }, [api]);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Status bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={"inline-block w-2 h-2 " + (connected ? "bg-[#39FF14] pulse-dot" : "bg-[#FF4444]")} />
          <span className={"font-mono text-[0.65rem] tracking-[0.14em] uppercase font-bold " + (connected ? "text-[#39FF14]" : "text-[#FF4444]")}>
            {connected ? "LIVE" : "DISCONNECTED"}
          </span>
          <span className="font-mono text-[0.55rem] text-[#555568]">
            {connected ? "Auto-refreshing every 3s" : "Reconnecting..."}
          </span>
        </div>
        {stats && (
          <span className="hidden sm:inline font-mono text-[0.55rem] text-[#555568]">
            Block #{fmt(stats.blockHeight)}
          </span>
        )}
      </div>

      {/* ── Stats grid ──────────────────────────────────── */}
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <Stat label="Current Slot" value={fmt(stats.slot)} pulse={pulse} green />
            <Stat label="Validators" value={stats.validatorCount || 1} pulse={pulse} />
            <Stat label="Transactions" value={stats.transactionCount ? fmt(stats.transactionCount) : "--"} pulse={pulse} />
            <Stat label="MYTH Supply" value={fmtSupply(stats.l1Supply || stats.mythSupply || stats.totalSupply)} green />
            <Stat label="Epoch" value={stats.epoch} sub={stats.epochProgress + "% complete"} />
            <Stat label="Block Time" value={stats.blockTimeMs != null ? stats.blockTimeMs + "ms" : "--"} />
          </div>

          {/* ── Epoch progress bar ──────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[#555568]">Epoch {stats.epoch} Progress</span>
              <span className="font-mono text-[0.5rem] text-[#39FF14]">{stats.epochProgress}%</span>
            </div>
            <div className="epoch-bar">
              <div className="epoch-bar-fill" style={{ width: stats.epochProgress + "%" }} />
            </div>
          </div>
        </>
      )}

      {/* ── Blocks + Transactions ───────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent Blocks */}
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#39FF14]/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2" opacity="0.7">
                <rect x="3" y="3" width="18" height="18" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <h2 className="font-display font-semibold text-[0.8rem] text-white">Recent Blocks</h2>
            </div>
            <span className="badge badge-green">{blocks.length}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2 border-b border-[#39FF14]/[0.04]">
            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[#555568]">Slot</span>
            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[#555568] text-right w-12">Txs</span>
            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[#555568] text-right w-16">Age</span>
          </div>
          <div>
            {blocks.slice(0, 10).map(b => {
              const isNew = newBlocks.has(b.slot);
              return (
                <Link key={b.slot} href={"/" + network + "/block/" + b.slot}
                  className={"grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-2.5 tbl-row " +
                    (isNew ? "animate-slide-in bg-[#39FF14]/[0.03] border-l-2 border-l-[#39FF14]" : "border-l-2 border-l-transparent")}>
                  <span className="font-mono text-[0.8rem] font-medium text-[#39FF14]">{b.slot.toLocaleString()}</span>
                  <span className="font-mono text-[0.7rem] text-[#D8D8E4] text-right w-12">{b.txCount}</span>
                  <span className="font-mono text-[0.6rem] text-[#555568] text-right w-16">{timeAgo(b.time)}</span>
                </Link>
              );
            })}
            {!blocks.length && <div className="px-5 py-10 text-center font-mono text-[0.6rem] text-[#555568]">Waiting for blocks...</div>}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#39FF14]/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2" opacity="0.7">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <h2 className="font-display font-semibold text-[0.8rem] text-white">Recent Transactions</h2>
            </div>
            <span className="badge badge-green">{txs.length}</span>
          </div>
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-2 border-b border-[#39FF14]/[0.04]">
            <span className="w-2" />
            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[#555568]">Signature</span>
            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[#555568] w-24">Type</span>
            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[#555568] text-right w-16">Age</span>
          </div>
          <div>
            {txs.slice(0, 10).map(tx => {
              const isNew = newTxs.has(tx.signature);
              return (
                <Link key={tx.signature} href={"/" + network + "/tx/" + tx.signature}
                  className={"grid sm:grid-cols-[auto_1fr_auto_auto] gap-2 sm:gap-4 items-center px-5 py-2.5 tbl-row " +
                    (isNew ? "animate-slide-in bg-[#39FF14]/[0.03] border-l-2 border-l-[#39FF14]" : "border-l-2 border-l-transparent")}>
                  <span className={"inline-block w-2 h-2 flex-shrink-0 " + (tx.success ? "bg-[#39FF14]" : "bg-[#FF4444]")} />
                  <div className="min-w-0">
                    <span className="font-mono text-[0.75rem] text-[#D8D8E4] block truncate">{truncSig(tx.signature)}</span>
                    {tx.amount && <span className="font-mono text-[0.55rem] text-[#555568] block mt-0.5">{tx.amount}</span>}
                  </div>
                  <span className={"font-mono text-[0.6rem] w-24 truncate " + txColor(tx.type)}>{tx.type}</span>
                  <span className="font-mono text-[0.6rem] text-[#555568] text-right w-16">{timeAgo(tx.time)}</span>
                </Link>
              );
            })}
            {!txs.length && <div className="px-5 py-10 text-center font-mono text-[0.6rem] text-[#555568]">Waiting for transactions...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
