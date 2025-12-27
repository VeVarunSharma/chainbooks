"use client";

import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/db/schema";
import { createCsvString } from "@/lib/utils/export-csv";

interface ExportButtonProps {
  transactions: Transaction[];
  disabled?: boolean;
}

export function ExportButton({ transactions, disabled }: ExportButtonProps) {
  const handleExport = () => {
    if (transactions.length === 0) return;

    // Filter out spam transactions for export
    const cleanTxs = transactions.filter((tx) => !tx.isSpam);

    // Generate CSV
    const csvString = createCsvString(cleanTxs);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chainbooks-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || transactions.length === 0}
      variant="outline"
    >
      Export CSV
    </Button>
  );
}
