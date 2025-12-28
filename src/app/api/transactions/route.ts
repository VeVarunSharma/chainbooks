import { NextRequest, NextResponse } from "next/server";
import { db, transactions } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletId = searchParams.get("walletId");

  if (!walletId) {
    return NextResponse.json(
      { error: "walletId is required" },
      { status: 400 }
    );
  }

  try {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.blockTimestamp));

    return NextResponse.json({ transactions: txs });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
