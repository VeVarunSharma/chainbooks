"use server";

import { db, transactions, priceCache, type NewPriceCache } from "@/lib/db";
import { eq, isNull, and } from "drizzle-orm";
import { formatDateString } from "@/lib/utils/date-formatting";
import { coingeckoService, NATIVE_ETH_ADDRESS } from "../services/coingecko";
import type { ActionResult } from "../types";

interface AppraiseResult {
  pricedCount: number;
  skippedCount: number;
  cacheHits: number;
  cacheMisses: number;
}

/**
 * Agent 2: The Appraiser
 * Fetches and caches historical token prices from CoinGecko
 */
export async function appraiseTransactions(
  walletId: string
): Promise<ActionResult<AppraiseResult>> {
  try {
    // 1. Get unpriced transactions for this wallet
    const unpricedTxs = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.walletId, walletId),
          isNull(transactions.usdPriceAtTime)
        )
      );

    if (unpricedTxs.length === 0) {
      return {
        success: true,
        data: {
          pricedCount: 0,
          skippedCount: 0,
          cacheHits: 0,
          cacheMisses: 0,
        },
      };
    }

    let pricedCount = 0;
    let skippedCount = 0;
    let cacheHits = 0;
    let cacheMisses = 0;

    // 2. Process each transaction
    for (const tx of unpricedTxs) {
      // Determine token address for price lookup
      const tokenAddress = tx.tokenAddress || NATIVE_ETH_ADDRESS;
      const dateStr = formatDateString(tx.blockTimestamp);

      // 3. Check PriceCache first
      const cachedPrice = await db
        .select()
        .from(priceCache)
        .where(
          and(
            eq(priceCache.tokenAddress, tokenAddress.toLowerCase()),
            eq(priceCache.date, dateStr)
          )
        )
        .limit(1);

      let usdPrice: number | null = null;

      if (cachedPrice.length > 0) {
        usdPrice = cachedPrice[0].usdPrice;
        cacheHits++;
      } else {
        // 4. Fetch from CoinGecko
        usdPrice = await coingeckoService.getHistoricalPrice(
          tokenAddress,
          tx.blockTimestamp
        );
        cacheMisses++;

        // 5. Cache the result if found
        if (usdPrice !== null) {
          const newCache: NewPriceCache = {
            tokenAddress: tokenAddress.toLowerCase(),
            date: dateStr,
            usdPrice,
          };

          await db.insert(priceCache).values(newCache).onConflictDoNothing();
        }
      }

      // 6. Update transaction with price
      if (usdPrice !== null) {
        const totalUsdValue = tx.amount * usdPrice;

        await db
          .update(transactions)
          .set({
            usdPriceAtTime: usdPrice,
            totalUsdValue,
          })
          .where(eq(transactions.id, tx.id));

        pricedCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      success: true,
      data: {
        pricedCount,
        skippedCount,
        cacheHits,
        cacheMisses,
      },
    };
  } catch (error) {
    console.error("Appraise transactions error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to price transactions",
    };
  }
}
