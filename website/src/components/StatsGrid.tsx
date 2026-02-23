interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
}

function Stat({ label, value, sub }: StatProps) {
  return (
    <div className="bg-mythic-surface border border-mythic-border p-4">
      <p className="text-mythic-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-heading font-bold text-white">{value}</p>
      {sub && <p className="text-mythic-muted text-xs mt-1 font-mono">{sub}</p>}
    </div>
  );
}

function formatSupply(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface StatsGridProps {
  stats: {
    slot: number;
    blockHeight: number;
    epoch: number;
    epochProgress: number;
    tps: number;
    totalSupply: number;
    l1Supply?: number;
    l2Supply?: number;
    bridgeLocked?: number;
  };
  network?: string;
}

export default function StatsGrid({ stats, network = "mainnet" }: StatsGridProps) {
  const netLabel = network === "testnet" ? "Testnet" : "Mainnet";

  const parts: string[] = [];
  if (stats.l1Supply != null && stats.l1Supply > 0) {
    parts.push(`L1: ${formatSupply(stats.l1Supply)}`);
  }
  if (stats.l2Supply != null && stats.l2Supply > 0) {
    parts.push(`L2: ${formatSupply(stats.l2Supply)}`);
  }
  const supplySub = parts.length > 0 ? `$MYTH \u00b7 ${parts.join(" | ")}` : "$MYTH";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-mythic-border">
      <Stat label="Slot" value={stats.slot.toLocaleString()} />
      <Stat label="Block Height" value={stats.blockHeight.toLocaleString()} />
      <Stat label="Epoch" value={stats.epoch} sub={`${stats.epochProgress}% complete`} />
      <Stat label="TPS" value={stats.tps} />
      <Stat
        label="Total Supply"
        value={formatSupply(stats.totalSupply)}
        sub={supplySub}
      />
      <Stat label="Network" value={netLabel} sub="Mythic L2" />
    </div>
  );
}
