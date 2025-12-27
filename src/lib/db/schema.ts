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
  (table) => [uniqueIndex("wallets_address_idx").on(table.address)]
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
  (table) => [
    uniqueIndex("transactions_hash_idx").on(table.hash),
    index("transactions_wallet_id_idx").on(table.walletId),
    index("transactions_timestamp_idx").on(table.blockTimestamp),
  ]
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
  (table) => [
    uniqueIndex("price_cache_token_date_idx").on(
      table.tokenAddress,
      table.date
    ),
  ]
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
