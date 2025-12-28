import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { wallets, transactions, priceCache } from "./schema";

async function seed() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    // ========================================================================
    // CLEANUP: Delete existing data in correct FK order
    // ========================================================================
    console.log("🧹 Cleaning existing data...");

    await db.delete(transactions);
    console.log("   ✓ Cleared transactions table");

    await db.delete(priceCache);
    console.log("   ✓ Cleared price_cache table");

    await db.delete(wallets);
    console.log("   ✓ Cleared wallets table");

    // ========================================================================
    // SEED WALLETS
    // ========================================================================
    console.log("🏦 Seeding wallets...");

    const [wallet1, wallet2] = await db
      .insert(wallets)
      .values([
        { address: "0x742d35Cc6634C0532925a3b844Bc9e7595f7AAAA" },
        { address: "0x8ba1f109551bD432803012645Ac136ddd64BBBB" },
      ])
      .returning();

    console.log(`   ✓ Created wallet: ${wallet1.address}`);
    console.log(`   ✓ Created wallet: ${wallet2.address}`);

    // ========================================================================
    // SEED TRANSACTIONS (all TransactionType categories)
    // ========================================================================
    console.log("💸 Seeding transactions...");

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const txData = [
      // Wallet 1 - Income transactions
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234aaaa",
        blockTimestamp: new Date(now.getTime() - 30 * oneDay),
        type: "income",
        description: "Staking rewards received",
        tokenSymbol: "ETH",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: 0.5,
        usdPriceAtTime: 2400.0,
        totalUsdValue: 1200.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234bbbb",
        blockTimestamp: new Date(now.getTime() - 25 * oneDay),
        type: "income",
        description: "Airdrop from DeFi protocol",
        tokenSymbol: "UNI",
        tokenAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        amount: 100.0,
        usdPriceAtTime: 8.5,
        totalUsdValue: 850.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      // Wallet 1 - Swap transactions
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234cccc",
        blockTimestamp: new Date(now.getTime() - 20 * oneDay),
        type: "swap",
        description: "Swapped ETH for USDC on Uniswap",
        tokenSymbol: "USDC",
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        amount: 2500.0,
        usdPriceAtTime: 1.0,
        totalUsdValue: 2500.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234dddd",
        blockTimestamp: new Date(now.getTime() - 18 * oneDay),
        type: "swap",
        description: "Swapped USDC for WBTC",
        tokenSymbol: "WBTC",
        tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        amount: 0.025,
        usdPriceAtTime: 45000.0,
        totalUsdValue: 1125.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      // Wallet 1 - Expense transactions
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234eeee",
        blockTimestamp: new Date(now.getTime() - 15 * oneDay),
        type: "expense",
        description: "NFT purchase on OpenSea",
        tokenSymbol: "ETH",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: 0.3,
        usdPriceAtTime: 2350.0,
        totalUsdValue: 705.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234ffff",
        blockTimestamp: new Date(now.getTime() - 12 * oneDay),
        type: "expense",
        description: "Gas fees for contract deployment",
        tokenSymbol: "ETH",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: 0.05,
        usdPriceAtTime: 2380.0,
        totalUsdValue: 119.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      // Wallet 1 - Transfer transactions
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234gggg",
        blockTimestamp: new Date(now.getTime() - 10 * oneDay),
        type: "transfer",
        description: "Transfer to cold wallet",
        tokenSymbol: "ETH",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: 1.0,
        usdPriceAtTime: 2420.0,
        totalUsdValue: 2420.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      // Wallet 1 - Uncategorized transaction
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234hhhh",
        blockTimestamp: new Date(now.getTime() - 8 * oneDay),
        type: "uncategorized",
        description: null,
        tokenSymbol: "SHIB",
        tokenAddress: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
        amount: 10000000.0,
        usdPriceAtTime: 0.00001,
        totalUsdValue: 100.0,
        isSpam: false,
        walletId: wallet1.id,
      },
      // Wallet 2 - Mixed transactions
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234iiii",
        blockTimestamp: new Date(now.getTime() - 28 * oneDay),
        type: "income",
        description: "Mining rewards",
        tokenSymbol: "ETH",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: 2.0,
        usdPriceAtTime: 2300.0,
        totalUsdValue: 4600.0,
        isSpam: false,
        walletId: wallet2.id,
      },
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234jjjj",
        blockTimestamp: new Date(now.getTime() - 22 * oneDay),
        type: "swap",
        description: "Swapped ETH for DAI",
        tokenSymbol: "DAI",
        tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
        amount: 3000.0,
        usdPriceAtTime: 1.0,
        totalUsdValue: 3000.0,
        isSpam: false,
        walletId: wallet2.id,
      },
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234kkkk",
        blockTimestamp: new Date(now.getTime() - 14 * oneDay),
        type: "expense",
        description: "DeFi protocol fee",
        tokenSymbol: "ETH",
        tokenAddress: "0x0000000000000000000000000000000000000000",
        amount: 0.02,
        usdPriceAtTime: 2400.0,
        totalUsdValue: 48.0,
        isSpam: false,
        walletId: wallet2.id,
      },
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234llll",
        blockTimestamp: new Date(now.getTime() - 5 * oneDay),
        type: "transfer",
        description: "Withdrawal to exchange",
        tokenSymbol: "USDC",
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        amount: 5000.0,
        usdPriceAtTime: 1.0,
        totalUsdValue: 5000.0,
        isSpam: false,
        walletId: wallet2.id,
      },
      // Spam transaction example
      {
        hash: "0xabc123def456789012345678901234567890123456789012345678901234mmmm",
        blockTimestamp: new Date(now.getTime() - 3 * oneDay),
        type: "uncategorized",
        description: "Suspicious airdrop",
        tokenSymbol: "SCAM",
        tokenAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        amount: 999999999.0,
        usdPriceAtTime: 0.0,
        totalUsdValue: 0.0,
        isSpam: true,
        walletId: wallet1.id,
      },
    ];

    await db.insert(transactions).values(txData);
    console.log(`   ✓ Created ${txData.length} transactions`);

    // ========================================================================
    // SEED PRICE CACHE
    // ========================================================================
    console.log("💰 Seeding price cache...");

    const priceData = [
      // ETH prices for the last 30 days
      {
        tokenAddress: "0x0000000000000000000000000000000000000000",
        date: "2024-11-27",
        usdPrice: 2300.0,
      },
      {
        tokenAddress: "0x0000000000000000000000000000000000000000",
        date: "2024-12-02",
        usdPrice: 2400.0,
      },
      {
        tokenAddress: "0x0000000000000000000000000000000000000000",
        date: "2024-12-07",
        usdPrice: 2350.0,
      },
      {
        tokenAddress: "0x0000000000000000000000000000000000000000",
        date: "2024-12-12",
        usdPrice: 2380.0,
      },
      {
        tokenAddress: "0x0000000000000000000000000000000000000000",
        date: "2024-12-17",
        usdPrice: 2420.0,
      },
      {
        tokenAddress: "0x0000000000000000000000000000000000000000",
        date: "2024-12-22",
        usdPrice: 2450.0,
      },
      // USDC prices (stablecoin)
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        date: "2024-12-07",
        usdPrice: 1.0,
      },
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        date: "2024-12-22",
        usdPrice: 1.0,
      },
      // WBTC prices
      {
        tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        date: "2024-12-09",
        usdPrice: 45000.0,
      },
      // UNI prices
      {
        tokenAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        date: "2024-12-02",
        usdPrice: 8.5,
      },
      // DAI prices
      {
        tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
        date: "2024-12-05",
        usdPrice: 1.0,
      },
    ];

    await db.insert(priceCache).values(priceData);
    console.log(`   ✓ Created ${priceData.length} price cache entries`);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log("\n✅ Database seeded successfully!");
    console.log("   📊 Summary:");
    console.log(`      - Wallets: 2`);
    console.log(`      - Transactions: ${txData.length}`);
    console.log(`      - Price cache entries: ${priceData.length}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await pool.end();
    console.log("\n🔌 Database connection closed");
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
