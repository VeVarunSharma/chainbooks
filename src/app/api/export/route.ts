import { NextRequest, NextResponse } from "next/server";
import { db, transactions } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { createCsvString, createExcelWorkbook } from "@/lib/utils/export-csv";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletId = searchParams.get("walletId");
  const format = searchParams.get("format") || "csv";

  if (!walletId) {
    return NextResponse.json(
      { error: "walletId is required" },
      { status: 400 }
    );
  }

  try {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.blockTimestamp));

    // Filter out spam for export
    const cleanTxs = txs.filter((tx) => !tx.isSpam);

    const dateStr = new Date().toISOString().split("T")[0];

    if (format === "xlsx") {
      const wb = createExcelWorkbook(cleanTxs);
      const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="chainbooks-export-${dateStr}.xlsx"`,
        },
      });
    }

    // Default to CSV
    const csvString = createCsvString(cleanTxs);
    return new NextResponse(csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="chainbooks-export-${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export transactions:", error);
    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 }
    );
  }
}
