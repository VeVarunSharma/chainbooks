import { env } from "@/lib/config/env";
import type {
  QuicknodeTransaction,
  QuicknodeTokenTransfer,
  QuicknodeResponse,
} from "../types";

const ETHERSCAN_API_BASE = "https://api.etherscan.io/api";

/**
 * Etherscan API client for fetching Ethereum transactions
 */
class EtherscanService {
  private apiUrl: string;
  private apiKey: string;
  private requestQueue: Promise<unknown> = Promise.resolve();
  private lastRequestTime = 0;
  private minRequestInterval = 200; // 200ms between requests (5 req/sec)

  constructor() {
    this.apiUrl = ETHERSCAN_API_BASE;
    // Etherscan allows requests without API key (rate limited to 1/5sec)
    // With free API key, you get 5 calls/sec
    this.apiKey = env.ETHERSCAN_API_KEY || "";
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

      // Add API key if available (increases rate limit)
      if (this.apiKey) {
        params.append("apikey", this.apiKey);
      }

      const response = await fetch(`${this.apiUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Etherscan API error: ${response.status}`);
      }

      const data: QuicknodeResponse<QuicknodeTransaction> =
        await response.json();

      if (data.status === "0" && data.message !== "No transactions found") {
        // Include the result field which contains the actual error details
        const errorDetails = typeof data.result === "string" ? data.result : data.message;
        throw new Error(`Etherscan API error: ${errorDetails}`);
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

      // Add API key if available (increases rate limit)
      if (this.apiKey) {
        params.append("apikey", this.apiKey);
      }

      const response = await fetch(`${this.apiUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Etherscan API error: ${response.status}`);
      }

      const data: QuicknodeResponse<QuicknodeTokenTransfer> =
        await response.json();

      if (data.status === "0" && data.message !== "No transactions found") {
        // Include the result field which contains the actual error details
        const errorDetails = typeof data.result === "string" ? data.result : data.message;
        throw new Error(`Etherscan API error: ${errorDetails}`);
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

// Export singleton instance (keeping name for backward compatibility)
export const quicknodeService = new EtherscanService();

// Export types
export type { QuicknodeTransaction, QuicknodeTokenTransfer };
