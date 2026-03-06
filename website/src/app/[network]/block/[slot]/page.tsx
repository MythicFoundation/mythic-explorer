import { getBlockDetail, KNOWN_PROGRAMS } from "@/lib/rpc";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 30;

function truncSig(sig: string): string {
  if (!sig || sig.length <= 20) return sig || "";
  return sig.slice(0, 10) + "..." + sig.slice(-10);
}

function truncAddr(addr: string, len = 4): string {
  if (!addr || addr.length <= len * 2 + 2) return addr || "--";
  return addr.slice(0, len) + "..." + addr.slice(-len);
}

function txTypeColor(type: string): string {
  switch (type) {
    case "Vote": return "text-[#555568]";
    case "MYTH Transfer": return "text-[#60A5FA]";
    case "Token Transfer": return "text-[#F59E0B]";
    case "Token Operation": return "text-[#F59E0B]";
    case "Create Token Account": return "text-[#A78BFA]";
    case "System": return "text-[#8888A0]";
    default: return "text-[#39FF14]";
  }
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ network: string; slot: string }>;
}) {
  const { network, slot: slotStr } = await params;
  const slot = parseInt(slotStr, 10);
  if (isNaN(slot)) notFound();

  const block = await getBlockDetail(slot).catch(() => null);
  if (!block) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={"/" + network} className="font-mono text-[0.6rem] tracking-[0.08em] uppercase text-[#555568] hover:text-white transition-colors">
          Explorer
        </Link>
        <span className="font-mono text-[0.6rem] text-[#555568]">/</span>
        <span className="font-mono text-[0.6rem] tracking-[0.08em] uppercase text-[#8888A0]">Block</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 flex-shrink-0 bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
        <div>
          <h1 className="font-display font-bold text-[1.3rem] text-white">
            Block #{block.slot.toLocaleString("en-US")}
          </h1>
          <p className="font-mono text-[0.65rem] text-[#555568] mt-1">
            {block.blockTime ? new Date(block.blockTime).toLocaleString("en-US") : "Timestamp unavailable"}
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)]">
          <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Block Overview</h2>
        </div>
        <div className="divide-y divide-white/[0.06]">
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Slot</span>
            <span className="font-mono text-[0.75rem] text-[#39FF14] font-semibold">{block.slot.toLocaleString("en-US")}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Parent Slot</span>
            <Link href={"/" + network + "/block/" + block.parentSlot} className="font-mono text-[0.75rem] text-[#39FF14] hover:text-white transition-colors">
              {block.parentSlot.toLocaleString("en-US")}
            </Link>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Blockhash</span>
            <span className="font-mono text-[0.7rem] text-[#D8D8E4] break-all">{block.blockhash}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Previous Hash</span>
            <span className="font-mono text-[0.7rem] text-[#8888A0] break-all">{block.previousBlockhash}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Transactions</span>
            <span className="font-mono text-[0.75rem] text-white font-semibold">{block.txCount}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Timestamp</span>
            <span className="font-mono text-[0.75rem] text-[#D8D8E4]">
              {block.blockTime ? new Date(block.blockTime).toLocaleString("en-US") : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Block Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={"/" + network + "/block/" + (block.slot - 1)}
          className="flex items-center gap-2 font-mono text-[0.65rem] text-[#555568] hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous Block
        </Link>
        <Link
          href={"/" + network + "/block/" + (block.slot + 1)}
          className="flex items-center gap-2 font-mono text-[0.65rem] text-[#555568] hover:text-white transition-colors"
        >
          Next Block
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </div>

      {/* Rewards */}
      {block.rewards && block.rewards.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Block Rewards</h2>
            <span className="badge badge-green">{block.rewards.length}</span>
          </div>
          <div>
            {block.rewards.map((r: any, i: number) => (
              <div key={i} className="grid sm:grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3 border-b border-[rgba(57,255,20,0.04)]">
                <Link href={"/" + network + "/address/" + r.pubkey} className="font-mono text-[0.7rem] text-[#39FF14] hover:text-white transition-colors truncate">
                  {r.pubkey}
                </Link>
                <span className="font-mono text-[0.65rem] text-[#555568]">{r.rewardType || "Fee"}</span>
                <span className="font-mono text-[0.7rem] text-[#39FF14] font-medium">
                  +{((r.lamports || 0) / 1_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 9 })} MYTH
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      {block.transactions.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Transactions</h2>
            <span className="badge badge-green">{block.transactions.length}</span>
          </div>
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2 border-b border-[rgba(57,255,20,0.04)]">
            <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568] w-2"></span>
            <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568]">Signature</span>
            <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568] w-28">Type</span>
            <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568] text-right w-32">Amount</span>
            <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568] text-right w-24">Fee</span>
          </div>
          <div>
            {block.transactions.map((tx: any) => (
              <Link
                key={tx.signature}
                href={"/" + network + "/tx/" + tx.signature}
                className="grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-2 sm:gap-4 items-center px-5 py-3 border-b border-[rgba(57,255,20,0.04)] tbl-row"
              >
                <span className={"inline-block w-2 h-2 flex-shrink-0 " + (tx.success ? "bg-[#39FF14]" : "bg-[#F87171]")} />
                <span className="font-mono text-[0.7rem] text-[#D8D8E4] truncate">
                  {truncSig(tx.signature)}
                </span>
                <span className={"font-mono text-[0.65rem] w-28 truncate " + txTypeColor(tx.type)}>
                  {tx.type}
                </span>
                <span className="font-mono text-[0.65rem] text-[#8888A0] text-right w-32 truncate">
                  {tx.amount || "--"}
                </span>
                <span className="font-mono text-[0.6rem] text-[#555568] text-right w-24">
                  {tx.fee} MYTH
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}