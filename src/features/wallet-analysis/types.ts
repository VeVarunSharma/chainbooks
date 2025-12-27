import type { TransactionTypeValue } from "@/lib/db/schema";

// ============================================================================
// QUICKNODE API TYPES
// ============================================================================

export interface QuicknodeTransaction {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  methodId: string;
  functionName?: string;
  isError: string;
}

export interface QuicknodeTokenTransfer {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

export interface QuicknodeResponse<T> {
  status: string;
  message: string;
  result: T[];
}

// ============================================================================
// COINGECKO API TYPES
// ============================================================================

export interface CoinGeckoHistoryResponse {
  id: string;
  symbol: string;
  name: string;
  market_data?: {
    current_price: {
      usd: number;
    };
  };
}

export interface CoinGeckoContractResponse {
  id: string;
  symbol: string;
  name: string;
}

// ============================================================================
// AI CLASSIFIER TYPES
// ============================================================================

export interface ClassificationResult {
  type: TransactionTypeValue;
  description: string;
}

export interface ClassificationRequest {
  hash: string;
  methodId: string;
  from: string;
  to: string;
  value: string;
  tokenTransfers: {
    symbol: string;
    amount: string;
    direction: "in" | "out";
  }[];
}

// ============================================================================
// SYNC RESULT TYPES
// ============================================================================

export interface SyncProgress {
  stage: "fetching" | "pricing" | "classifying" | "complete" | "error";
  message: string;
  progress: number; // 0-100
}

export interface SyncResult {
  success: boolean;
  walletId: string;
  transactionCount: number;
  newTransactions: number;
  pricedTransactions: number;
  classifiedTransactions: number;
  errors: string[];
}

// ============================================================================
// DISPLAY TYPES
// ============================================================================

export interface TransactionDisplay {
  id: string;
  hash: string;
  date: Date;
  type: TransactionTypeValue;
  description: string | null;
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: number;
  usdValue: number | null;
  isSpam: boolean;
}

// ============================================================================
// ACTION RESULT TYPES
// ============================================================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
