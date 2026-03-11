import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8899";
const SUPPLY_ORACLE_URL = process.env.SUPPLY_ORACLE_URL || "http://localhost:4002";
const HELIUS_RPC = "https://beta.helius-rpc.com/?api-key=60aa17ec-d160-4cd9-8a51-e74f693bc403";
const L1_MYTH_MINT = "5UP2iL9DefXC3yovX9b4XG2EiCnyxuVo3S2F6ik5pump";

/* -- Known tokens -------------------------------------------------------- */
export const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  "7sfazeMxmuoDkuU5fHkDGin8uYuaTkZrRSwJM1CHXvDq": { symbol: "MYTH", name: "Mythic Token", decimals: 6 },
  "FEJa8wGyhXu9Hic1jNTg76Atb57C7jFkmDyDTQZkVwy3": { symbol: "wSOL", name: "Wrapped SOL", decimals: 9 },
  "6QTVHn4TUPQSpCH1uGmAK1Vd6JhuSEeKMKSi1F1SZMN": { symbol: "USDC", name: "USD Coin", decimals: 6 },
  "8Go32n5Pv4HYdML9DNr8ePh4UHunqS9ZgjKMurz1vPSw": { symbol: "wBTC", name: "Wrapped Bitcoin", decimals: 8 },
  "4zmzPzkexJRCVKSrYCHpmP8TVX6kMobjiFu8dVKtuXGT": { symbol: "wETH", name: "Wrapped Ethereum", decimals: 8 },
};

/* -- Known programs ------------------------------------------------------ */
export const KNOWN_PROGRAMS: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "Token Program",
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb": "Token-2022",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": "Associated Token Program",
  "Vote111111111111111111111111111111111111111": "Vote Program",
  "Stake11111111111111111111111111111111111111": "Stake Program",
  "ComputeBudget111111111111111111111111111111": "Compute Budget",
  "MythBrdgL2111111111111111111111111111111111": "Mythic Bridge L2",
  "MythToken1111111111111111111111111111111111": "MYTH Token Program",
  "MythSwap11111111111111111111111111111111111": "Mythic Swap",
  "MythStak11111111111111111111111111111111111": "Mythic Staking",
  "MythGov111111111111111111111111111111111111": "Mythic Governance",
  "MythPad111111111111111111111111111111111111": "Mythic Launchpad",
  "MythDrop11111111111111111111111111111111111": "Mythic Airdrop",
  "AVWSp12ji5yoiLeC9whJv5i34RGF5LZozQin6T58vaEh": "Compute Market",
  "CT1yUSX8n5uid5PyrPYnoG5H6Pp2GoqYGEKmMehq3uWJ": "AI Precompiles",
  "3QB8S38ouuREEDPxnaaGeujLsUhwFoRbLAejKywtEgv7": "Mythic Swap (deployed)",
  "MythSett1ement11111111111111111111111111111": "Mythic Settlement",
};

export function getProgramName(addr: string): string {
  return KNOWN_PROGRAMS[addr] || null as any;
}

export function getTokenInfo(mint: string) {
  return KNOWN_TOKENS[mint] || null;
}

export function getConnection() {
  return new Connection(RPC_URL, { commitment: "confirmed", confirmTransactionInitialTimeout: 10000 });
}

/* -- Raw RPC helper ------------------------------------------------------ */
async function rawRpc(method: string, params: any[] = []): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

/* -- L1 MYTH supply from Helius ------------------------------------------ */
async function getL1MythSupply(): Promise<number> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(HELIUS_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenSupply",
        params: [L1_MYTH_MINT],
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (json?.result?.value?.uiAmount) {
      return json.result.value.uiAmount;
    }
  } catch {}

  return 0;
}

/* -- Supply oracle ------------------------------------------------------- */
async function getOracleSupply(): Promise<{
  totalSupply: number;
  circulatingSupply: number;
  l1Supply: number;
  l2Supply: number;
  burned: number;
}> {
  try {
    const res = await fetch(SUPPLY_ORACLE_URL + "/api/supply", {
      next: { revalidate: 10 },
    } as any);
    if (res.ok) {
      const data = await res.json();
      return {
        totalSupply: data.totalSupply || 1_000_000_000,
        circulatingSupply: data.circulating || data.circulatingSupply || 0,
        l1Supply: data.l1Supply || 0,
        l2Supply: data.l2Supply || 0,
        burned: data.burned || 0,
      };
    }
  } catch {}

  return { totalSupply: 1_000_000_000, circulatingSupply: 0, l1Supply: 0, l2Supply: 0, burned: 0 };
}

/* -- MYTH token supply from L2 RPC --------------------------------------- */
async function getMythTokenSupply(): Promise<{ amount: number; decimals: number }> {
  try {
    const result = await rawRpc("getTokenSupply", ["7sfazeMxmuoDkuU5fHkDGin8uYuaTkZrRSwJM1CHXvDq"]);
    if (result?.value) {
      return {
        amount: result.value.uiAmount || 0,
        decimals: result.value.decimals || 6,
      };
    }
  } catch {}

  return { amount: 1_000_000_000, decimals: 6 };
}

/* -- Cluster stats ------------------------------------------------------- */
export async function getClusterStats() {
  const conn = getConnection();
  const [epochInfo, perfSamples, oracleSupply, mythSupply, l1Supply, txCountResult, voteAccountsResult] = await Promise.all([
    conn.getEpochInfo(),
    conn.getRecentPerformanceSamples(4),
    getOracleSupply(),
    getMythTokenSupply(),
    getL1MythSupply(),
    rawRpc("getTransactionCount").catch(() => null),
    rawRpc("getVoteAccounts").catch(() => null),
  ]);

  let blockTimeMs: number | undefined = undefined;
  let tps = 0;
  if (perfSamples.length > 0) {
    let totalSlots = 0;
    let totalSecs = 0;
    let totalTxs = 0;
    for (const sample of perfSamples) {
      if (sample.numSlots > 0 && sample.samplePeriodSecs > 0) {
        totalSlots += sample.numSlots;
        totalSecs += sample.samplePeriodSecs;
        totalTxs += sample.numTransactions;
      }
    }
    if (totalSlots > 0) {
      blockTimeMs = Math.round((totalSecs / totalSlots) * 1000);
    }
    if (totalSecs > 0) {
      tps = Math.round(totalTxs / totalSecs);
    }
  }

  const totalMythSupply = l1Supply > 0
    ? l1Supply + (mythSupply.amount || 0)
    : oracleSupply.totalSupply || mythSupply.amount || 1_000_000_000;

  return {
    slot: epochInfo.absoluteSlot,
    blockHeight: epochInfo.blockHeight ?? 0,
    epoch: epochInfo.epoch,
    epochProgress: Math.round((epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100),
    blockTimeMs,
    tps,
    transactionCount: txCountResult || 0,
    totalSupply: totalMythSupply,
    mythSupply: totalMythSupply,
    l1Supply: l1Supply || oracleSupply.l1Supply,
    l2Supply: mythSupply.amount || oracleSupply.l2Supply,
    burned: oracleSupply.burned,
    circulatingSupply: oracleSupply.circulatingSupply,
    validatorCount: (voteAccountsResult?.current?.length || 0) + (voteAccountsResult?.delinquent?.length || 0),
  };
}

/* -- Recent blocks (Frankendancer-compatible) ----------------------------- */
export async function getRecentBlocks(limit = 10, _network?: string) {
  const slot = await rawRpc("getSlot");

  // Get estimated block time from performance samples
  let msPerSlot = 400;
  try {
    const perfSamples = await rawRpc("getRecentPerformanceSamples", [1]);
    const sample = perfSamples?.[0];
    if (sample?.numSlots > 0) {
      msPerSlot = (sample.samplePeriodSecs * 1000) / sample.numSlots;
    }
  } catch {}

  const nowMs = Date.now();
  const realBlocks = new Map<number, {
    slot: number; txCount: number; time: string | null;
    parentSlot: number; blockhash: string;
  }>();

  // Try getBlocksWithLimit first (may work on some FD builds)
  let confirmedSlots: number[] = [];
  try {
    const startSlot = Math.max(0, slot - limit * 2);
    confirmedSlots = await rawRpc("getBlocksWithLimit", [startSlot, limit * 2]);
  } catch {}

  const slotsToTry = confirmedSlots.length > 0
    ? confirmedSlots.filter((s: number) => s <= slot).slice(-limit).reverse()
    : Array.from({ length: Math.min(limit * 2, 40) }, (_, i) => slot - i);

  // Try getBlock for each slot
  for (const s of slotsToTry) {
    if (realBlocks.size >= limit) break;
    try {
      const block = await rawRpc("getBlock", [
        s,
        { transactionDetails: "signatures", maxSupportedTransactionVersion: 0, rewards: false },
      ]);
      if (block) {
        realBlocks.set(s, {
          slot: s,
          txCount: block.signatures?.length ?? 0,
          time: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
          parentSlot: block.parentSlot,
          blockhash: block.blockhash || "",
        });
      }
    } catch {}
  }

  // Build final list: real blocks where available, synthetic otherwise
  const blocks: Array<{
    slot: number; txCount: number; time: string | null;
    parentSlot: number; blockhash: string;
  }> = [];

  for (let i = 0; i < limit; i++) {
    const s = slot - i;
    if (s < 0) break;
    const real = realBlocks.get(s);
    if (real) {
      blocks.push(real);
    } else {
      blocks.push({
        slot: s,
        txCount: 0,
        time: new Date(nowMs - i * msPerSlot).toISOString(),
        parentSlot: s > 0 ? s - 1 : 0,
        blockhash: "",
      });
    }
  }

  return blocks;
}

/* -- Classify transaction type ------------------------------------------- */
function classifyTx(tx: any, accounts: string[]): { type: string; from: string; to: string; amount: string } {
  const result = { type: "Transaction", from: "", to: "", amount: "" };
  
  if (!tx?.transaction?.message) return result;
  
  const msg = tx.transaction.message;
  const instructions = msg.instructions || [];
  const accountKeys = msg.accountKeys || [];
  
  const keys: string[] = accountKeys.map((k: any) => typeof k === "string" ? k : k.pubkey || k.toString());
  
  // Check for token transfers first
  if (tx.meta?.postTokenBalances?.length > 0 && tx.meta?.preTokenBalances?.length > 0) {
    const pre = tx.meta.preTokenBalances;
    const post = tx.meta.postTokenBalances;
    
    for (const postBal of post) {
      const preBal = pre.find((p: any) => p.accountIndex === postBal.accountIndex);
      if (preBal && postBal.uiTokenAmount && preBal.uiTokenAmount) {
        const diff = (postBal.uiTokenAmount.uiAmount || 0) - (preBal.uiTokenAmount.uiAmount || 0);
        if (diff > 0) {
          const mint = postBal.mint;
          const tokenInfo = KNOWN_TOKENS[mint];
          const symbol = tokenInfo ? tokenInfo.symbol : mint.slice(0, 8) + "...";
          result.type = "Token Transfer";
          result.amount = diff.toLocaleString("en-US", { maximumFractionDigits: 6 }) + " " + symbol;
          result.to = postBal.owner || "";
        }
        if (diff < 0) {
          result.from = preBal.owner || "";
        }
      }
    }
    if (result.type === "Token Transfer") return result;
  }
  
  for (const ix of instructions) {
    const progIdx = ix.programIdIndex;
    const progAddr = keys[progIdx] || "";
    
    if (progAddr === "Vote111111111111111111111111111111111111111") {
      result.type = "Vote";
      result.from = keys[0] || "";
      return result;
    }
    if (progAddr === "11111111111111111111111111111111") {
      if (tx.meta?.preBalances && tx.meta?.postBalances) {
        const pre = tx.meta.preBalances;
        const post = tx.meta.postBalances;
        for (let j = 1; j < Math.min(keys.length, post.length); j++) {
          const diff = post[j] - pre[j];
          if (diff > 0 && diff > 5000) {
            result.type = "MYTH Transfer";
            result.from = keys[0] || "";
            result.to = keys[j] || "";
            result.amount = (diff / LAMPORTS_PER_SOL).toLocaleString("en-US", { maximumFractionDigits: 4 }) + " MYTH";
            return result;
          }
        }
      }
      result.type = "System";
      result.from = keys[0] || "";
      return result;
    }
    if (progAddr === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" || progAddr === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
      result.type = "Token Operation";
      result.from = keys[0] || "";
      return result;
    }
    if (progAddr === "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") {
      result.type = "Create Token Account";
      result.from = keys[0] || "";
      return result;
    }
    
    const progName = KNOWN_PROGRAMS[progAddr];
    if (progName) {
      result.type = progName.replace("Mythic ", "");
      result.from = keys[0] || "";
      return result;
    }
  }
  
  result.from = keys[0] || "";
  return result;
}

/**
 * Classify a transaction from getSignaturesForAddress (no full tx data).
 * Used as a fallback when getBlock is unavailable (Frankendancer).
 */
function classifyFromSignature(sigInfo: any, sourceAddr: string): { type: string; from: string; to: string; amount: string } {
  // Heuristic: classify based on what address we found it from
  const voteProgram = "Vote111111111111111111111111111111111111111";
  if (sourceAddr === "FunhhSTj6AzUYYWddS4d8fuhoRTiQA31RqSArKtUjoTk" ||
      sourceAddr.includes("Vote") || sourceAddr === voteProgram) {
    return { type: "Vote", from: sourceAddr, to: "", amount: "" };
  }
  
  // Check known programs
  const progName = KNOWN_PROGRAMS[sourceAddr];
  if (progName) {
    return { type: progName.replace("Mythic ", ""), from: "", to: "", amount: "" };
  }
  
  return { type: "Transaction", from: sourceAddr, to: "", amount: "" };
}

/* -- Recent transactions (Frankendancer-compatible) ----------------------- */
export async function getRecentTransactions(limit = 15) {
  const slot = await rawRpc("getSlot");
  const txs: Array<{
    signature: string;
    slot: number;
    success: boolean;
    fee: number;
    time: string | null;
    type: string;
    from: string;
    to: string;
    amount: string;
  }> = [];

  // Try getBlock-based approach first (works on solana-test-validator)
  let gotBlocks = false;
  for (let i = 0; i < 20 && txs.length < limit; i++) {
    const s = slot - i;
    try {
      const block = await rawRpc("getBlock", [
        s,
        { transactionDetails: "full", maxSupportedTransactionVersion: 0, rewards: false },
      ]);
      if (!block || !block.transactions) continue;
      gotBlocks = true;
      for (const tx of block.transactions) {
        if (txs.length >= limit) break;
        const sig = tx.transaction?.signatures?.[0] || "";
        if (!sig) continue;
        
        const keys: string[] = (tx.transaction?.message?.accountKeys || []).map((k: any) => 
          typeof k === "string" ? k : k.pubkey || k.toString()
        );
        
        const classified = classifyTx(tx, keys);
        
        txs.push({
          signature: sig,
          slot: s,
          success: tx.meta?.err === null,
          fee: (tx.meta?.fee ?? 0) / LAMPORTS_PER_SOL,
          time: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
          type: classified.type,
          from: classified.from,
          to: classified.to,
          amount: classified.amount,
        });
      }
    } catch {
      // getBlock may not be available (Frankendancer)
    }
  }

  // If getBlock returned nothing, fall back to getSignaturesForAddress
  if (!gotBlocks || txs.length === 0) {
    const seen = new Set<string>();

    // Gather from multiple known addresses
    const addressesToPoll = [
      "FunhhSTj6AzUYYWddS4d8fuhoRTiQA31RqSArKtUjoTk", // Vote account
      "DLB2NZ5PSNAoChQAaUCBwoHCf6vzeStDa6kCYbB8HjSg", // Sequencer
      "4pPDuqj4bJjjti3398MhwUvQgPR4Azo6sEeZAhHhsk6s", // Deployer
      "AnVqSYE3ArJX9ZCbiReFcNa2JdLyri3GGGt34j63hT9e", // Foundation
      "MythToken1111111111111111111111111111111111",     // MYTH Token
      "MythBrdgL2111111111111111111111111111111111",     // Bridge L2
      "MythSwap11111111111111111111111111111111111",     // Swap
    ];

    // Also dynamically add vote accounts
    try {
      const voteAccounts = await rawRpc("getVoteAccounts");
      for (const va of (voteAccounts?.current || [])) {
        if (!addressesToPoll.includes(va.votePubkey)) {
          addressesToPoll.unshift(va.votePubkey);
        }
      }
    } catch {}


    const fetchPromises = addressesToPoll.map(async (addr) => {
      try {
        const sigs = await rawRpc("getSignaturesForAddress", [addr, { limit: limit * 2 }]);
        return (sigs || []).map((s: any) => ({ ...s, _sourceAddr: addr }));
      } catch {
        return [];
      }
    });

    const allResults = await Promise.all(fetchPromises);
    const allSigs: any[] = [];
    for (const sigs of allResults) {
      for (const s of sigs) {
        if (!seen.has(s.signature)) {
          seen.add(s.signature);
          allSigs.push(s);
        }
      }
    }

    // Sort by slot descending
    allSigs.sort((a: any, b: any) => b.slot - a.slot);

    for (const s of allSigs.slice(0, limit)) {
      const classified = classifyFromSignature(s, s._sourceAddr || "");
      txs.push({
        signature: s.signature,
        slot: s.slot,
        success: s.err === null,
        fee: 0,
        time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
        type: classified.type,
        from: classified.from,
        to: classified.to,
        amount: classified.amount,
      });
    }
  }

  return txs;
}

/* -- Transaction detail -------------------------------------------------- */
export async function getTransactionDetail(signature: string) {
  // Try full transaction data first
  let result: any = null;
  try {
    result = await rawRpc("getTransaction", [
      signature,
      { maxSupportedTransactionVersion: 0, encoding: "jsonParsed" },
    ]);
  } catch {}


  if (!result) {
    // Frankendancer fallback: return minimal info from signature search
    try {
      const voteAccounts = await rawRpc("getVoteAccounts");
      for (const va of (voteAccounts?.current || [])) {
        const sigs = await rawRpc("getSignaturesForAddress", [va.votePubkey, { limit: 100 }]);
        const match = (sigs || []).find((s: any) => s.signature === signature);
        if (match) {
          return {
            signature,
            slot: match.slot,
            blockTime: match.blockTime ? new Date(match.blockTime * 1000).toISOString() : null,
            success: match.err === null,
            fee: 0,
            accounts: [va.votePubkey],
            instructions: [],
            innerInstructions: [],
            tokenTransfers: [],
            solChanges: [],
            computeUnits: 0,
            logs: [],
            note: "Limited data: block-level transaction details unavailable on this RPC node",
          };
        }
      }
    } catch {}

    return null;
  }

  const msg = result.transaction?.message;
  const accounts: string[] = (msg?.accountKeys || []).map((k: any) => 
    typeof k === "string" ? k : k.pubkey || k.toString()
  );

  const instructions: Array<{
    programId: string;
    programName: string;
    accounts: string[];
    data: string;
    parsed?: any;
  }> = [];

  for (const ix of (msg?.instructions || [])) {
    const progIdx = ix.programIdIndex;
    const progAddr = ix.programId || accounts[progIdx] || "";
    const progId = typeof progAddr === "string" ? progAddr : progAddr.toString?.() || "";
    
    const ixAccounts: string[] = (ix.accounts || []).map((idx: number) => accounts[idx] || "");
    
    instructions.push({
      programId: progId,
      programName: KNOWN_PROGRAMS[progId] || progId.slice(0, 8) + "...",
      accounts: ixAccounts,
      data: ix.data || "",
      parsed: ix.parsed || null,
    });
  }

  const innerInstructions: Array<{
    index: number;
    programId: string;
    programName: string;
    parsed?: any;
  }> = [];
  
  for (const inner of (result.meta?.innerInstructions || [])) {
    for (const iix of (inner.instructions || [])) {
      const progId = iix.programId || (iix.programIdIndex != null ? accounts[iix.programIdIndex] : "") || "";
      const pid = typeof progId === "string" ? progId : progId.toString?.() || "";
      innerInstructions.push({
        index: inner.index,
        programId: pid,
        programName: KNOWN_PROGRAMS[pid] || pid.slice(0, 8) + "...",
        parsed: iix.parsed || null,
      });
    }
  }

  const tokenTransfers: Array<{
    mint: string;
    symbol: string;
    from: string;
    to: string;
    amount: number;
  }> = [];

  const preTB = result.meta?.preTokenBalances || [];
  const postTB = result.meta?.postTokenBalances || [];
  
  const preMap = new Map<number, any>();
  const postMap = new Map<number, any>();
  for (const b of preTB) preMap.set(b.accountIndex, b);
  for (const b of postTB) postMap.set(b.accountIndex, b);
  
  const allIndices = new Set([...preMap.keys(), ...postMap.keys()]);
  const senders: Array<{mint: string; owner: string; amount: number}> = [];
  const receivers: Array<{mint: string; owner: string; amount: number}> = [];
  
  for (const idx of allIndices) {
    const pre = preMap.get(idx);
    const post = postMap.get(idx);
    const preBal = pre?.uiTokenAmount?.uiAmount || 0;
    const postBal = post?.uiTokenAmount?.uiAmount || 0;
    const diff = postBal - preBal;
    const mint = post?.mint || pre?.mint || "";
    const owner = post?.owner || pre?.owner || "";
    
    if (diff < 0) senders.push({ mint, owner, amount: Math.abs(diff) });
    if (diff > 0) receivers.push({ mint, owner, amount: diff });
  }
  
  for (const recv of receivers) {
    const sender = senders.find(s => s.mint === recv.mint);
    const tokenInfo = KNOWN_TOKENS[recv.mint];
    tokenTransfers.push({
      mint: recv.mint,
      symbol: tokenInfo?.symbol || recv.mint.slice(0, 8) + "...",
      from: sender?.owner || "Mint",
      to: recv.owner,
      amount: recv.amount,
    });
  }

  const solChanges: Array<{ address: string; change: number }> = [];
  const pre = result.meta?.preBalances || [];
  const post = result.meta?.postBalances || [];
  for (let i = 0; i < Math.min(accounts.length, pre.length, post.length); i++) {
    const diff = (post[i] - pre[i]) / LAMPORTS_PER_SOL;
    if (Math.abs(diff) > 0.000001) {
      solChanges.push({ address: accounts[i], change: diff });
    }
  }

  const computeUnits = result.meta?.computeUnitsConsumed || 0;

  return {
    signature,
    slot: result.slot,
    blockTime: result.blockTime ? new Date(result.blockTime * 1000).toISOString() : null,
    success: result.meta?.err === null,
    fee: (result.meta?.fee ?? 0) / LAMPORTS_PER_SOL,
    accounts,
    instructions,
    innerInstructions,
    tokenTransfers,
    solChanges,
    computeUnits,
    logs: result.meta?.logMessages ?? [],
  };
}

/* -- Address info -------------------------------------------------------- */
export async function getAddressInfo(address: string) {
  const conn = getConnection();
  const pubkey = new PublicKey(address);
  
  const [balance, accountInfo, signatures] = await Promise.all([
    conn.getBalance(pubkey),
    rawRpc("getAccountInfo", [address, { encoding: "jsonParsed" }]).catch(() => null),
    conn.getSignaturesForAddress(pubkey, { limit: 25 }),
  ]);

  let accountType = "wallet";
  let isProgram = false;
  let isToken = false;
  let programData: any = null;
  let tokenMintInfo: any = null;
  
  const info = accountInfo?.value;
  if (info) {
    if (info.executable) {
      accountType = "program";
      isProgram = true;
      programData = {
        executable: true,
        owner: info.owner,
        dataSize: info.data?.length || (Array.isArray(info.data) ? info.data[0]?.length || 0 : 0),
      };
    }
    
    if (info.owner === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" || 
        info.owner === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
      const parsed = info.data?.parsed;
      if (parsed?.type === "mint") {
        accountType = "token";
        isToken = true;
        tokenMintInfo = {
          supply: parsed.info?.supply || "0",
          decimals: parsed.info?.decimals || 0,
          mintAuthority: parsed.info?.mintAuthority || null,
          freezeAuthority: parsed.info?.freezeAuthority || null,
          isInitialized: parsed.info?.isInitialized || false,
        };
      }
    }
  }

  let tokenBalances: Array<{ mint: string; amount: string; decimals: number; symbol: string; name: string }> = [];
  try {
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    tokenBalances = tokenAccounts.value.map((ta) => {
      const mint = ta.account.data.parsed.info.mint;
      const tokenInfo = KNOWN_TOKENS[mint];
      return {
        mint,
        amount: ta.account.data.parsed.info.tokenAmount.uiAmountString,
        decimals: ta.account.data.parsed.info.tokenAmount.decimals,
        symbol: tokenInfo?.symbol || "",
        name: tokenInfo?.name || "",
      };
    });
  } catch {}


  return {
    address,
    balance: balance / LAMPORTS_PER_SOL,
    accountType,
    isProgram,
    isToken,
    programData,
    tokenMintInfo,
    tokenBalances,
    knownProgram: KNOWN_PROGRAMS[address] || null,
    knownToken: KNOWN_TOKENS[address] || null,
    transactions: signatures.map((s) => ({
      signature: s.signature,
      slot: s.slot,
      time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
      success: s.err === null,
      memo: s.memo || null,
    })),
  };
}

/* -- Block detail (Frankendancer-compatible) ------------------------------ */
export async function getBlockDetail(slot: number) {
  // Try getBlock first
  try {
    const block = await rawRpc("getBlock", [
      slot,
      { transactionDetails: "full", maxSupportedTransactionVersion: 0 },
    ]);
    if (block) {
      const transactions = (block.transactions || []).map((tx: any) => {
        const sig = tx.transaction?.signatures?.[0] || "";
        const keys: string[] = (tx.transaction?.message?.accountKeys || []).map((k: any) => 
          typeof k === "string" ? k : k.pubkey || k.toString()
        );
        const classified = classifyTx(tx, keys);
        
        return {
          signature: sig,
          success: tx.meta?.err === null,
          fee: (tx.meta?.fee ?? 0) / LAMPORTS_PER_SOL,
          type: classified.type,
          from: classified.from,
          to: classified.to,
          amount: classified.amount,
        };
      });

      return {
        slot,
        blockTime: block.blockTime ? new Date(block.blockTime * 1000).toISOString() : null,
        parentSlot: block.parentSlot,
        blockhash: block.blockhash || "",
        previousBlockhash: block.previousBlockhash || "",
        txCount: transactions.length,
        transactions,
        rewards: block.rewards || [],
      };
    }
  } catch {}


  // Frankendancer fallback: use estimated time when getBlock and getBlockTime fail
  {
    let blockTime: number | null = null;
    try {
      blockTime = await rawRpc("getBlockTime", [slot]);
    } catch {}

    // If getBlockTime also fails, estimate from slot position
    if (blockTime === null) {
      try {
        const currentSlot = await rawRpc("getSlot");
        if (slot > currentSlot) return null;
        let msPerSlot = 400;
        try {
          const perfSamples = await rawRpc("getRecentPerformanceSamples", [1]);
          const sample = perfSamples?.[0];
          if (sample?.numSlots > 0) {
            msPerSlot = (sample.samplePeriodSecs * 1000) / sample.numSlots;
          }
        } catch {}
        blockTime = Math.floor(Date.now() / 1000 - ((currentSlot - slot) * msPerSlot / 1000));
      } catch {
        // If even getSlot fails, use current time
        blockTime = Math.floor(Date.now() / 1000);
      }
    }

    return {
      slot,
      blockTime: new Date(blockTime * 1000).toISOString(),
      parentSlot: slot > 0 ? slot - 1 : 0,
      blockhash: "",
      previousBlockhash: "",
      txCount: 0,
      transactions: [],
      rewards: [],
    };
  }
}

/* -- Address transactions (paginated) ------------------------------------ */
export async function getAddressTransactions(
  address: string,
  limit = 25,
  before?: string,
  _network?: string,
) {
  const conn = getConnection();
  const pubkey = new PublicKey(address);
  const opts: { limit: number; before?: string } = { limit };
  if (before) opts.before = before;
  const signatures = await conn.getSignaturesForAddress(pubkey, opts);
  return signatures.map((s) => ({
    signature: s.signature,
    slot: s.slot,
    time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
    success: s.err === null,
    memo: s.memo || null,
  }));
}
/* -- Account Detail (alias for address page) ----------------------------- */
export async function getAccountDetail(address: string, _network?: string) {
  const conn = getConnection();
  const pubkey = new PublicKey(address);

  const [lamports, accountInfo, signatures] = await Promise.all([
    conn.getBalance(pubkey),
    rawRpc('getAccountInfo', [address, { encoding: 'jsonParsed' }]).catch(() => null),
    conn.getSignaturesForAddress(pubkey, { limit: 25 }),
  ]);

  const info = accountInfo?.value;
  let exists = info !== null && info !== undefined;
  const owner = info?.owner ?? 'SystemProgram';
  const executable = info?.executable ?? false;
  const dataSize = info?.data?.length || (Array.isArray(info?.data) ? (info?.data[0]?.length || 0) : 0);
  const rentEpoch = info?.rentEpoch ?? 0;

  // Account type detection
  let accountType = 'wallet';
  if (executable) accountType = 'program';
  const parsed = info?.data?.parsed;
  if (parsed?.type === 'mint') accountType = 'tokenMint';
  if (parsed?.type === 'account') accountType = 'tokenAccount';
  if (!exists) accountType = 'unknown';

  // Owner label
  const ownerLabel = KNOWN_PROGRAMS[owner] || owner;

  // Program details
  let programData: any = null;
  if (executable) {
    programData = {
      programDataAccount: owner,
      dataSize,
      upgradeAuthority: null,
    };
  }

  // Token mint details
  let tokenMint: any = null;
  if (parsed?.type === 'mint') {
    tokenMint = {
      supply: parsed.info?.supply || '0',
      decimals: parsed.info?.decimals || 0,
      mintAuthority: parsed.info?.mintAuthority || null,
      freezeAuthority: parsed.info?.freezeAuthority || null,
    };
  }

  // Token balances
  let tokenBalances: Array<{ mint: string; amount: string; decimals: number; symbol: string; name: string }> = [];
  try {
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });
    tokenBalances = tokenAccounts.value.map((ta) => {
      const mint = ta.account.data.parsed.info.mint;
      const tokenInfo = KNOWN_TOKENS[mint];
      return {
        mint,
        amount: ta.account.data.parsed.info.tokenAmount.uiAmountString,
        decimals: ta.account.data.parsed.info.tokenAmount.decimals,
        symbol: tokenInfo?.symbol || '',
        name: tokenInfo?.name || '',
      };
    });
  } catch {}

  // Account exists if it has token accounts, transaction history, or balance
  if (!exists && (tokenBalances.length > 0 || signatures.length > 0 || lamports > 0)) {
    exists = true;
    if (accountType === 'unknown') accountType = 'wallet';
  }


  return {
    address,
    exists,
    balance: lamports / LAMPORTS_PER_SOL,
    lamports,
    owner,
    ownerLabel,
    executable,
    dataSize,
    rentEpoch,
    accountType,
    programData,
    tokenMint,
    tokenBalances,
    transactions: signatures.map((s) => ({
      signature: s.signature,
      slot: s.slot,
      time: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
      success: s.err === null,
    })),
  };
}
