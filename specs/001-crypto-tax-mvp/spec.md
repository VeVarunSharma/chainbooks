# Feature Specification: Chainbooks - Crypto Tax & Analysis MVP

**Feature Branch**: `1-crypto-tax-mvp`  
**Created**: December 27, 2025  
**Status**: Draft  
**Input**: User description: "B2B-focused crypto analysis web app solving CSV Hell for business owners with multiple crypto wallets via a Council of Agents (Multi-Agent System)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Sync Wallet Transactions (Priority: P1)

As a business owner holding multiple crypto wallets, I want to enter my wallet address and have the system automatically fetch, price, and categorize all my transactions so that I can understand my crypto activity without manually parsing raw blockchain data.

**Why this priority**: This is the core value proposition of the product. Without the ability to sync and analyze wallet transactions, the product delivers no value. This story encompasses the entire "Council of Agents" flow.

**Independent Test**: Can be fully tested by entering a wallet address and verifying that transactions appear in the results table with USD values and category labels. Delivers immediate value by transforming raw blockchain data into actionable financial records.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I enter a valid Ethereum wallet address and click "Sync Wallet", **Then** I see a loading indicator while agents process, and within 60 seconds the results table populates with my last 100 transactions.

2. **Given** the system has fetched transactions, **When** each transaction is processed, **Then** it displays: Date, Type (as a badge - Swap/Income/Expense/Transfer), AI-generated Description, Token Amount, USD Value at time of transaction, and clickable TX Hash.

3. **Given** a transaction involves a token with no CoinGecko price data, **When** the Appraiser agent runs, **Then** the USD Value field shows "N/A" and the transaction is still displayed with other available data.

4. **Given** I have previously synced a wallet, **When** I sync the same wallet again, **Then** only new transactions are fetched and existing transactions retain their categorization and pricing data.

---

### User Story 2 - Export Data for Tax Purposes (Priority: P2)

As a business owner preparing for tax season, I want to export my categorized crypto transactions to CSV/Excel format so that I can share it with my accountant or import it into tax preparation software.

**Why this priority**: Export functionality is the primary deliverable for tax purposes. While sync is foundational, export is what customers directly use for their stated goal of solving "CSV Hell."

**Independent Test**: Can be fully tested by clicking "Export CSV" after a wallet sync and verifying the downloaded file contains all displayed transactions with correct formatting. Delivers value by providing a clean, accountant-ready document.

**Acceptance Scenarios**:

1. **Given** I have synced transactions in the results table, **When** I click "Export CSV", **Then** a .csv file downloads containing columns: Date, Type, Description, Token Symbol, Token Amount, USD Value, TX Hash.

2. **Given** I export transactions, **When** I open the file in Excel, **Then** the data is properly formatted with dates parseable by Excel and numeric values as numbers (not text).

3. **Given** some transactions have missing USD values, **When** I export, **Then** those cells show empty/blank rather than error text.

---

### User Story 3 - Filter Spam Tokens (Priority: P3)

As a user reviewing my transaction history, I want the system to automatically identify and hide spam/scam tokens so that my transaction list only shows legitimate activity.

**Why this priority**: Improves data quality and user experience but is not blocking for core functionality. Users can still use the product without this feature.

**Independent Test**: Can be tested by syncing a wallet known to contain spam tokens and verifying they are flagged or hidden from the default view. Delivers cleaner data for tax reporting.

**Acceptance Scenarios**:

1. **Given** a transaction involves a token with no symbol, **When** it is displayed, **Then** it is flagged with a "Suspicious" indicator or hidden by default.

2. **Given** a transaction involves a known spam contract address, **When** it is processed, **Then** it is automatically flagged and excluded from the default view.

3. **Given** spam transactions are hidden, **When** I toggle "Show Hidden", **Then** all transactions including flagged spam are visible with appropriate warnings.

---

### User Story 4 - View Wallet Dashboard (Priority: P4)

As a first-time user, I want to see a clean, professional dashboard where I can enter wallet addresses so that I can start the analysis process with confidence.

**Why this priority**: The dashboard is the entry point but has minimal complexity. A simple input field is sufficient for MVP.

**Independent Test**: Can be tested by loading the app and verifying the wallet address input field is visible and functional. Delivers user confidence through professional appearance.

**Acceptance Scenarios**:

1. **Given** I navigate to the application, **When** the page loads, **Then** I see a clean, professional interface with a prominent wallet address input field.

2. **Given** I enter an invalid wallet address format, **When** I attempt to sync, **Then** I receive a clear error message explaining the expected format.

---

### Edge Cases

- What happens when the user enters a wallet with zero transactions?
  - System displays "No transactions found for this wallet" message
- What happens when CoinGecko rate limits are hit during pricing?
  - System pauses, retries with exponential backoff, and if still failing, skips pricing for that batch and notifies the user
- What happens when Quicknode API is unavailable?
  - System displays error message and allows retry, does not crash
- What happens when the AI classification agent fails or times out?
  - Transaction is marked as "uncategorized" with a generic description
- What happens when a token was not listed on CoinGecko at the time of transaction?
  - USD value shows "N/A" and user is informed the token has no historical price data

## Requirements _(mandatory)_

### Functional Requirements

**Agent 1: The Auditor (Transaction Fetcher)**

- **FR-001**: System MUST accept an Ethereum wallet address as input and validate its format before processing.
- **FR-002**: System MUST check the local database for existing transactions before making external API calls.
- **FR-003**: System MUST fetch up to 100 most recent transactions from Quicknode API for wallets with no local history.
- **FR-004**: System MUST standardize raw transaction data into a consistent format regardless of transaction type.
- **FR-005**: System MUST store fetched transactions in PostgreSQL via Prisma ORM.

**Agent 2: The Appraiser (Price Fetcher)**

- **FR-006**: System MUST check the PriceCache table for existing token price data before calling CoinGecko.
- **FR-007**: System MUST retrieve historical USD prices from CoinGecko for the exact date of each transaction.
- **FR-008**: System MUST cache all retrieved prices in the PriceCache table to minimize API calls.
- **FR-009**: System MUST handle CoinGecko rate limits by implementing retry logic with exponential backoff.
- **FR-010**: System MUST calculate and store the total USD value (amount × usdPriceAtTime) for each transaction.

**Agent 3: The Accountant (AI Classifier)**

- **FR-011**: System MUST analyze transaction metadata (method ID, token movements, value) using Azure AI Foundry.
- **FR-012**: System MUST classify each transaction into one of: Income, Swap, Expense, Transfer.
- **FR-013**: System MUST generate a human-readable description for each transaction (e.g., "Uniswap Trade: USDC to ETH").
- **FR-014**: System MUST store classifications and descriptions in the Transaction table.

**Data Management**

- **FR-015**: System MUST persist wallet addresses in the Wallet table with unique constraint.
- **FR-016**: System MUST maintain referential integrity between Wallet and Transaction tables.
- **FR-017**: System MUST enforce unique constraint on transaction hashes to prevent duplicates.
- **FR-018**: System MUST use the provided Prisma schema with Wallet, Transaction, and PriceCache models.

**User Interface**

- **FR-019**: System MUST provide a dashboard with wallet address input field.
- **FR-020**: System MUST display transaction results in a DataTable component from shadcn/ui.
- **FR-021**: System MUST show transaction type as a color-coded Badge component.
- **FR-022**: System MUST provide a "Sync Wallet" button to trigger the agent pipeline.
- **FR-023**: System MUST provide an "Export CSV" button to download transaction data.
- **FR-024**: System MUST link transaction hashes to a block explorer.

**Spam Filtering**

- **FR-025**: System MUST flag transactions with tokens that have no symbol as potentially suspicious.
- **FR-026**: System MUST maintain a configurable list of known spam contract addresses.
- **FR-027**: System MUST provide toggle to show/hide flagged transactions.

**Error Handling**

- **FR-028**: System MUST display user-friendly error messages when API calls fail.
- **FR-029**: System MUST gracefully degrade when pricing data is unavailable (show N/A).
- **FR-030**: System MUST log all errors for debugging purposes.

### Key Entities

- **Wallet**: Represents a cryptocurrency wallet address. Contains: unique identifier, blockchain address, creation timestamp. Related to many Transactions.
- **Transaction**: Represents a single blockchain transaction. Contains: hash, timestamp, categorization (type + description), token details (symbol, address, amount), USD valuation fields. Belongs to one Wallet.
- **PriceCache**: Represents cached historical price data. Contains: token address, date (YYYY-MM-DD), USD price. Optimized for lookups by token+date combination.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can enter a wallet address and see fully processed transactions (fetched, priced, categorized) within 60 seconds for wallets with ≤100 transactions.
- **SC-002**: 90% of transactions are successfully categorized with one of the four classification types.
- **SC-003**: Price cache hit rate exceeds 80% after initial population for returning users or multiple wallets with overlapping tokens.
- **SC-004**: Exported CSV files are valid and openable in Excel, Google Sheets, and common tax software without formatting errors.
- **SC-005**: System handles CoinGecko rate limits without crashing, successfully completing pricing for 95% of eligible transactions.
- **SC-006**: Dashboard loads within 2 seconds on standard broadband connection.
- **SC-007**: 80% of test users can complete the full workflow (enter wallet → view results → export CSV) without assistance on first attempt.
- **SC-008**: Zero critical errors (crashes, data loss) during normal operation flow.

## Assumptions

- Users will primarily work with Ethereum Mainnet wallets for MVP; multi-chain support is future scope.
- Quicknode API provides sufficient historical transaction data for the last 100 transactions.
- CoinGecko's free tier rate limits are acceptable for MVP usage patterns; paid tier upgrade is a future consideration.
- Azure AI Foundry Agent Kit is suitable for the classification task and provides reasonable latency.
- Users have modern browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled.
- PostgreSQL is provisioned via Azure PostgreSQL with adequate connection limits for MVP traffic.
