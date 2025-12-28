# Implementation Plan: Chainbooks - Crypto Tax & Analysis MVP

**Branch**: `001-crypto-tax-mvp` | **Date**: December 27, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-crypto-tax-mvp/spec.md`

## Summary

Build a B2B crypto analysis web app that solves "CSV Hell" for business owners with multiple crypto wallets. The system uses a "Council of Agents" architecture with three specialized agents:

1. **The Auditor** - Fetches transaction history via Quicknode API
2. **The Appraiser** - Prices tokens using CoinGecko with aggressive caching
3. **The Accountant** - Classifies transactions using Azure AI Foundry

The MVP delivers a dashboard where users enter wallet addresses, view processed transactions in a data table, and export clean CSV/Excel files for tax purposes.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Framework**: Next.js 15 (App Router)
**Primary Dependencies**: React 18, Tailwind CSS, shadcn/ui, Drizzle ORM
**Storage**: PostgreSQL (Azure PostgreSQL) via Drizzle ORM
**AI/LLM**: Azure AI Foundry Agent Kit
**Blockchain Data**: Quicknode API
**Price Data**: CoinGecko API
**Testing**: Jest (unit/component)
**Target Platform**: Web (modern browsers)
**Project Type**: Next.js App Router (monolithic frontend with Server Actions)
**Performance Goals**: LCP < 2s, Full sync pipeline < 60s for 100 transactions
**Constraints**: Server-side processing for API keys, rate limit handling for external APIs
**Scale/Scope**: MVP for single-user demo, Ethereum Mainnet only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                 | Requirement                                         | Status  |
| ------------------------- | --------------------------------------------------- | ------- |
| I. Modular Architecture   | Feature is self-contained with explicit boundaries  | ✅ Pass |
| II. Loose Coupling        | No cross-feature imports; uses contracts/interfaces | ✅ Pass |
| III. TypeScript Strict    | All code compiles under strict mode                 | ✅ Pass |
| IV. Component Composition | UI follows presentational/container split           | ✅ Pass |
| V. Test-First             | Test strategy defined before implementation         | ✅ Pass |
| VI. Simplicity & YAGNI    | No premature abstractions; complexity justified     | ✅ Pass |

**Violations requiring justification**:

| Deviation                     | Justification                                                              |
| ----------------------------- | -------------------------------------------------------------------------- |
| Drizzle ORM instead of Prisma | User explicitly requested Drizzle; both are modern TypeScript-first ORMs   |
| Jest instead of Vitest        | User explicitly requested Jest for testing framework                       |
| Next.js 15 instead of 14      | User specified Next.js 15; backwards-compatible with constitution patterns |

## Project Structure

### Documentation (this feature)

```text
specs/001-crypto-tax-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output - API research & decisions
├── data-model.md        # Phase 1 output - Drizzle schema design
├── quickstart.md        # Phase 1 output - Setup instructions
├── contracts/           # Phase 1 output - API contracts
│   └── api.yaml         # OpenAPI specification
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Dashboard home page
│   ├── globals.css               # Tailwind imports
│   └── api/                      # API routes (if needed)
│       └── export/
│           └── route.ts          # CSV export endpoint
├── features/                     # Feature modules
│   └── wallet-analysis/          # Main feature module
│       ├── components/           # Feature components
│       │   ├── WalletForm.tsx    # Address input form
│       │   ├── TransactionTable.tsx  # Data table
│       │   ├── TransactionRow.tsx    # Table row component
│       │   └── ExportButton.tsx  # CSV export button
│       ├── actions/              # Server Actions (Agents)
│       │   ├── audit-wallet.ts   # Agent 1: The Auditor
│       │   ├── appraise-transactions.ts  # Agent 2: The Appraiser
│       │   └── categorize-transactions.ts # Agent 3: The Accountant
│       ├── services/             # Business logic
│       │   ├── quicknode.ts      # Quicknode API client
│       │   ├── coingecko.ts      # CoinGecko API client
│       │   └── ai-classifier.ts  # Azure AI Foundry client
│       ├── hooks/                # React hooks
│       │   └── useWalletSync.ts  # Sync state management
│       ├── types.ts              # Feature types
│       └── index.ts              # Public exports
├── lib/                          # Shared utilities
│   ├── db/                       # Database layer
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema.ts             # Drizzle schema
│   │   └── migrate.ts            # Migration runner
│   ├── utils/                    # Pure utilities
│   │   ├── address-validation.ts # Ethereum address validation
│   │   ├── date-formatting.ts    # Date utilities
│   │   └── export-csv.ts         # CSV generation
│   └── config/                   # Configuration
│       └── env.ts                # Environment variables
├── components/                   # Shared UI (shadcn/ui)
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── table.tsx
│       ├── skeleton.tsx
│       └── card.tsx
└── types/                        # Shared type definitions
    └── index.ts                  # Global types

# Configuration files (root)
├── drizzle.config.ts             # Drizzle configuration
├── jest.config.ts                # Jest configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.local                    # Environment variables (local)
└── .env.example                  # Environment template
```

**Structure Decision**: Standard Next.js 15 App Router with feature-based organization. The `wallet-analysis` feature is self-contained with its own components, actions, and services following the constitution's modular architecture principle.

## Implementation Phases

### Phase 1: Foundation & Database

**Goal**: Initialize project with Next.js 15, configure database, and verify connectivity.

**Tasks**:

1. Initialize Next.js 15 project with TypeScript and Tailwind
2. Install and configure shadcn/ui components (Button, Input, Badge, Table, Skeleton, Card)
3. Install Drizzle ORM and drizzle-kit
4. Set up Azure PostgreSQL connection in `.env.local`
5. Define Drizzle schema (Wallet, Transaction, PriceCache tables)
6. Run `npx drizzle-kit push` to sync schema
7. Create seed script to verify database connection

**Verification**: Run seed script and confirm tables exist in PostgreSQL.

---

### Phase 2: Agent 1 - The Auditor (Transaction Fetcher)

**Goal**: Fetch and store raw transactions from Quicknode API.

**Tasks**:

1. Create Quicknode API client (`src/features/wallet-analysis/services/quicknode.ts`)
2. Implement `auditWallet(address: string)` Server Action
3. Logic flow:
   - Validate Ethereum address format
   - Check database for existing wallet/transactions
   - If new wallet: fetch last 100 transactions from Quicknode
   - Map raw data to Transaction schema
   - Upsert wallet and transactions into database

**Verification**: Input a real Ethereum wallet address, verify raw transactions appear in database.

---

### Phase 3: Agent 2 - The Appraiser (Price Fetcher)

**Goal**: Fetch and cache historical token prices from CoinGecko.

**Tasks**:

1. Create CoinGecko API client (`src/features/wallet-analysis/services/coingecko.ts`)
2. Implement `getPrice(tokenAddress: string, date: Date)` utility
3. Implement caching layer:
   - Check PriceCache table first
   - If cache miss: call CoinGecko historical API
   - Save result to PriceCache
   - Handle rate limits with exponential backoff
4. Create `appraiseTransactions(walletId: string)` Server Action
5. Iterate unpriced transactions and update `usdPriceAtTime` and `totalUsdValue`

**Verification**: Sync a wallet and verify transactions have USD values populated, check PriceCache has entries.

---

### Phase 4: Agent 3 - The Accountant (AI Classifier)

**Goal**: Classify transactions using Azure AI Foundry.

**Tasks**:

1. Install Azure AI Foundry Agent Kit dependencies
2. Create AI classifier client (`src/features/wallet-analysis/services/ai-classifier.ts`)
3. Create `categorizeTransactions(walletId: string)` Server Action
4. Construct prompt with transaction metadata:
   - TX Hash, Method ID, Token In/Out, Value
   - Classification options: Income, Swap, Expense, Transfer
   - Request human-readable description
5. Parse AI response and update Transaction `type` and `description` fields
6. Handle classification failures gracefully (mark as "uncategorized")

**Verification**: Sync a wallet with various transaction types, verify correct classifications.

---

### Phase 5: Frontend & Export

**Goal**: Build the dashboard UI and export functionality.

**Tasks**:

1. Build Dashboard page (`src/app/page.tsx`):
   - WalletForm component with address input
   - "Sync Wallet" button triggering all three agents
2. Build TransactionTable component:
   - shadcn/ui DataTable with columns: Date, Type, Description, Token, USD Value, TX Hash
   - Type displayed as color-coded Badge
   - TX Hash links to Etherscan
3. Connect table to database (Server Component data fetching)
4. Implement "Export CSV" button:
   - Use xlsx library for Excel-compatible CSV
   - Download file with formatted columns

**Verification**: Complete end-to-end flow: enter wallet → see transactions → download CSV.

---

### Phase 6: Polish & Error Handling

**Goal**: Add loading states, spam filtering, and error handling.

**Tasks**:

1. Add Skeleton loading state during agent processing
2. Implement spam filtering:
   - Flag transactions with no token symbol
   - Hide transactions with value < $0.01 by default
   - Add "Show Hidden" toggle
3. Add comprehensive error handling:
   - User-friendly error messages for API failures
   - Graceful degradation for missing price data (show "N/A")
   - Retry logic for transient failures
4. Add error logging for debugging

**Verification**: Test with edge cases: empty wallet, rate-limited API, spam tokens.

---

## Testing Strategy

| Layer        | Framework                    | Focus Areas                                           |
| ------------ | ---------------------------- | ----------------------------------------------------- |
| Unit         | Jest                         | Utility functions, address validation, CSV formatting |
| Component    | Jest + React Testing Library | Form validation, table rendering, button states       |
| Integration  | Jest                         | Server Actions with mocked APIs                       |
| E2E (future) | Playwright                   | Full sync flow (optional for MVP)                     |

**Test files colocated with source** (e.g., `quicknode.test.ts` next to `quicknode.ts`).

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/chainbooks

# Quicknode API
QUICKNODE_API_URL=https://your-endpoint.quiknode.pro
QUICKNODE_API_KEY=your-api-key

# CoinGecko API
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your-api-key  # Optional for free tier

# Azure AI Foundry
AZURE_AI_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_AI_API_KEY=your-api-key
```

## Complexity Tracking

> No constitution violations requiring justification. All deviations (Drizzle, Jest, Next.js 15) are user-specified and compatible with constitution principles.

## Dependencies

### Production

- `next@15` - Framework
- `react@18`, `react-dom@18` - UI library
- `drizzle-orm` - Database ORM
- `@neondatabase/serverless` or `pg` - PostgreSQL driver
- `@azure/ai-inference` - Azure AI Foundry
- `zod` - Schema validation
- `xlsx` - CSV/Excel export

### Development

- `drizzle-kit` - Migrations and studio
- `typescript@5` - Language
- `tailwindcss`, `postcss`, `autoprefixer` - Styling
- `jest`, `@testing-library/react` - Testing
- `@types/node`, `@types/react` - Type definitions

## Risk Mitigation

| Risk                      | Mitigation                                                   |
| ------------------------- | ------------------------------------------------------------ |
| CoinGecko rate limits     | Aggressive caching in PriceCache, exponential backoff        |
| Quicknode API changes     | Abstract behind service layer, version pin SDK               |
| AI classification errors  | Graceful fallback to "uncategorized", manual override future |
| Large transaction volumes | Pagination, background processing for wallets > 100 txs      |
