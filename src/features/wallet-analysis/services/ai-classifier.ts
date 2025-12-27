import { env } from "@/lib/config/env";
import type { ClassificationResult, ClassificationRequest } from "../types";
import { TransactionType, type TransactionTypeValue } from "@/lib/db/schema";

/**
 * Azure AI Foundry client for transaction classification
 */
class AIClassifierService {
  private endpoint: string;
  private apiKey: string;
  private deployment: string;

  constructor() {
    this.endpoint = env.AZURE_AI_ENDPOINT;
    this.apiKey = env.AZURE_AI_API_KEY;
    this.deployment = env.AZURE_AI_DEPLOYMENT;
  }

  /**
   * Build classification prompt for a transaction
   */
  private buildPrompt(request: ClassificationRequest): string {
    const tokenTransfersStr =
      request.tokenTransfers.length > 0
        ? request.tokenTransfers
            .map(
              (t) =>
                `${t.direction === "in" ? "+" : "-"}${t.amount} ${t.symbol}`
            )
            .join(", ")
        : "None";

    return `You are a blockchain transaction analyst. Analyze this Ethereum transaction and:

1. Classify it as one of: Income, Swap, Expense, Transfer
2. Write a human-readable description (max 100 chars)

Classification Rules:
- Income: Tokens received without sending tokens (airdrops, rewards, payments received)
- Swap: Tokens exchanged via DEX (tokens sent AND received in same tx)
- Expense: Tokens sent without receiving tokens (purchases, fees, payments made)
- Transfer: Same token moved between addresses you control (self-transfers)

Transaction Data:
- Hash: ${request.hash}
- Method ID: ${request.methodId}
- From: ${request.from}
- To: ${request.to}
- Value: ${request.value} ETH
- Token Transfers: ${tokenTransfersStr}

Respond ONLY with valid JSON, no other text:
{
  "type": "Swap|Income|Expense|Transfer",
  "description": "Human readable description under 100 chars"
}`;
  }

  /**
   * Parse and validate AI response
   */
  private parseResponse(response: string): ClassificationResult {
    // Default fallback
    const defaultResult: ClassificationResult = {
      type: TransactionType.UNCATEGORIZED,
      description: "Unable to classify transaction",
    };

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return defaultResult;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate type
      const typeMap: Record<string, TransactionTypeValue> = {
        income: TransactionType.INCOME,
        swap: TransactionType.SWAP,
        expense: TransactionType.EXPENSE,
        transfer: TransactionType.TRANSFER,
      };

      const normalizedType = String(parsed.type || "").toLowerCase();
      const type = typeMap[normalizedType] || TransactionType.UNCATEGORIZED;

      // Validate description
      const description = String(parsed.description || "").slice(0, 255);

      return { type, description };
    } catch {
      console.error("Failed to parse AI response:", response);
      return defaultResult;
    }
  }

  /**
   * Classify a single transaction
   */
  async classifyTransaction(
    request: ClassificationRequest
  ): Promise<ClassificationResult> {
    // Check if API is configured
    if (!this.endpoint || !this.apiKey) {
      console.warn("Azure AI not configured, using heuristic classification");
      return this.heuristicClassify(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        console.error(`Azure AI error: ${response.status}`);
        return this.heuristicClassify(request);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      return this.parseResponse(content);
    } catch (error) {
      console.error("AI classification failed:", error);
      return this.heuristicClassify(request);
    }
  }

  /**
   * Heuristic-based classification fallback
   */
  private heuristicClassify(
    request: ClassificationRequest
  ): ClassificationResult {
    const hasTokensIn = request.tokenTransfers.some(
      (t) => t.direction === "in"
    );
    const hasTokensOut = request.tokenTransfers.some(
      (t) => t.direction === "out"
    );
    const hasEthValue = parseFloat(request.value) > 0;

    // DEX router addresses (common ones)
    const dexRouters = [
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2
      "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3
      "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f", // SushiSwap
      "0x1111111254fb6c44bac0bed2854e76f90643097d", // 1inch
    ];

    const isDex = dexRouters.includes(request.to.toLowerCase());

    // Classification logic
    if (isDex && (hasTokensIn || hasTokensOut)) {
      const inTokens = request.tokenTransfers
        .filter((t) => t.direction === "in")
        .map((t) => t.symbol)
        .join(", ");
      const outTokens = request.tokenTransfers
        .filter((t) => t.direction === "out")
        .map((t) => t.symbol)
        .join(", ");

      return {
        type: TransactionType.SWAP,
        description: `DEX Trade: ${outTokens || "ETH"} to ${inTokens || "ETH"}`,
      };
    }

    if (hasTokensIn && !hasTokensOut && !hasEthValue) {
      const tokens = request.tokenTransfers
        .filter((t) => t.direction === "in")
        .map((t) => t.symbol)
        .join(", ");
      return {
        type: TransactionType.INCOME,
        description: `Received ${tokens}`,
      };
    }

    if (hasTokensOut && !hasTokensIn) {
      const tokens = request.tokenTransfers
        .filter((t) => t.direction === "out")
        .map((t) => t.symbol)
        .join(", ");
      return {
        type: TransactionType.EXPENSE,
        description: `Sent ${tokens}`,
      };
    }

    if (hasEthValue && !hasTokensIn && !hasTokensOut) {
      return {
        type: TransactionType.EXPENSE,
        description: `Sent ${request.value} ETH`,
      };
    }

    return {
      type: TransactionType.UNCATEGORIZED,
      description: "Transaction requires manual review",
    };
  }

  /**
   * Batch classify multiple transactions
   */
  async classifyBatch(
    requests: ClassificationRequest[]
  ): Promise<Map<string, ClassificationResult>> {
    const results = new Map<string, ClassificationResult>();

    // Process sequentially to respect rate limits
    for (const request of requests) {
      const result = await this.classifyTransaction(request);
      results.set(request.hash, result);

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return results;
  }
}

// Export singleton instance
export const aiClassifierService = new AIClassifierService();
