import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getErpTableColumns } from "../../lib/erp-column-service";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tableId = String(req.query.tableId ?? "").trim();
  if (!tableId) {
    return res.status(400).json({ error: "tableId is required" });
  }

  try {
    const result = getErpTableColumns(tableId);
    res.json(result);
  } catch (error: unknown) {
    console.error("ERP table error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load table columns";
    res.status(500).json({ error: message });
  }
}
