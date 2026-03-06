import SearchBar from "@/components/SearchBar";
import LiveDashboard from "@/components/LiveDashboard";
import { getClusterStats, getRecentBlocks, getRecentTransactions } from "@/lib/rpc";

export const revalidate = 5;

const LABELS: Record<string, string> = { mainnet: "Mainnet", testnet: "Testnet" };

export default async function NetworkHome({ params }: { params: Promise<{ network: string }> }) {
  const { network } = await params;
  const label = LABELS[network] || "Unknown";
  let stats = null, blocks: any[] = [], txs: any[] = [], error = false;

  try {
    [stats, blocks, txs] = await Promise.all([getClusterStats(), getRecentBlocks(10), getRecentTransactions(10)]);
  } catch { error = true; }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="relative scanline">
        <div className="flex items-center gap-4">
          <div className="w-1 h-10 bg-[#39FF14]" />
          <div>
            <h1 className="font-display font-bold text-[1.6rem] tracking-[0.02em] text-white">
              Mythic L2 Explorer
            </h1>
            <p className="font-mono text-[0.65rem] text-[#555568] mt-1 tracking-[0.04em]">
              Real-time blocks, transactions, and accounts on {label}
            </p>
          </div>
        </div>
      </div>

      <SearchBar network={network} />

      {error ? (
        <div className="glass-panel border-[#FF4444]/20 p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-[#FF4444]/10 border border-[#FF4444]/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="font-display font-bold text-[0.85rem] text-[#FF4444] uppercase tracking-[0.1em]">Unable to connect</p>
          <p className="font-mono text-[0.6rem] text-[#555568]">The Mythic L2 {label.toLowerCase()} node may be offline. Retrying...</p>
        </div>
      ) : (
        <LiveDashboard initialStats={stats} initialBlocks={blocks} initialTxs={txs} network={network} />
      )}
    </div>
  );
}
