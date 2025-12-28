"use client";

import { useState, useCallback } from "react";
import { syncWallet } from "../actions";
import type { SyncProgress, SyncResult, ActionResult } from "../types";

interface UseWalletSyncReturn {
  sync: (address: string) => Promise<ActionResult<SyncResult>>;
  progress: SyncProgress;
  isLoading: boolean;
  result: SyncResult | null;
  error: string | null;
  reset: () => void;
}

export function useWalletSync(): UseWalletSyncReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress>({
    stage: "fetching",
    message: "Ready to sync",
    progress: 0,
  });

  const reset = useCallback(() => {
    setIsLoading(false);
    setResult(null);
    setError(null);
    setProgress({
      stage: "fetching",
      message: "Ready to sync",
      progress: 0,
    });
  }, []);

  const sync = useCallback(
    async (address: string): Promise<ActionResult<SyncResult>> => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        // Stage 1: Fetching
        setProgress({
          stage: "fetching",
          message: "The Auditor is fetching transactions...",
          progress: 15,
        });

        // Small delay for visual feedback
        await new Promise((r) => setTimeout(r, 500));

        // Run the full sync (which includes all 3 agents)
        const syncResult = await syncWallet(address);

        if (!syncResult.success) {
          setError(syncResult.error || "Sync failed");
          setProgress({
            stage: "error",
            message: syncResult.error || "Sync failed",
            progress: 0,
          });
          return syncResult;
        }

        // Stage 2: Pricing
        setProgress({
          stage: "pricing",
          message: "The Appraiser is pricing tokens...",
          progress: 50,
        });
        await new Promise((r) => setTimeout(r, 300));

        // Stage 3: Classifying
        setProgress({
          stage: "classifying",
          message: "The Accountant is categorizing transactions...",
          progress: 80,
        });
        await new Promise((r) => setTimeout(r, 300));

        // Complete
        setProgress({
          stage: "complete",
          message: `Synced ${syncResult.data!.transactionCount} transactions`,
          progress: 100,
        });

        setResult(syncResult.data!);
        return syncResult;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setProgress({
          stage: "error",
          message: errorMessage,
          progress: 0,
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    sync,
    progress,
    isLoading,
    result,
    error,
    reset,
  };
}
