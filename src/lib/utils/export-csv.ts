import * as XLSX from "xlsx";
import type { Transaction } from "@/lib/db/schema";
import { formatDisplayDate } from "./date-formatting";

export interface ExportTransaction {
  date: string;
  type: string;
  description: string;
  tokenSymbol: string;
  tokenAmount: number;
  usdValue: string;
  txHash: string;
}

/**
 * Transforms database transactions to export format
 * @param transactions - Array of transactions from database
 * @returns Array of formatted export transactions
 */
export function transformForExport(
  transactions: Transaction[]
): ExportTransaction[] {
  return transactions.map((tx) => ({
    date: formatDisplayDate(tx.blockTimestamp),
    type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
    description: tx.description || "",
    tokenSymbol: tx.tokenSymbol,
    tokenAmount: tx.amount,
    usdValue:
      tx.totalUsdValue !== null ? `$${tx.totalUsdValue.toFixed(2)}` : "N/A",
    txHash: tx.hash,
  }));
}

/**
 * Creates a CSV file from transactions
 * @param transactions - Array of transactions to export
 * @returns CSV string
 */
export function createCsvString(transactions: Transaction[]): string {
  const data = transformForExport(transactions);

  // Create header row
  const headers = [
    "Date",
    "Type",
    "Description",
    "Token Symbol",
    "Token Amount",
    "USD Value",
    "TX Hash",
  ];

  // Create data rows
  const rows = data.map((tx) => [
    tx.date,
    tx.type,
    tx.description,
    tx.tokenSymbol,
    tx.tokenAmount.toString(),
    tx.usdValue,
    tx.txHash,
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  return csvContent;
}

/**
 * Creates an Excel workbook from transactions
 * @param transactions - Array of transactions to export
 * @returns XLSX workbook
 */
export function createExcelWorkbook(
  transactions: Transaction[]
): XLSX.WorkBook {
  const data = transformForExport(transactions);

  // Create worksheet data
  const wsData = [
    [
      "Date",
      "Type",
      "Description",
      "Token Symbol",
      "Token Amount",
      "USD Value",
      "TX Hash",
    ],
    ...data.map((tx) => [
      tx.date,
      tx.type,
      tx.description,
      tx.tokenSymbol,
      tx.tokenAmount,
      tx.usdValue,
      tx.txHash,
    ]),
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [
    { wch: 15 }, // Date
    { wch: 12 }, // Type
    { wch: 40 }, // Description
    { wch: 12 }, // Token Symbol
    { wch: 15 }, // Token Amount
    { wch: 12 }, // USD Value
    { wch: 68 }, // TX Hash
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  return wb;
}

/**
 * Generates Excel file buffer for download
 * @param transactions - Array of transactions to export
 * @returns Uint8Array containing Excel file
 */
export function generateExcelBuffer(transactions: Transaction[]): Uint8Array {
  const wb = createExcelWorkbook(transactions);
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

/**
 * Generates CSV file buffer for download
 * @param transactions - Array of transactions to export
 * @returns Uint8Array containing CSV file
 */
export function generateCsvBuffer(transactions: Transaction[]): Uint8Array {
  const csvString = createCsvString(transactions);
  return new TextEncoder().encode(csvString);
}
