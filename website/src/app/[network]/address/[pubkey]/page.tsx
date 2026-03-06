import { getAccountDetail } from "@/lib/rpc";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

const VALID_NETWORKS = ["mainnet", "testnet"];

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  program: { label: "Program", color: "text-[#39FF14] bg-mythic-green/10 border-mythic-green/30" },
  tokenMint: { label: "Token Mint", color: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
  tokenAccount: { label: "Token Account", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  wallet: { label: "Wallet", color: "text-white bg-white/10 border-white/20" },
  pda: { label: "PDA", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  unknown: { label: "Account", color: "text-[#555568] bg-mythic-border/50 border-[rgba(57,255,20,0.08)]" },
};

function formatBalance(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toLocaleString(undefined, { maximumFractionDigits: 9 });
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " bytes";
}

function timeAgo(iso: string | null): string {
  if (!iso) return "--";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function truncSig(sig: string): string {
  if (sig.length <= 20) return sig;
  return sig.slice(0, 10) + "..." + sig.slice(-10);
}

export default async function AddressPage({
  params,
}: {
  params: Promise<{ network: string; pubkey: string }>;
}) {
  const { network, pubkey } = await params;
  if (!VALID_NETWORKS.includes(network)) notFound();

  const info = await getAccountDetail(pubkey, network).catch(() => null);
  if (!info) notFound();

  const netPrefix = `/${network}`;
  const badge = TYPE_BADGES[info.accountType] || TYPE_BADGES.unknown;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-[#0C0C14] border border-[rgba(57,255,20,0.08)] p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${badge.color}`}>
                {badge.label}
              </span>
              {info.executable && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-mythic-green/30 text-[#39FF14] bg-mythic-green/10">
                  Executable
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-sm text-[#39FF14] break-all">{info.address}</h1>
              <CopyButton text={info.address} />
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-heading font-bold text-white">{formatBalance(info.balance)}</span>
          <span className="text-[#555568] text-sm">MYTH</span>
        </div>
        {!info.exists && (
          <p className="text-amber-400 text-xs mt-2 font-mono">Account does not exist on-chain</p>
        )}
      </div>

      {/* Overview Grid */}
      <div className="bg-[#0C0C14] border border-[rgba(57,255,20,0.08)]">
        <div className="px-4 py-3 border-b border-[rgba(57,255,20,0.08)]">
          <h2 className="font-heading font-semibold text-sm text-white">Overview</h2>
        </div>
        <div className="divide-y divide-[rgba(57,255,20,0.04)]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[#555568] text-xs uppercase tracking-wider">Balance</span>
            <span className="text-white text-sm font-mono">{info.balance.toLocaleString(undefined, { maximumFractionDigits: 9 })} MYTH</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[#555568] text-xs uppercase tracking-wider">Lamports</span>
            <span className="text-white text-sm font-mono">{info.lamports.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[#555568] text-xs uppercase tracking-wider">Owner</span>
            <a href={`${netPrefix}/address/${info.owner}`} className="text-[#39FF14] text-sm font-mono hover:underline">
              {info.ownerLabel}
            </a>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[#555568] text-xs uppercase tracking-wider">Executable</span>
            <span className={`text-sm font-mono ${info.executable ? "text-[#39FF14]" : "text-[#555568]"}`}>
              {info.executable ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[#555568] text-xs uppercase tracking-wider">Data Size</span>
            <span className="text-white text-sm font-mono">{formatBytes(info.dataSize)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[#555568] text-xs uppercase tracking-wider">Rent Epoch</span>
            <span className="text-white text-sm font-mono">{info.rentEpoch}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[#555568] text-xs uppercase tracking-wider">Transactions</span>
            <span className="text-white text-sm font-mono">{info.transactions.length}</span>
          </div>
        </div>
      </div>

      {/* Program Details */}
      {info.programData && (
        <div className="bg-[#0C0C14] border border-[rgba(57,255,20,0.08)]">
          <div className="px-4 py-3 border-b border-[rgba(57,255,20,0.08)]">
            <h2 className="font-heading font-semibold text-sm text-white">Program Details</h2>
          </div>
          <div className="divide-y divide-[rgba(57,255,20,0.04)]">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[#555568] text-xs uppercase tracking-wider">Program Data</span>
              <a href={`${netPrefix}/address/${info.programData.programDataAccount}`} className="text-[#39FF14] text-xs font-mono hover:underline truncate max-w-[400px]">
                {info.programData.programDataAccount}
              </a>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[#555568] text-xs uppercase tracking-wider">Data Size</span>
              <span className="text-white text-sm font-mono">{formatBytes(info.programData.dataSize)}</span>
            </div>
            {info.programData.upgradeAuthority && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#555568] text-xs uppercase tracking-wider">Upgrade Authority</span>
                <a href={`${netPrefix}/address/${info.programData.upgradeAuthority}`} className="text-[#39FF14] text-xs font-mono hover:underline truncate max-w-[400px]">
                  {info.programData.upgradeAuthority}
                </a>
              </div>
            )}
            {!info.programData.upgradeAuthority && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#555568] text-xs uppercase tracking-wider">Upgrade Authority</span>
                <span className="text-amber-400 text-sm font-mono">Immutable</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Token Mint Details */}
      {info.tokenMint && (
        <div className="bg-[#0C0C14] border border-[rgba(57,255,20,0.08)]">
          <div className="px-4 py-3 border-b border-[rgba(57,255,20,0.08)]">
            <h2 className="font-heading font-semibold text-sm text-white">Token Details</h2>
          </div>
          <div className="divide-y divide-[rgba(57,255,20,0.04)]">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[#555568] text-xs uppercase tracking-wider">Supply</span>
              <span className="text-white text-sm font-mono">{Number(info.tokenMint.supply).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[#555568] text-xs uppercase tracking-wider">Decimals</span>
              <span className="text-white text-sm font-mono">{info.tokenMint.decimals}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[#555568] text-xs uppercase tracking-wider">Mint Authority</span>
              {info.tokenMint.mintAuthority ? (
                <a href={`${netPrefix}/address/${info.tokenMint.mintAuthority}`} className="text-[#39FF14] text-xs font-mono hover:underline truncate max-w-[400px]">
                  {info.tokenMint.mintAuthority}
                </a>
              ) : (
                <span className="text-amber-400 text-sm font-mono">Disabled</span>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[#555568] text-xs uppercase tracking-wider">Freeze Authority</span>
              {info.tokenMint.freezeAuthority ? (
                <a href={`${netPrefix}/address/${info.tokenMint.freezeAuthority}`} className="text-[#39FF14] text-xs font-mono hover:underline truncate max-w-[400px]">
                  {info.tokenMint.freezeAuthority}
                </a>
              ) : (
                <span className="text-[#555568] text-sm font-mono">None</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Token Balances */}
      {info.tokenBalances.length > 0 && (
        <div className="bg-[#0C0C14] border border-[rgba(57,255,20,0.08)]">
          <div className="px-4 py-3 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-white">Token Balances</h2>
            <span className="text-[#555568] text-[10px] font-mono">{info.tokenBalances.length} tokens</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(57,255,20,0.08)]">
                  <th className="text-left text-[#555568] text-[10px] uppercase tracking-wider px-4 py-2">Token</th>
                  <th className="text-right text-[#555568] text-[10px] uppercase tracking-wider px-4 py-2">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(57,255,20,0.04)]">
                {info.tokenBalances.map((t: any) => (
                  <tr key={t.mint} className="hover:bg-[rgba(57,255,20,0.03)] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 flex-shrink-0 bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center">
                          <span className="font-mono text-[0.5rem] font-bold text-[#39FF14]">{(t.symbol || t.mint.slice(0, 2)).slice(0, 3)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {t.symbol && <span className="font-mono text-[0.75rem] font-semibold text-white">{t.symbol}</span>}
                            {t.name && <span className="font-mono text-[0.6rem] text-[#555568]">{t.name}</span>}
                          </div>
                          <a href={`${netPrefix}/address/${t.mint}`} className="font-mono text-[0.6rem] text-[#39FF14] hover:underline">
                            {t.mint.slice(0, 12)}...{t.mint.slice(-6)}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-white text-sm font-mono">{Number(t.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {info.transactions.length > 0 && (
        <div className="bg-[#0C0C14] border border-[rgba(57,255,20,0.08)]">
          <div className="px-4 py-3 border-b border-[rgba(57,255,20,0.08)] flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-white">Transaction History</h2>
            <span className="text-[#555568] text-[10px] font-mono">{info.transactions.length} shown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(57,255,20,0.08)]">
                  <th className="text-left text-[#555568] text-[10px] uppercase tracking-wider px-4 py-2">Signature</th>
                  <th className="text-left text-[#555568] text-[10px] uppercase tracking-wider px-4 py-2">Block</th>
                  <th className="text-left text-[#555568] text-[10px] uppercase tracking-wider px-4 py-2">Time</th>
                  <th className="text-center text-[#555568] text-[10px] uppercase tracking-wider px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(57,255,20,0.04)]">
                {info.transactions.map((tx: any) => (
                  <tr key={tx.signature} className="hover:bg-[rgba(57,255,20,0.03)] transition-colors">
                    <td className="px-4 py-2.5">
                      <a href={`${netPrefix}/tx/${tx.signature}`} className="font-mono text-xs text-[#39FF14] hover:underline">
                        {truncSig(tx.signature)}
                      </a>
                    </td>
                    <td className="px-4 py-2.5">
                      <a href={`${netPrefix}/block/${tx.slot}`} className="font-mono text-xs text-[#8888A0] hover:text-[#39FF14]">
                        {tx.slot.toLocaleString()}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-[#555568] text-xs">{timeAgo(tx.time)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {tx.success ? (
                        <span className="inline-flex items-center gap-1 text-[#39FF14] text-[10px] font-mono">
                          <span className="w-1.5 h-1.5 bg-mythic-green" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-mono">
                          <span className="w-1.5 h-1.5 bg-red-400" />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}