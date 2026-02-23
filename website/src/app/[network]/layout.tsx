import Link from "next/link";
import { notFound } from "next/navigation";

const VALID_NETWORKS = ["mainnet", "testnet"] as const;
type Network = (typeof VALID_NETWORKS)[number];

const NETWORK_CONFIG: Record<Network, { label: string; color: string; dotColor: string }> = {
  mainnet: { label: "Mainnet", color: "text-mythic-green", dotColor: "bg-mythic-green" },
  testnet: { label: "Testnet", color: "text-yellow-400", dotColor: "bg-yellow-400" },
};

export function generateStaticParams() {
  return VALID_NETWORKS.map((network) => ({ network }));
}

export default async function NetworkLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ network: string }>;
}) {
  const { network } = await params;
  if (!VALID_NETWORKS.includes(network as Network)) notFound();

  const cfg = NETWORK_CONFIG[network as Network];
  const otherNetwork = network === "mainnet" ? "testnet" : "mainnet";
  const otherCfg = NETWORK_CONFIG[otherNetwork];

  return (
    <div>
      <div className="bg-mythic-surface/60 border-b border-mythic-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`pulse-dot inline-block w-2 h-2 ${cfg.dotColor}`} />
              <span className={`text-xs font-mono font-semibold ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
            <span className="text-mythic-muted text-[10px]">|</span>
            <Link
              href={`/${otherNetwork}`}
              className="text-xs font-mono text-mythic-muted hover:text-mythic-green transition-colors"
            >
              Switch to {otherCfg.label}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://rpc.mythic.sh"
              className="text-[10px] font-mono text-mythic-muted hover:text-mythic-green transition-colors"
            >
              RPC: rpc.mythic.sh
            </a>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
