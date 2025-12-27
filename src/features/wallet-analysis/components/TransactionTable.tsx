"use client";

import type { Transaction } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/utils/date-formatting";
import {
  truncateTxHash,
  getEtherscanTxUrl,
} from "@/lib/utils/address-validation";
import type { TransactionTypeValue } from "@/lib/db/schema";

interface TransactionRowProps {
  transaction: Transaction;
}

function TransactionRow({ transaction: tx }: TransactionRowProps) {
  const badgeVariant = tx.type as TransactionTypeValue;

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        {formatDisplayDate(tx.blockTimestamp)}
      </TableCell>
      <TableCell>
        <Badge variant={badgeVariant}>
          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {tx.description || "-"}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {tx.amount.toFixed(4)} {tx.tokenSymbol}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {tx.totalUsdValue !== null ? `$${tx.totalUsdValue.toFixed(2)}` : "N/A"}
      </TableCell>
      <TableCell>
        <a
          href={getEtherscanTxUrl(tx.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-mono text-sm"
        >
          {truncateTxHash(tx.hash)}
        </a>
      </TableCell>
    </TableRow>
  );
}

interface TransactionTableProps {
  transactions: Transaction[];
  showSpam?: boolean;
}

export function TransactionTable({
  transactions,
  showSpam = false,
}: TransactionTableProps) {
  const displayedTxs = showSpam
    ? transactions
    : transactions.filter((tx) => !tx.isSpam);

  if (displayedTxs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found. Enter a wallet address to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>USD Value</TableHead>
          <TableHead>TX Hash</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayedTxs.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </TableBody>
    </Table>
  );
}
