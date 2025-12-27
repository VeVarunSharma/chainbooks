import { env } from "@/lib/config/env";
import type {
  QuicknodeTransaction,
  QuicknodeTokenTransfer,
  QuicknodeResponse,
} from "../types";

const ETHERSCAN_API_BASE = "https://api.etherscan.io/api";

/**
 * Quicknode/Etherscan API client for fetching Ethereum transactions
 * Using Etherscan API format for compatibility
 */
class QuicknodeService {
  private apiUrl: string;
  private requestQueue: Promise<unknown> = Promise.resolve();
  private lastRequestTime = 0;
  private minRequestInterval = 200; // 200ms between requests (5 req/sec)

  constructor() {
    this.apiUrl = env.QUICKNODE_API_URL || ETHERSCAN_API_BASE;
  }

  /**
   * Rate limiting helper - ensures we don't exceed API limits
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Queue requests to avoid race conditions
   */
  private async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.requestQueue.then(async () => {
      await this.throttle();
      return fn();
    });
    this.requestQueue = result.catch(() => {});
    return result;
  }

  /**
   * Fetch regular ETH transactions for an address
   */
  async getTransactions(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
    limit = 100
  ): Promise<QuicknodeTransaction[]> {
    return this.queueRequest(async () => {
      const params = new URLSearchParams({
        module: "account",
        action: "txlist",
        address,
        startblock: startBlock.toString(),
        endblock: endBlock.toString(),
        page: "1",
        offset: limit.toString(),
        sort: "desc",
      });

      // Add API key if using Etherscan
      if (this.apiUrl.includes("etherscan")) {
        params.append("apikey", env.QUICKNODE_API_URL || "YourApiKeyToken");
      }

      const response = await fetch(`${this.apiUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Quicknode API error: ${response.status}`);
      }

      const data: QuicknodeResponse<QuicknodeTransaction> =
        await response.json();

      if (data.status === "0" && data.message !== "No transactions found") {
        throw new Error(`Quicknode API error: ${data.message}`);
      }

      return data.result || [];
    });
  }

  /**
   * Fetch ERC-20 token transfers for an address
   */
  async getTokenTransfers(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
    limit = 100
  ): Promise<QuicknodeTokenTransfer[]> {
    return this.queueRequest(async () => {
      const params = new URLSearchParams({
        module: "account",
        action: "tokentx",
        address,
        startblock: startBlock.toString(),
        endblock: endBlock.toString(),
        page: "1",
        offset: limit.toString(),
        sort: "desc",
      });

      if (this.apiUrl.includes("etherscan")) {
        params.append("apikey", env.QUICKNODE_API_URL || "YourApiKeyToken");
      }

      const response = await fetch(`${this.apiUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Quicknode API error: ${response.status}`);
      }

      const data: QuicknodeResponse<QuicknodeTokenTransfer> =
        await response.json();

      if (data.status === "0" && data.message !== "No transactions found") {
        throw new Error(`Quicknode API error: ${data.message}`);
      }

      return data.result || [];
    });
  }

  /**
   * Fetch all transaction types for an address
   */
  async getAllTransactions(
    address: string,
    limit = 100
  ): Promise<{
    transactions: QuicknodeTransaction[];
    tokenTransfers: QuicknodeTokenTransfer[];
  }> {
    const [transactions, tokenTransfers] = await Promise.all([
      this.getTransactions(address, 0, 99999999, limit),
      this.getTokenTransfers(address, 0, 99999999, limit),
    ]);

    return { transactions, tokenTransfers };
  }
}

// Export singleton instance
export const quicknodeService = new QuicknodeService();

// Export types
export type { QuicknodeTransaction, QuicknodeTokenTransfer };
