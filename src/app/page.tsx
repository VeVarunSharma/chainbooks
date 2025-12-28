"use client";

import { useState, useEffect } from "react";
import {
  WalletForm,
  TransactionTable,
  ExportButton,
  SyncProgress,
} from "@/features/wallet-analysis/components";
import { useWalletSync } from "@/features/wallet-analysis/hooks/useWalletSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/db/schema";

export default function DashboardPage() {
  const { sync, progress, isLoading, result } = useWalletSync();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSpam, setShowSpam] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);

  // Fetch transactions after sync
  useEffect(() => {
    if (result?.walletId && result.walletId !== walletId) {
      setWalletId(result.walletId);
      fetchTransactions(result.walletId);
    }
  }, [result, walletId]);

  const fetchTransactions = async (wId: string) => {
    try {
      const response = await fetch(`/api/transactions?walletId=${wId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const handleSync = async (address: string) => {
    const result = await sync(address);
    if (result.success && result.data?.walletId) {
      await fetchTransactions(result.data.walletId);
    }
  };

  const spamCount = transactions.filter((tx) => tx.isSpam).length;

  return (
    <div className="space-y-8">
      {/* Wallet Input Section */}
      <div className="flex justify-center">
        <WalletForm onSync={handleSync} isLoading={isLoading} />
      </div>

      {/* Progress Section */}
      {isLoading && (
        <div className="flex justify-center">
          <SyncProgress stage={progress.stage} message={progress.message} />
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.transactionCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  New Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.newTransactions}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Priced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.pricedTransactions}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Classified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.classifiedTransactions}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800">Warnings</h3>
              <ul className="mt-2 text-sm text-yellow-700">
                {result.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex gap-2">
              {spamCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSpam(!showSpam)}
                >
                  {showSpam ? "Hide" : "Show"} Hidden ({spamCount})
                </Button>
              )}
              <ExportButton transactions={transactions} />
            </div>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={transactions} showSpam={showSpam} />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !result && transactions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg font-medium">Welcome to Chainbooks</p>
              <p className="mt-2">
                Enter your Ethereum wallet address above to analyze your
                transactions.
              </p>
              <p className="mt-4 text-sm">
                Our Council of Agents will fetch, price, and categorize your
                transactions automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
