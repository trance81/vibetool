import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getErpModuleCodes } from "../../lib/erp-column-service";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    res.json({ modules: getErpModuleCodes(process.cwd()) });
  } catch (error: unknown) {
    console.error("ERP modules error:", error);
    res.status(500).json({ error: "Failed to load ERP modules" });
  }
}
