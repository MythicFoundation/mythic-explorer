import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const RPC_URL = process.env.RPC_URL || "http://localhost:8899";
const SUPPLY_ORACLE_URL = process.env.SUPPLY_ORACLE_URL || "http://localhost:4002";

export function getConnection() {
  return new Connection(RPC_URL, "confirmed");
}

/* ── Raw RPC helper (bypasses web3.js response validation) ──────────────── */
async function rawRpc(method: string, params: any[] = []): Promise<any> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

/* ── Supply oracle ──────────────────────────────────────────────────────── */
async function getOracleSupply(): Promise<{
  totalSupply: number;
  circulatingSupply: number;
  l1Supply: number;
  l2Supply: number;
  bridgeLocked: number;
}> {
  try {
    const res = await fetch(`${SUPPLY_ORACLE_URL}/api/v1/supply`, {
      next: { revalidate: 10 },
    } as any);
    if (res.ok) return await res.json();
  } catch {}
  return {
    totalSupply: 1_000_000_000,
    circulatingSupply: 1_000_000_000,
    l1Supply: 1_000_000_000,
    l2Supply: 0,
    bridgeLocked: 0,
  };
}

/* ── Cluster stats ──────────────────────────────────────────────────────── */
export async function getClusterStats() {
  const conn = getConnection();
  const [epochInfo, perfSamples, oracleSupply] = await Promise.all([
    conn.getEpochInfo(),
    conn.getRecentPerformanceSamples(1),
    getOracleSupply(),
  ]);

  const tps =
    perfSamples.length > 0
      ? Math.round(perfSamples[0].numTransactions / perfSamples[0].samplePeriodSecs)
      : 0;

  return {
    slot: epochInfo.absoluteSlot,
    blockHeight: epochInfo.blockHeight ?? 0,
    epoch: epochInfo.epoch,
    epochProgress: Math.round((epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100),
    tps,
    totalSupply: oracleSupply.totalSupply,
    l1Supply: oracleSupply.l1Supply,
    l2Supply: oracleSupply.l2Supply,
    bridgeLocked: oracleSupply.bridgeLocked,
  };
}

/* ── Recent blocks (uses raw RPC to avoid web3.js validation issues) ──── */
export async function getRecentBlocks(limit = 10) {
  const slot = await rawRpc("getSlot");
  const blocks: Array<{
    slot: number;
    txCount: number;
    time: string | null;
    parentSlot: number;
  }> = [];

  for (let i = 0; i < limit; i++) {
    const s = slot - i;
    try {
      const block = await rawRpc("getBlock", [
        s,
        { transactionDetails: "signatures", maxSupportedTransactionVersion: 0, rewards: false },
      ]);
      if (block) {
        blocks.push({
          slot: s,
          txCount: block.signatures?.length ?? 0,
          time: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
          parentSlot: block.parentSlot,
        });
      }
    } catch {
      // slot may be skipped
    }
  }
  return blocks;
}

/* ── Recent transactions ────────────────────────────────────────────────── */
export async function getRecentTransactions(limit = 20) {
  const conn = getConnection();
  const slot = await conn.getSlot();
  const txs: Array<{
    signature: string;
    slot: number;
    success: boolean;
    fee: number;
    time: string | null;
  }> = [];

  for (let i = 0; i < 5 && txs.length < limit; i++) {
    const s = slot - i;
    try {
      const block = await conn.getBlock(s, {
        maxSupportedTransactionVersion: 0,
        transactionDetails: "full",
      });
      if (!block) continue;
      for (const tx of block.transactions) {
        if (txs.length >= limit) break;
        const sig = tx.transaction.signatures?.[0] || "";
        txs.push({
          signature: sig || "",
          slot: s,
          success: tx.meta?.err === null,
          fee: (tx.meta?.fee ?? 0) / LAMPORTS_PER_SOL,
          time: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
        });
      }
    } catch {
      // skip
    }
  }
  return txs;
}

/* ── Transaction detail ─────────────────────────────────────────────────── */
export async function getTransactionDetail(signature: string) {
  const conn = getConnection();
  const tx = await conn.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  if (!tx) return null;

  const accounts: string[] = [];
  const msg = tx.transaction.message;
  if ("getAccountKeys" in msg) {
    const keys = msg.getAccountKeys();
    for (let i = 0; i < keys.length; i++) {
      accounts.push(keys.get(i)!.toBase58());
    }
  } else {
    for (const key of (msg as any).accountKeys) {
      accounts.push(typeof key === "string" ? key : key.toBase58());
    }
  }

  return {
    signature,
    slot: tx.slot,
    blockTime: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
    success: tx.meta?.err === null,
    fee: (tx.meta?.fee ?? 0) / LAMPORTS_PER_SOL,
    accounts,
    logs: tx.meta?.logMessages ?? [],
  };
}

/* ── Address info ───────────────────────────────────────────────────────── */
export async function getAddressInfo(address: string) {
  const conn = getConnection();
  const pubkey = new PublicKey(address);
  const [balance, signatures] = await Promise.all([
    conn.getBalance(pubkey),
    conn.getSignaturesForAddress(pubkey, { limit: 20 }),
  ]);

  let tokenBalances: Array<{ mint: string; amount: string; decimals: number }> = [];
  try {
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    tokenBalances = tokenAccounts.value.map((ta) => ({
      mint: ta.account.data.parsed.info.mint,
      amount: ta.account.data.parsed.info.tokenAmount.uiAmountString,
      decimals: ta.account.data.parsed.info.tokenAmount.decimals,
    }));
  } catch {}

  return {
    address,
    balance: balance / LAMPORTS_PER_SOL,
    tokenBalances,
    transactions: signatures.map((s) => ({
      signature: s.signature,
      slot: s.slot,
      time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
      success: s.err === null,
    })),
  };
}

/* ── Block detail (raw RPC to support transactionDetails: "signatures") ── */
export async function getBlockDetail(slot: number) {
  try {
    const block = await rawRpc("getBlock", [
      slot,
      { transactionDetails: "signatures", maxSupportedTransactionVersion: 0 },
    ]);
    if (!block) return null;

    return {
      slot,
      blockTime: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
      parentSlot: block.parentSlot,
      txCount: block.signatures?.length ?? 0,
      signatures: block.signatures ?? [],
    };
  } catch {
    return null;
  }
}
