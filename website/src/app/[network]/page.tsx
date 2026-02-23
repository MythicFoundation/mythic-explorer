import SearchBar from "@/components/SearchBar";
import StatsGrid from "@/components/StatsGrid";
import BlocksTable from "@/components/BlocksTable";
import TransactionsTable from "@/components/TransactionsTable";
import {
  getClusterStats,
  getRecentBlocks,
  getRecentTransactions,
} from "@/lib/rpc";

export const revalidate = 5;

const NETWORK_LABELS: Record<string, string> = {
  mainnet: "Mainnet",
  testnet: "Testnet",
};

export default async function NetworkHome({
  params,
}: {
  params: Promise<{ network: string }>;
}) {
  const { network } = await params;
  const networkLabel = NETWORK_LABELS[network] || "Unknown";
  let stats = null;
  let blocks: any[] = [];
  let txs: any[] = [];
  let error = false;

  try {
    [stats, blocks, txs] = await Promise.all([
      getClusterStats(),
      getRecentBlocks(10),
      getRecentTransactions(15),
    ]);
  } catch (e) {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-2xl">
          Mythic L2 Explorer &mdash; {networkLabel}
        </h1>
        <p className="text-mythic-muted text-sm">
          Search transactions, addresses, and blocks on Mythic L2 {networkLabel}.
        </p>
      </div>

      <SearchBar network={network} />

      {error ? (
        <div className="bg-mythic-surface border border-red-500/30 p-6 text-center">
          <p className="text-red-400 font-semibold mb-1">Unable to connect to RPC</p>
          <p className="text-mythic-muted text-sm">
            The Mythic L2 {networkLabel.toLowerCase()} node may be offline.
          </p>
        </div>
      ) : (
        <>
          {stats && <StatsGrid stats={stats} network={network} />}
          <div className="grid lg:grid-cols-2 gap-6">
            <BlocksTable blocks={blocks} network={network} />
            <TransactionsTable txs={txs} network={network} />
          </div>
        </>
      )}
    </div>
  );
}
