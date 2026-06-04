import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCurrencies } from "../../lib/exchange-service";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const currencies = await getCurrencies();
    res.json(currencies);
  } catch (error: unknown) {
    console.error("Exchange currencies error:", error);
    res.status(502).json({ error: "Failed to fetch currencies" });
  }
}
