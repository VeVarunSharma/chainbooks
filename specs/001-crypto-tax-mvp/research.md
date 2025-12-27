# Research: Chainbooks - Crypto Tax & Analysis MVP

**Feature Branch**: `001-crypto-tax-mvp`  
**Date**: December 27, 2025  
**Status**: Complete

## Overview

This document captures research decisions and rationale for key technical choices in the Chainbooks MVP.

---

## 1. Blockchain Data Provider: Quicknode

### Decision

Use **Quicknode API** for fetching Ethereum transaction history.

### Rationale

- User-specified requirement in project spec
- Provides comprehensive transaction data including token transfers
- Reliable infrastructure with good uptime SLAs
- Supports multiple chains (future-proofing for multi-chain support)

### Alternatives Considered

| Provider      | Pros                  | Cons                             | Why Rejected                             |
| ------------- | --------------------- | -------------------------------- | ---------------------------------------- |
| Alchemy       | Great docs, free tier | Rate limits on free tier         | User specified Quicknode                 |
| Moralis       | Easy-to-use SDK       | Recent API changes, deprecations | Less stable API surface                  |
| Etherscan API | Free, well-documented | Lower rate limits, basic data    | Less comprehensive token data            |
| Direct RPC    | Maximum control       | Complex parsing required         | Too much implementation overhead for MVP |

### API Endpoints Used

```
# Get transactions for address
/v1/eth/mainnet/address/{address}/transactions

# Get token transfers
/v1/eth/mainnet/address/{address}/token-transfers
```

### Rate Limits

- Free tier: 25 requests/second
- Sufficient for MVP single-user scenarios
- Implement request queuing for safety

---

## 2. Price Data Provider: CoinGecko

### Decision

Use **CoinGecko API** for historical token pricing with aggressive local caching.

### Rationale

- User-specified requirement in project spec
- Comprehensive token coverage
- Historical price data by date available
- Free tier sufficient for MVP

### Alternatives Considered

| Provider      | Pros                     | Cons                              | Why Rejected          |
| ------------- | ------------------------ | --------------------------------- | --------------------- |
| CoinMarketCap | Large coverage           | Paid for historical data          | Cost for MVP          |
| DefiLlama     | Free, good DeFi coverage | Less comprehensive for all tokens | Limited token support |
| Chainlink     | Decentralized, reliable  | Current prices only               | No historical data    |

### API Endpoints Used

```
# Get historical price by date
/coins/{id}/history?date={dd-mm-yyyy}

# Get token info by contract address
/coins/ethereum/contract/{contract_address}
```

### Caching Strategy

```typescript
// PriceCache table structure
{
  tokenAddress: string,  // Contract address or "native" for ETH
  date: string,          // YYYY-MM-DD format
  usdPrice: number       // Price at start of day
}

// Lookup: tokenAddress + date = unique cached price
// Cache hit = skip API call entirely
// Expected hit rate: 80%+ after initial population
```

### Rate Limits

- Free tier: 10-30 calls/minute
- Implement exponential backoff with jitter
- Batch price lookups where possible

---

## 3. AI Classification: Azure AI Foundry

### Decision

Use **Azure AI Foundry Agent Kit** with GPT-4o-mini for transaction classification.

### Rationale

- User-specified requirement in project spec
- Azure ecosystem alignment for enterprise customers
- GPT-4o-mini offers good speed/cost balance for classification
- Agent Kit provides structured output handling

### Alternatives Considered

| Provider         | Pros             | Cons                   | Why Rejected         |
| ---------------- | ---------------- | ---------------------- | -------------------- |
| OpenAI direct    | Simpler setup    | No enterprise features | User specified Azure |
| Anthropic Claude | Strong reasoning | Different ecosystem    | User specified Azure |
| Local LLM        | No API costs     | Deployment complexity  | Too complex for MVP  |

### Prompt Design

```text
You are a blockchain transaction analyst. Analyze this Ethereum transaction and:

1. Classify it as one of: Income, Swap, Expense, Transfer
2. Write a human-readable description (max 100 chars)

Transaction Data:
- Hash: {txHash}
- Method ID: {methodId}
- From: {from}
- To: {to}
- Value: {value} ETH
- Token Transfers: {tokenTransfers}

Respond in JSON format:
{
  "type": "Swap|Income|Expense|Transfer",
  "description": "Human readable description"
}
```

### Classification Logic

| Pattern                                | Classification |
| -------------------------------------- | -------------- |
| DEX router interaction + token swap    | Swap           |
| Tokens received, nothing sent          | Income         |
| Tokens sent, nothing received          | Expense        |
| Same token in/out to different address | Transfer       |
| Gas-only transaction                   | Expense        |

---

## 4. Database: PostgreSQL via Drizzle ORM

### Decision

Use **Drizzle ORM** with PostgreSQL (Azure PostgreSQL).

### Rationale

- User explicitly requested Drizzle instead of Prisma
- Type-safe queries with TypeScript inference
- Lightweight, fast, modern
- Great developer experience with drizzle-kit studio

### Alternatives Considered

| ORM     | Pros                   | Cons                   | Why Rejected           |
| ------- | ---------------------- | ---------------------- | ---------------------- |
| Prisma  | Mature, great DX       | User specified Drizzle | User preference        |
| Kysely  | Type-safe, lightweight | Less full-featured     | Less ecosystem support |
| Raw SQL | Maximum control        | No type safety         | Maintenance burden     |

### Schema Design

```typescript
// See data-model.md for full schema
// Key design decisions:
// - UUID primary keys for distribution safety
// - Unique constraints on hash, address, tokenAddress+date
// - Indexes on foreign keys and common queries
```

---

## 5. UI Components: shadcn/ui

### Decision

Use **shadcn/ui** for all UI components with Tailwind CSS.

### Rationale

- User-specified requirement in project spec
- Copy-paste components, not a dependency
- Full control over styling
- Professional, accessible by default

### Components Required

| Component | Usage                      |
| --------- | -------------------------- |
| Button    | Sync, Export actions       |
| Input     | Wallet address input       |
| Badge     | Transaction type indicator |
| Table     | Transaction list display   |
| Skeleton  | Loading states             |
| Card      | Dashboard layout           |

---

## 6. CSV Export: xlsx Library

### Decision

Use **xlsx** library for CSV/Excel export.

### Rationale

- Industry-standard library
- Excel-compatible output
- Handles formatting, dates, numbers correctly
- Large file support

### Alternatives Considered

| Library     | Pros               | Cons               | Why Rejected       |
| ----------- | ------------------ | ------------------ | ------------------ |
| Papa Parse  | Simple CSV         | No Excel features  | Limited formatting |
| ExcelJS     | Full Excel support | Heavier dependency | Overkill for CSV   |
| Native Blob | No dependencies    | Manual formatting  | Error-prone        |

### Export Format

```csv
Date,Type,Description,Token Symbol,Token Amount,USD Value,TX Hash
2024-01-15,Swap,"Uniswap Trade: USDC to ETH",ETH,1.5,2500.00,0x123...
```

---

## 7. Testing: Jest

### Decision

Use **Jest** for unit and component testing.

### Rationale

- User explicitly requested Jest over Vitest
- Mature ecosystem
- Good React Testing Library integration
- Wide community support

### Test Coverage Targets

| Layer          | Target |
| -------------- | ------ |
| Utilities      | 90%    |
| Services       | 80%    |
| Server Actions | 70%    |
| Components     | 60%    |

---

## 8. Address Validation

### Decision

Implement client-side Ethereum address validation.

### Pattern

```typescript
// Valid Ethereum address regex
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

// Validation function
function isValidEthAddress(address: string): boolean {
  return ETH_ADDRESS_REGEX.test(address);
}
```

### Checksum Validation (Future)

- EIP-55 checksum validation for enhanced security
- Not required for MVP but recommended for production

---

## Summary of Decisions

| Area              | Decision                     | Confidence            |
| ----------------- | ---------------------------- | --------------------- |
| Blockchain Data   | Quicknode API                | High (user-specified) |
| Price Data        | CoinGecko API with caching   | High (user-specified) |
| AI Classification | Azure AI Foundry GPT-4o-mini | High (user-specified) |
| Database          | PostgreSQL + Drizzle ORM     | High (user-specified) |
| UI Components     | shadcn/ui                    | High (user-specified) |
| CSV Export        | xlsx library                 | Medium                |
| Testing           | Jest                         | High (user-specified) |

All major technology choices were user-specified, reducing research risk. Implementation focuses on integration patterns and error handling.
