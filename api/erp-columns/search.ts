import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  parseModulesFilter,
  searchErpColumns,
} from "../../lib/erp-column-service";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = String(req.query.q ?? "");
  const limit = Math.min(
    500,
    Math.max(1, parseInt(String(req.query.limit ?? "200"), 10) || 200),
  );

  if (!q.trim()) {
    return res.status(400).json({ error: "q is required" });
  }

  try {
    const modules = parseModulesFilter(req.query.modules);
    const rows = searchErpColumns(q, process.cwd(), limit, modules);
    res.json({ rows, count: rows.length, limit });
  } catch (error: unknown) {
    console.error("ERP search error:", error);
    res.status(500).json({ error: "Failed to search ERP columns" });
  }
}
