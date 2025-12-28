import { env } from "@/lib/config/env";
import { formatDateForCoinGecko } from "@/lib/utils/date-formatting";
import type {
  CoinGeckoHistoryResponse,
  CoinGeckoContractResponse,
} from "../types";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Native ETH special address for caching
export const NATIVE_ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

// Token ID cache (contract address -> coingecko ID)
const tokenIdCache = new Map<string, string>();

// Common token mappings
const KNOWN_TOKENS: Record<string, string> = {
  [NATIVE_ETH_ADDRESS]: "ethereum",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "weth", // WETH
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "usd-coin", // USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "tether", // USDT
  "0x6b175474e89094c44da98b954eedeac495271d0f": "dai", // DAI
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "wrapped-bitcoin", // WBTC
  "0x514910771af9ca656af840dff83e8264ecf986ca": "chainlink", // LINK
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "uniswap", // UNI
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": "aave", // AAVE
};

/**
 * CoinGecko API client for fetching historical token prices
 */
class CoinGeckoService {
  private apiUrl: string;
  private apiKey: string;
  private requestQueue: Promise<unknown> = Promise.resolve();
  private lastRequestTime = 0;
  private minRequestInterval = 2000; // 2 seconds for free tier (30 req/min)

  constructor() {
    this.apiUrl = COINGECKO_API_BASE;
    this.apiKey = env.COINGECKO_API_KEY || "";
  }

  /**
   * Rate limiting helper with exponential backoff
   */
  private async throttle(retryCount = 0): Promise<void> {
    const baseInterval = this.apiKey
      ? 100 // With API key: 10 req/sec
      : this.minRequestInterval;
    const interval = baseInterval * Math.pow(2, retryCount);
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < interval) {
      await new Promise((resolve) =>
        setTimeout(resolve, interval - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Queue requests to avoid race conditions
   */
  private async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.requestQueue.then(fn);
    this.requestQueue = result.catch(() => {});
    return result;
  }

  /**
   * Make API request with retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    maxRetries = 3
  ): Promise<T | null> {
    for (let i = 0; i < maxRetries; i++) {
      await this.throttle(i);

      try {
        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (this.apiKey) {
          headers["x-cg-demo-api-key"] = this.apiKey;
        }

        const response = await fetch(url, { headers });

        if (response.status === 429) {
          // Rate limited, wait and retry
          console.warn(`CoinGecko rate limited, retry ${i + 1}/${maxRetries}`);
          await new Promise((resolve) => setTimeout(resolve, 60000 * (i + 1))); // Wait 1-3 minutes
          continue;
        }

        if (response.status === 404) {
          // Token not found
          return null;
        }

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        if (i === maxRetries - 1) {
          console.error("CoinGecko fetch failed after retries:", error);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Get CoinGecko token ID from contract address
   */
  async getTokenId(contractAddress: string): Promise<string | null> {
    const normalizedAddress = contractAddress.toLowerCase();

    // Check known tokens first
    if (KNOWN_TOKENS[normalizedAddress]) {
      return KNOWN_TOKENS[normalizedAddress];
    }

    // Check cache
    if (tokenIdCache.has(normalizedAddress)) {
      return tokenIdCache.get(normalizedAddress) || null;
    }

    // Fetch from API
    return this.queueRequest(async () => {
      const url = `${this.apiUrl}/coins/ethereum/contract/${normalizedAddress}`;
      const data = await this.fetchWithRetry<CoinGeckoContractResponse>(url);

      if (data?.id) {
        tokenIdCache.set(normalizedAddress, data.id);
        return data.id;
      }

      return null;
    });
  }

  /**
   * Get historical price for a token on a specific date
   */
  async getHistoricalPrice(
    tokenAddress: string,
    date: Date
  ): Promise<number | null> {
    const normalizedAddress = tokenAddress.toLowerCase();
    const tokenId = await this.getTokenId(normalizedAddress);

    if (!tokenId) {
      console.warn(`Token not found on CoinGecko: ${tokenAddress}`);
      return null;
    }

    return this.queueRequest(async () => {
      const dateStr = formatDateForCoinGecko(date);
      const url = `${this.apiUrl}/coins/${tokenId}/history?date=${dateStr}&localization=false`;

      const data = await this.fetchWithRetry<CoinGeckoHistoryResponse>(url);

      if (data?.market_data?.current_price?.usd) {
        return data.market_data.current_price.usd;
      }

      return null;
    });
  }

  /**
   * Get current price for a token
   */
  async getCurrentPrice(tokenAddress: string): Promise<number | null> {
    const normalizedAddress = tokenAddress.toLowerCase();
    const tokenId = await this.getTokenId(normalizedAddress);

    if (!tokenId) {
      return null;
    }

    return this.queueRequest(async () => {
      const url = `${this.apiUrl}/simple/price?ids=${tokenId}&vs_currencies=usd`;
      const data = await this.fetchWithRetry<Record<string, { usd: number }>>(
        url
      );

      if (data?.[tokenId]?.usd) {
        return data[tokenId].usd;
      }

      return null;
    });
  }
}

// Export singleton instance
export const coingeckoService = new CoinGeckoService();

// Export constants
export { KNOWN_TOKENS };
