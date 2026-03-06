import { getTransactionDetail, KNOWN_PROGRAMS, KNOWN_TOKENS } from "@/lib/rpc";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 30;

function truncAddr(addr: string, len = 6): string {
  if (!addr || addr.length <= len * 2 + 2) return addr || "--";
  return addr.slice(0, len) + "..." + addr.slice(-len);
}

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ network: string; signature: string }>;
}) {
  const { network, signature } = await params;
  const tx = await getTransactionDetail(signature).catch(() => null);
  if (!tx) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={"/" + network} className="font-mono text-[0.6rem] tracking-[0.08em] uppercase text-[#555568] hover:text-white transition-colors">
          Explorer
        </Link>
        <span className="font-mono text-[0.6rem] text-[#555568]">/</span>
        <span className="font-mono text-[0.6rem] tracking-[0.08em] uppercase text-[#8888A0]">Transaction</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border" style={{ borderColor: tx.success ? "rgba(57,255,20,0.3)" : "rgba(248,113,113,0.3)", background: tx.success ? "rgba(57,255,20,0.06)" : "rgba(248,113,113,0.06)" }}>
          {tx.success ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-[1.1rem] text-white">Transaction Details</h1>
            <span className={"badge " + (tx.success ? "badge-green" : "badge-error")}>
              {tx.success ? "Success" : "Failed"}
            </span>
          </div>
          <p className="font-mono text-[0.7rem] text-[#39FF14] break-all mt-1 leading-relaxed">
            {tx.signature}
          </p>
        </div>
      </div>

      {/* Overview grid */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)]">
          <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Overview</h2>
        </div>
        <div className="divide-y divide-white/[0.06]">
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Block</span>
            <Link href={"/" + network + "/block/" + tx.slot} className="font-mono text-[0.75rem] text-[#39FF14] hover:text-white transition-colors">
              {tx.slot.toLocaleString("en-US")}
            </Link>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Timestamp</span>
            <span className="font-mono text-[0.75rem] text-[#D8D8E4]">
              {tx.blockTime ? new Date(tx.blockTime).toLocaleString("en-US") : "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Fee</span>
            <span className="font-mono text-[0.75rem] text-[#D8D8E4]">{tx.fee} MYTH</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Compute Units</span>
            <span className="font-mono text-[0.75rem] text-[#D8D8E4]">{tx.computeUnits.toLocaleString("en-US")}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] px-5 py-3">
            <span className="font-mono text-[0.65rem] text-[#555568]">Signer</span>
            <Link href={"/" + network + "/address/" + tx.accounts[0]} className="font-mono text-[0.75rem] text-[#39FF14] hover:text-white transition-colors break-all">
              {tx.accounts[0]}
            </Link>
          </div>
        </div>
      </div>

      {/* Token Transfers */}
      {tx.tokenTransfers.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Token Transfers</h2>
            <span className="badge badge-green">{tx.tokenTransfers.length}</span>
          </div>
          <div>
            {tx.tokenTransfers.map((t, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-[rgba(57,255,20,0.04)]">
                <div className="w-8 h-8 bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-[0.55rem] font-bold text-[#F59E0B]">{t.symbol.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[0.7rem] font-semibold text-white">
                      {t.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} {t.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[0.6rem] font-mono text-[#555568]">
                    <span>From</span>
                    <Link href={"/" + network + "/address/" + t.from} className="text-[#8888A0] hover:text-white transition-colors">{truncAddr(t.from)}</Link>
                    <span>To</span>
                    <Link href={"/" + network + "/address/" + t.to} className="text-[#8888A0] hover:text-white transition-colors">{truncAddr(t.to)}</Link>
                  </div>
                </div>
                <Link href={"/" + network + "/address/" + t.mint} className="font-mono text-[0.6rem] text-[#555568] hover:text-white transition-colors">
                  {t.symbol || truncAddr(t.mint)}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MYTH Balance Changes */}
      {tx.solChanges.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">MYTH Balance Changes</h2>
            <span className="badge badge-green">{tx.solChanges.length}</span>
          </div>
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto] gap-4 px-5 py-2 border-b border-[rgba(57,255,20,0.04)]">
            <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568]">Address</span>
            <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568] text-right w-32">Change</span>
          </div>
          <div>
            {tx.solChanges.map((sc, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_auto] gap-4 items-center px-5 py-3 border-b border-[rgba(57,255,20,0.04)]">
                <Link href={"/" + network + "/address/" + sc.address} className="font-mono text-[0.7rem] text-[#39FF14] hover:text-white transition-colors truncate">
                  {sc.address}
                </Link>
                <span className={"font-mono text-[0.75rem] font-medium text-right w-32 " + (sc.change >= 0 ? "text-[#39FF14]" : "text-[#F87171]")}>
                  {sc.change >= 0 ? "+" : ""}{sc.change.toLocaleString("en-US", { maximumFractionDigits: 9 })} MYTH
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {tx.instructions.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Instructions</h2>
            <span className="badge badge-green">{tx.instructions.length}</span>
          </div>
          <div>
            {tx.instructions.map((ix, i) => (
              <div key={i} className="px-5 py-4 border-b border-[rgba(57,255,20,0.04)]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[0.55rem] bg-[#1C1C2C] border border-[rgba(57,255,20,0.08)] px-2 py-0.5 text-[#555568]">#{i + 1}</span>
                  <Link href={"/" + network + "/address/" + ix.programId} className="font-mono text-[0.7rem] text-[#39FF14] hover:text-white transition-colors font-semibold">
                    {ix.programName}
                  </Link>
                </div>
                {ix.parsed && (
                  <div className="ml-8 mt-2 p-3 bg-[#141420] border border-[rgba(57,255,20,0.04)]">
                    <span className="font-mono text-[0.6rem] text-[#555568]">Type: </span>
                    <span className="font-mono text-[0.65rem] text-[#D8D8E4]">{ix.parsed.type || "unknown"}</span>
                    {ix.parsed.info && (
                      <pre className="font-mono text-[0.6rem] text-[#8888A0] mt-2 whitespace-pre-wrap break-all">
                        {JSON.stringify(ix.parsed.info, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
                {!ix.parsed && ix.accounts.length > 0 && (
                  <div className="ml-8 mt-2 space-y-1">
                    {ix.accounts.slice(0, 6).map((acc, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="font-mono text-[0.55rem] text-[#555568] w-4">{j}</span>
                        <Link href={"/" + network + "/address/" + acc} className="font-mono text-[0.6rem] text-[#8888A0] hover:text-[#39FF14] truncate transition-colors">
                          {acc}
                        </Link>
                      </div>
                    ))}
                    {ix.accounts.length > 6 && (
                      <span className="font-mono text-[0.55rem] text-[#555568] ml-6">
                        +{ix.accounts.length - 6} more accounts
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inner Instructions */}
      {tx.innerInstructions.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Inner Instructions (CPI)</h2>
            <span className="badge badge-green">{tx.innerInstructions.length}</span>
          </div>
          <div>
            {tx.innerInstructions.map((iix, i) => (
              <div key={i} className="px-5 py-3 border-b border-[rgba(57,255,20,0.04)] flex items-center gap-3">
                <span className="font-mono text-[0.55rem] bg-[#1C1C2C] border border-[rgba(57,255,20,0.08)] px-2 py-0.5 text-[#555568]">ix {iix.index}</span>
                <Link href={"/" + network + "/address/" + iix.programId} className="font-mono text-[0.65rem] text-[#39FF14] hover:text-white transition-colors">
                  {iix.programName}
                </Link>
                {iix.parsed && (
                  <span className="font-mono text-[0.6rem] text-[#8888A0]">{iix.parsed.type}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounts */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
          <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Account Inputs</h2>
          <span className="badge badge-green">{tx.accounts.length}</span>
        </div>
        <div className="hidden sm:grid sm:grid-cols-[40px_1fr_auto] gap-4 px-5 py-2 border-b border-[rgba(57,255,20,0.04)]">
          <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568]">#</span>
          <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568]">Address</span>
          <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568] text-right w-40">Label</span>
        </div>
        <div>
          {tx.accounts.map((addr, i) => {
            const label = KNOWN_PROGRAMS[addr] || KNOWN_TOKENS[addr]?.symbol || "";
            return (
              <div key={addr + "-" + i} className="grid sm:grid-cols-[40px_1fr_auto] gap-4 items-center px-5 py-2.5 border-b border-[rgba(57,255,20,0.04)] tbl-row">
                <span className="font-mono text-[0.6rem] text-[#555568]">{i}</span>
                <Link href={"/" + network + "/address/" + addr} className="font-mono text-[0.7rem] text-[#39FF14] hover:text-white transition-colors truncate">
                  {addr}
                </Link>
                {label && (
                  <span className="badge badge-green text-right w-40 justify-end">{label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logs */}
      {tx.logs.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[rgba(57,255,20,0.08)]">
            <h2 className="font-display font-semibold text-[0.8rem] text-[#D8D8E4]">Program Logs</h2>
          </div>
          <div className="p-5">
            <div className="bg-[#141420] border border-[rgba(57,255,20,0.04)] p-4 max-h-96 overflow-auto">
              <pre className="font-mono text-[0.65rem] leading-relaxed text-[#8888A0] whitespace-pre-wrap break-all">
                {tx.logs.map((log, i) => {
                  const isInvoke = log.includes("invoke");
                  const isSuccess = log.includes("success");
                  const isError = log.includes("failed") || log.includes("error");
                  const color = isSuccess ? "text-[#39FF14]" : isError ? "text-[#F87171]" : isInvoke ? "text-[#39FF14]" : "text-[#8888A0]";
                  return (
                    <span key={i} className={color}>
                      {log}
                      {"\
"}
                    </span>
                  );
                })}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}