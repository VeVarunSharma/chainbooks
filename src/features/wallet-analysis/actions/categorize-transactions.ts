"use server";

import { db, transactions } from "@/lib/db";
import { eq } from "drizzle-orm";
import { aiClassifierService } from "../services/ai-classifier";
import type { ActionResult, ClassificationRequest } from "../types";

interface CategorizeResult {
  categorizedCount: number;
  uncategorizedCount: number;
}

/**
 * Agent 3: The Accountant
 * Classifies transactions using Azure AI Foundry
 */
export async function categorizeTransactions(
  walletId: string
): Promise<ActionResult<CategorizeResult>> {
  try {
    // 1. Get uncategorized transactions for this wallet
    const uncategorizedTxs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId));

    // Filter to only uncategorized ones
    const txsToProcess = uncategorizedTxs.filter(
      (tx) => tx.type === "uncategorized"
    );

    if (txsToProcess.length === 0) {
      return {
        success: true,
        data: {
          categorizedCount: 0,
          uncategorizedCount: 0,
        },
      };
    }

    // 2. Group transactions by hash to build classification context
    // For token transfers, we need to know direction (in/out)
    const txByHash = new Map<string, (typeof txsToProcess)[0][]>();
    for (const tx of uncategorizedTxs) {
      const existing = txByHash.get(tx.hash) || [];
      existing.push(tx);
      txByHash.set(tx.hash, existing);
    }

    let categorizedCount = 0;
    let uncategorizedCount = 0;

    // 3. Process each uncategorized transaction
    for (const tx of txsToProcess) {
      // Build classification request
      const relatedTxs = txByHash.get(tx.hash) || [tx];

      // Determine token transfers
      const tokenTransfers: ClassificationRequest["tokenTransfers"] = relatedTxs
        .filter((t) => t.tokenAddress)
        .map((t) => ({
          symbol: t.tokenSymbol,
          amount: t.amount.toString(),
          // Simplified: assume positive amounts are "in", negative are "out"
          // In real scenario, we'd compare addresses
          direction: t.amount > 0 ? ("in" as const) : ("out" as const),
        }));

      const request: ClassificationRequest = {
        hash: tx.hash,
        methodId: tx.hash.slice(0, 10), // First 4 bytes as proxy for method
        from: "", // Would need to store from/to in schema
        to: "",
        value: tx.tokenAddress ? "0" : tx.amount.toString(),
        tokenTransfers,
      };

      // 4. Classify the transaction
      const result = await aiClassifierService.classifyTransaction(request);

      // 5. Update the transaction
      await db
        .update(transactions)
        .set({
          type: result.type,
          description: result.description,
        })
        .where(eq(transactions.id, tx.id));

      if (result.type !== "uncategorized") {
        categorizedCount++;
      } else {
        uncategorizedCount++;
      }
    }

    return {
      success: true,
      data: {
        categorizedCount,
        uncategorizedCount,
      },
    };
  } catch (error) {
    console.error("Categorize transactions error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to categorize transactions",
    };
  }
}
