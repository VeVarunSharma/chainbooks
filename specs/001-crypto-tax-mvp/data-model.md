# Data Model: Chainbooks - Crypto Tax & Analysis MVP

**Feature Branch**: `001-crypto-tax-mvp`  
**Date**: December 27, 2025  
**ORM**: Drizzle ORM

## Overview

The data model consists of three core entities supporting the "Council of Agents" workflow:

1. **Wallet** - Stores cryptocurrency wallet addresses
2. **Transaction** - Stores processed blockchain transactions
3. **PriceCache** - Caches historical token prices to minimize API calls

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────────┐
│     Wallet      │       │      PriceCache         │
├─────────────────┤       ├─────────────────────────┤
│ id (PK)         │       │ id (PK)                 │
│ address (UQ)    │       │ tokenAddress            │
│ createdAt       │       │ date                    │
└────────┬────────┘       │ usdPrice                │
         │                │ (UQ: tokenAddress+date) │
         │ 1:N            └─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│      Transaction        │
├─────────────────────────┤
│ id (PK)                 │
│ hash (UQ)               │
│ blockTimestamp          │
│ type                    │
│ description             │
│ tokenSymbol             │
│ tokenAddress            │
│ amount                  │
│ usdPriceAtTime          │
│ totalUsdValue           │
│ isSpam                  │
│ walletId (FK)           │
└─────────────────────────┘
```

## Drizzle Schema

### Location: `src/lib/db/schema.ts`

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  doublePrecision,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// WALLET TABLE
// ============================================================================
export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    address: varchar("address", { length: 42 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    addressIdx: uniqueIndex("wallets_address_idx").on(table.address),
  })
);

export const walletsRelations = relations(wallets, ({ many }) => ({
  transactions: many(transactions),
}));

// ============================================================================
// TRANSACTION TABLE
// ============================================================================
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hash: varchar("hash", { length: 66 }).notNull().unique(),
    blockTimestamp: timestamp("block_timestamp").notNull(),

    // Categorization (filled by Agent 3: The Accountant)
    type: varchar("type", { length: 20 }).default("uncategorized").notNull(),
    description: varchar("description", { length: 255 }),

    // Token details (filled by Agent 1: The Auditor)
    tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(),
    tokenAddress: varchar("token_address", { length: 42 }),
    amount: doublePrecision("amount").notNull(),

    // Financials (filled by Agent 2: The Appraiser)
    usdPriceAtTime: doublePrecision("usd_price_at_time"),
    totalUsdValue: doublePrecision("total_usd_value"),

    // Spam filtering
    isSpam: boolean("is_spam").default(false).notNull(),

    // Relations
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "cascade" }),
  },
  (table) => ({
    hashIdx: uniqueIndex("transactions_hash_idx").on(table.hash),
    walletIdIdx: index("transactions_wallet_id_idx").on(table.walletId),
    timestampIdx: index("transactions_timestamp_idx").on(table.blockTimestamp),
  })
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

// ============================================================================
// PRICE CACHE TABLE
// ============================================================================
export const priceCache = pgTable(
  "price_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tokenAddress: varchar("token_address", { length: 42 }).notNull(),
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
    usdPrice: doublePrecision("usd_price").notNull(),
  },
  (table) => ({
    tokenDateIdx: uniqueIndex("price_cache_token_date_idx").on(
      table.tokenAddress,
      table.date
    ),
  })
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type PriceCache = typeof priceCache.$inferSelect;
export type NewPriceCache = typeof priceCache.$inferInsert;

// ============================================================================
// ENUMS (Application-level, not DB-level for flexibility)
// ============================================================================
export const TransactionType = {
  INCOME: "income",
  SWAP: "swap",
  EXPENSE: "expense",
  TRANSFER: "transfer",
  UNCATEGORIZED: "uncategorized",
} as const;

export type TransactionTypeValue =
  (typeof TransactionType)[keyof typeof TransactionType];
```

## Entity Details

### Wallet

| Field       | Type        | Constraints           | Description                          |
| ----------- | ----------- | --------------------- | ------------------------------------ |
| `id`        | UUID        | PK, auto-generated    | Unique identifier                    |
| `address`   | VARCHAR(42) | NOT NULL, UNIQUE      | Ethereum address (0x + 40 hex chars) |
| `createdAt` | TIMESTAMP   | NOT NULL, default NOW | Record creation time                 |

**Indexes**:

- `wallets_address_idx` (UNIQUE) - Fast lookup by wallet address

**Relationships**:

- One-to-Many with Transaction

---

### Transaction

| Field            | Type         | Constraints                       | Description                                  |
| ---------------- | ------------ | --------------------------------- | -------------------------------------------- |
| `id`             | UUID         | PK, auto-generated                | Unique identifier                            |
| `hash`           | VARCHAR(66)  | NOT NULL, UNIQUE                  | Transaction hash (0x + 64 hex chars)         |
| `blockTimestamp` | TIMESTAMP    | NOT NULL                          | When transaction was mined                   |
| `type`           | VARCHAR(20)  | NOT NULL, default 'uncategorized' | Classification: income/swap/expense/transfer |
| `description`    | VARCHAR(255) | NULLABLE                          | AI-generated human-readable description      |
| `tokenSymbol`    | VARCHAR(20)  | NOT NULL                          | Token symbol (ETH, USDC, etc.)               |
| `tokenAddress`   | VARCHAR(42)  | NULLABLE                          | Token contract address (null for native ETH) |
| `amount`         | DOUBLE       | NOT NULL                          | Token amount transferred                     |
| `usdPriceAtTime` | DOUBLE       | NULLABLE                          | USD price at transaction time                |
| `totalUsdValue`  | DOUBLE       | NULLABLE                          | Computed: amount × usdPriceAtTime            |
| `isSpam`         | BOOLEAN      | NOT NULL, default false           | Spam/scam token flag                         |
| `walletId`       | UUID         | FK → wallets.id                   | Parent wallet reference                      |

**Indexes**:

- `transactions_hash_idx` (UNIQUE) - Fast lookup by transaction hash
- `transactions_wallet_id_idx` - Fast lookup by wallet
- `transactions_timestamp_idx` - Sorting by date

**Relationships**:

- Many-to-One with Wallet (CASCADE delete)

---

### PriceCache

| Field          | Type        | Constraints        | Description                        |
| -------------- | ----------- | ------------------ | ---------------------------------- |
| `id`           | UUID        | PK, auto-generated | Unique identifier                  |
| `tokenAddress` | VARCHAR(42) | NOT NULL           | Token contract address or "native" |
| `date`         | VARCHAR(10) | NOT NULL           | Date in YYYY-MM-DD format          |
| `usdPrice`     | DOUBLE      | NOT NULL           | USD price on that date             |

**Indexes**:

- `price_cache_token_date_idx` (UNIQUE) - Fast lookup by token + date combination

**Design Notes**:

- Date stored as string for simplicity and reliable matching
- Native ETH uses special address "native" or "0x0000000000000000000000000000000000000000"
- One entry per token per day (start-of-day price)

---

## Validation Rules

### Wallet Address

```typescript
// Must be valid Ethereum address
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
```

### Transaction Hash

```typescript
// Must be valid transaction hash
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
```

### Transaction Type

```typescript
// Must be one of defined types
const VALID_TYPES = ["income", "swap", "expense", "transfer", "uncategorized"];
```

### Date Format

```typescript
// PriceCache date must be YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
```

---

## State Transitions

### Transaction Processing States

```
┌─────────────────┐
│     FETCHED     │ ← Agent 1: The Auditor
│   (raw data)    │   type = 'uncategorized'
└────────┬────────┘   usdPriceAtTime = null
         │
         ▼
┌─────────────────┐
│     PRICED      │ ← Agent 2: The Appraiser
│  (has USD val)  │   usdPriceAtTime = X.XX
└────────┬────────┘   totalUsdValue = computed
         │
         ▼
┌─────────────────┐
│   CATEGORIZED   │ ← Agent 3: The Accountant
│  (complete)     │   type = 'swap'/'income'/etc.
└─────────────────┘   description = "Uniswap Trade..."
```

---

## Query Patterns

### Common Queries

```typescript
// Get all transactions for a wallet
const txs = await db
  .select()
  .from(transactions)
  .where(eq(transactions.walletId, walletId))
  .orderBy(desc(transactions.blockTimestamp));

// Get unpriced transactions
const unpriced = await db
  .select()
  .from(transactions)
  .where(
    and(
      eq(transactions.walletId, walletId),
      isNull(transactions.usdPriceAtTime)
    )
  );

// Get uncategorized transactions
const uncategorized = await db
  .select()
  .from(transactions)
  .where(eq(transactions.type, "uncategorized"));

// Check price cache
const cached = await db
  .select()
  .from(priceCache)
  .where(
    and(
      eq(priceCache.tokenAddress, tokenAddress),
      eq(priceCache.date, dateString)
    )
  )
  .limit(1);

// Get wallet by address
const wallet = await db
  .select()
  .from(wallets)
  .where(eq(wallets.address, address.toLowerCase()))
  .limit(1);
```

---

## Migration Notes

### Initial Migration

The schema will be pushed using `drizzle-kit push`:

```bash
npx drizzle-kit push
```

### Future Migrations

For schema changes, create migration files:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## Data Retention

For MVP, no automatic data retention policies. Future considerations:

- Archive transactions older than 7 years (tax record requirements)
- Prune PriceCache entries for delisted tokens
- Soft delete wallets with `deletedAt` timestamp
