"use server";

import { auditWallet } from "./audit-wallet";
import { appraiseTransactions } from "./appraise-transactions";
import { categorizeTransactions } from "./categorize-transactions";
import type { SyncResult, ActionResult } from "../types";

/**
 * Full sync pipeline that runs all three agents in sequence
 */
export async function syncWallet(
  address: string
): Promise<ActionResult<SyncResult>> {
  const errors: string[] = [];

  // Agent 1: The Auditor - Fetch transactions
  const auditResult = await auditWallet(address);

  if (!auditResult.success) {
    return {
      success: false,
      error: auditResult.error,
    };
  }

  const { walletId, newTransactionCount, totalTransactionCount } =
    auditResult.data!;

  // Agent 2: The Appraiser - Price transactions
  const appraiseResult = await appraiseTransactions(walletId);

  if (!appraiseResult.success) {
    errors.push(`Pricing error: ${appraiseResult.error}`);
  }

  const pricedTransactions = appraiseResult.data?.pricedCount ?? 0;

  // Agent 3: The Accountant - Classify transactions
  const categorizeResult = await categorizeTransactions(walletId);

  if (!categorizeResult.success) {
    errors.push(`Classification error: ${categorizeResult.error}`);
  }

  const classifiedTransactions = categorizeResult.data?.categorizedCount ?? 0;

  return {
    success: true,
    data: {
      success: errors.length === 0,
      walletId,
      transactionCount: totalTransactionCount,
      newTransactions: newTransactionCount,
      pricedTransactions,
      classifiedTransactions,
      errors,
    },
  };
}
