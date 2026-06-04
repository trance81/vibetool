import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getExchangeRate } from "../../lib/exchange-service";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const from = String(req.query.from ?? "").toUpperCase();
  const to = String(req.query.to ?? "").toUpperCase();

  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }

  try {
    const result = await getExchangeRate(from, to);
    res.json({
      amount: 1,
      base: from,
      date: result.date,
      rates: { [to]: result.rate },
      source: result.source,
    });
  } catch (error: unknown) {
    console.error("Exchange rate error:", error);
    res.status(502).json({ error: "Failed to fetch exchange rate" });
  }
}
