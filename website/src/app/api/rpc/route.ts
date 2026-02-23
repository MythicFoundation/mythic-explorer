import { NextRequest, NextResponse } from "next/server";
import { getClusterStats, getRecentBlocks, getRecentTransactions } from "@/lib/rpc";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  try {
    switch (type) {
      case "stats":
        return NextResponse.json(await getClusterStats());
      case "blocks":
        return NextResponse.json(await getRecentBlocks(10));
      case "transactions":
        return NextResponse.json(await getRecentTransactions(15));
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
