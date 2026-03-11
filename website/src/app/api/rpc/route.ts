import { NextRequest, NextResponse } from "next/server";
import { getClusterStats, getRecentBlocks, getRecentTransactions, getBlockDetail } from "@/lib/rpc";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const network = request.nextUrl.searchParams.get("network") || "mainnet";

  // Validate network param
  const validNetwork = network === "testnet" ? "testnet" : "mainnet";

  try {
    switch (type) {
      case "stats":
        return NextResponse.json(await getClusterStats(validNetwork));
      case "blocks":
        return NextResponse.json(await getRecentBlocks(10, validNetwork));
      case "transactions":
        return NextResponse.json(await getRecentTransactions(15, validNetwork));
      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: "RPC unavailable", message: e.message },
      { status: 503 }
    );
  }
}