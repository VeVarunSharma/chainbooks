"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isValidEthAddress } from "@/lib/utils/address-validation";

interface WalletFormProps {
  onSync: (address: string) => Promise<void>;
  isLoading: boolean;
}

export function WalletForm({ onSync, isLoading }: WalletFormProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate address format
    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!isValidEthAddress(address.trim())) {
      setError(
        "Invalid Ethereum address format. Must start with 0x and be 42 characters."
      );
      return;
    }

    try {
      await onSync(address.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync wallet");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Wallet Analysis</CardTitle>
        <CardDescription>
          Enter your Ethereum wallet address to fetch, price, and categorize
          your transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Syncing..." : "Sync Wallet"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
