"use server";

import { db, wallets, transactions, type NewTransaction } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  isValidEthAddress,
  normalizeAddress,
} from "@/lib/utils/address-validation";
import { etherscanService } from "../services/etherscan";
import type { ActionResult } from "../types";

interface AuditResult {
  walletId: string;
  address: string;
  newTransactionCount: number;
  totalTransactionCount: number;
}

/**
 * Agent 1: The Auditor
 * Fetches and stores raw transactions from Etherscan API
 */
export async function auditWallet(
  address: string
): Promise<ActionResult<AuditResult>> {
  try {
    // 1. Validate Ethereum address format
    if (!isValidEthAddress(address)) {
      return {
        success: false,
        error:
          "Invalid Ethereum address format. Must be 0x followed by 40 hex characters.",
      };
    }

    const normalizedAddress = normalizeAddress(address);

    // 2. Check database for existing wallet
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.address, normalizedAddress))
      .limit(1);

    let walletId: string;
    let existingHashes = new Set<string>();

    if (existingWallet.length > 0) {
      walletId = existingWallet[0].id;

      // Get existing transaction hashes to avoid duplicates
      const existingTxs = await db
        .select({ hash: transactions.hash })
        .from(transactions)
        .where(eq(transactions.walletId, walletId));

      existingHashes = new Set(existingTxs.map((tx) => tx.hash.toLowerCase()));
    } else {
      // Create new wallet
      const newWallet = await db
        .insert(wallets)
        .values({ address: normalizedAddress })
        .returning({ id: wallets.id });

      walletId = newWallet[0].id;
    }

    // 3. Fetch transactions from Etherscan
    const { transactions: ethTxs, tokenTransfers } =
      await etherscanService.getAllTransactions(normalizedAddress, 100);

    // 4. Map raw data to Transaction schema
    const newTransactions: NewTransaction[] = [];

    // Process ETH transactions
    for (const tx of ethTxs) {
      const hashLower = tx.hash.toLowerCase();
      if (existingHashes.has(hashLower)) continue;
      existingHashes.add(hashLower);

      const ethValue = parseFloat(tx.value) / 1e18;
      if (ethValue === 0 && tx.isError === "1") continue; // Skip failed zero-value txs

      newTransactions.push({
        hash: tx.hash,
        blockTimestamp: new Date(parseInt(tx.timeStamp) * 1000),
        tokenSymbol: "ETH",
        tokenAddress: null,
        amount: ethValue,
        walletId,
        type: "uncategorized",
        isSpam: false,
      });
    }

    // Process token transfers
    for (const transfer of tokenTransfers) {
      const hashLower = transfer.hash.toLowerCase();
      // Skip if we already have this hash (might overlap with ETH tx)
      if (existingHashes.has(hashLower)) continue;
      existingHashes.add(hashLower);

      const decimals = parseInt(transfer.tokenDecimal) || 18;
      const amount = parseFloat(transfer.value) / Math.pow(10, decimals);

      // Flag potential spam tokens
      const isSpam =
        !transfer.tokenSymbol ||
        transfer.tokenSymbol.length > 20 ||
        amount < 0.000001;

      newTransactions.push({
        hash: transfer.hash,
        blockTimestamp: new Date(parseInt(transfer.timeStamp) * 1000),
        tokenSymbol: transfer.tokenSymbol || "UNKNOWN",
        tokenAddress: transfer.contractAddress.toLowerCase(),
        amount,
        walletId,
        type: "uncategorized",
        isSpam,
      });
    }

    // 5. Insert new transactions
    if (newTransactions.length > 0) {
      await db
        .insert(transactions)
        .values(newTransactions)
        .onConflictDoNothing();
    }

    // 6. Get total count
    const allTxs = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.walletId, walletId));

    return {
      success: true,
      data: {
        walletId,
        address: normalizedAddress,
        newTransactionCount: newTransactions.length,
        totalTransactionCount: allTxs.length,
      },
    };
  } catch (error) {
    console.error("Audit wallet error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch wallet transactions",
    };
  }
}
