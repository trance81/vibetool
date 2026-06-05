import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getErpDatasetMeta } from "../../lib/erp-column-service";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    res.json(getErpDatasetMeta());
  } catch (error: unknown) {
    console.error("ERP meta error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load ERP column metadata";
    res.status(500).json({ error: message });
  }
}
