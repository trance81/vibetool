import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { getCurrencies, getExchangeRate } from "./lib/exchange-service";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/shorten", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      // Using is.gd API which is simple and doesn't require a key
      const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
      res.json({ shorturl: response.data.shorturl });
    } catch (error: any) {
      console.error("Shorten error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to shorten URL" });
    }
  });

  app.get("/api/exchange/rates", async (req, res) => {
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
  });

  app.get("/api/exchange/currencies", async (_req, res) => {
    try {
      const currencies = await getCurrencies();
      res.json(currencies);
    } catch (error: unknown) {
      console.error("Exchange currencies error:", error);
      res.status(502).json({ error: "Failed to fetch currencies" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
