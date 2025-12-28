# Quickstart: Chainbooks - Crypto Tax & Analysis MVP

**Feature Branch**: `001-crypto-tax-mvp`  
**Date**: December 27, 2025

## Prerequisites

- **Node.js** 18.x or higher
- **pnpm** (recommended) or npm
- **PostgreSQL** database (Azure PostgreSQL or local)
- **API Keys**:
  - Quicknode API key
  - CoinGecko API key (optional for free tier)
  - Azure AI Foundry credentials

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd chainbooks

# Checkout feature branch
git checkout 001-crypto-tax-mvp

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/chainbooks?sslmode=require"

# Quicknode API
QUICKNODE_API_URL="https://your-endpoint.quiknode.pro/your-api-key/"

# CoinGecko API (optional - works without key at lower rate limits)
COINGECKO_API_KEY=""

# Azure AI Foundry
AZURE_AI_ENDPOINT="https://your-resource.cognitiveservices.azure.com"
AZURE_AI_API_KEY="your-api-key"
AZURE_AI_DEPLOYMENT="gpt-4o-mini"
```

### 3. Database Setup

```bash
# Generate Drizzle client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open Drizzle Studio to view data
pnpm db:studio
```

### 4. Install shadcn/ui Components

```bash
# Initialize shadcn/ui
pnpm dlx shadcn-ui@latest init

# Install required components
pnpm dlx shadcn-ui@latest add button input badge table skeleton card
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## Project Scripts

| Script      | Command            | Description                      |
| ----------- | ------------------ | -------------------------------- |
| Dev Server  | `pnpm dev`         | Start Next.js development server |
| Build       | `pnpm build`       | Production build                 |
| Start       | `pnpm start`       | Start production server          |
| Lint        | `pnpm lint`        | Run ESLint                       |
| Test        | `pnpm test`        | Run Jest tests                   |
| Test Watch  | `pnpm test:watch`  | Run tests in watch mode          |
| DB Generate | `pnpm db:generate` | Generate Drizzle client          |
| DB Push     | `pnpm db:push`     | Push schema to database          |
| DB Studio   | `pnpm db:studio`   | Open Drizzle Studio              |

---

## Folder Structure

```
chainbooks/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx            # Dashboard
│   │   └── layout.tsx          # Root layout
│   ├── features/
│   │   └── wallet-analysis/    # Main feature
│   │       ├── actions/        # Server Actions
│   │       ├── components/     # UI components
│   │       └── services/       # API clients
│   ├── lib/
│   │   └── db/                 # Database layer
│   │       ├── schema.ts       # Drizzle schema
│   │       └── index.ts        # DB client
│   └── components/ui/          # shadcn/ui components
├── specs/                      # Feature specifications
├── drizzle.config.ts           # Drizzle configuration
└── package.json
```

---

## API Keys Setup

### Quicknode

1. Create account at [quicknode.com](https://www.quicknode.com/)
2. Create an Ethereum Mainnet endpoint
3. Copy the HTTP Provider URL to `QUICKNODE_API_URL`

### CoinGecko

1. Create account at [coingecko.com](https://www.coingecko.com/en/api)
2. (Free tier works without key, but with rate limits)
3. For Demo API key, add to `COINGECKO_API_KEY`

### Azure AI Foundry

1. Create Azure AI resource in Azure Portal
2. Deploy GPT-4o-mini model
3. Copy endpoint and key to environment variables

---

## Testing a Wallet

1. Start the dev server: `pnpm dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Enter a known Ethereum address (e.g., Vitalik's address):
   ```
   0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
   ```
4. Click "Sync Wallet"
5. Wait for agents to process (up to 60 seconds)
6. View categorized transactions in the table
7. Click "Export CSV" to download

---

## Common Issues

### Database Connection Failed

```
Error: connect ECONNREFUSED
```

**Solution**: Check your `DATABASE_URL` is correct and the database is accessible.

### Quicknode API Error

```
Error: 401 Unauthorized
```

**Solution**: Verify your Quicknode API key is correct in the endpoint URL.

### CoinGecko Rate Limit

```
Error: 429 Too Many Requests
```

**Solution**: The system will automatically retry with exponential backoff. For frequent use, consider a paid API key.

### AI Classification Timeout

```
Error: Request timeout
```

**Solution**: Azure AI may be slow on first request. Retry or check Azure resource health.

---

## Development Workflow

### Phase-by-Phase Implementation

Follow the implementation plan in [plan.md](plan.md):

1. **Phase 1**: Foundation & Database ← Start here
2. **Phase 2**: Agent 1 - The Auditor
3. **Phase 3**: Agent 2 - The Appraiser
4. **Phase 4**: Agent 3 - The Accountant
5. **Phase 5**: Frontend & Export
6. **Phase 6**: Polish & Error Handling

### Verification at Each Phase

Each phase has verification steps. Don't proceed until the current phase passes verification.

---

## Support

- **Spec Document**: [spec.md](spec.md)
- **Implementation Plan**: [plan.md](plan.md)
- **Data Model**: [data-model.md](data-model.md)
- **API Contracts**: [contracts/api.yaml](contracts/api.yaml)
