import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { getCurrencies, getExchangeRate } from "./lib/exchange-service";
import {
  clearErpDatasetCache,
  getErpDatasetMeta,
  getErpModuleCodes,
  getErpTableColumns,
  parseModulesFilter,
  searchErpColumns,
} from "./lib/erp-column-service";

async function startServer() {
  clearErpDatasetCache();

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

  app.get("/api/erp-columns/meta", (_req, res) => {
    try {
      res.json(getErpDatasetMeta(process.cwd()));
    } catch (error: unknown) {
      console.error("ERP meta error:", error);
      res.status(500).json({ error: "Failed to load ERP column metadata" });
    }
  });

  app.get("/api/erp-columns/modules", (_req, res) => {
    try {
      res.json({ modules: getErpModuleCodes(process.cwd()) });
    } catch (error: unknown) {
      console.error("ERP modules error:", error);
      res.status(500).json({ error: "Failed to load ERP modules" });
    }
  });

  app.get("/api/erp-columns/search", (req, res) => {
    const q = String(req.query.q ?? "");
    const limit = Math.min(
      500,
      Math.max(1, parseInt(String(req.query.limit ?? "200"), 10) || 200),
    );
    if (!q.trim()) {
      return res.status(400).json({ error: "q is required" });
    }
    try {
      const modules = parseModulesFilter(
        req.query.modules as string | string[] | undefined,
      );
      const rows = searchErpColumns(q, process.cwd(), limit, modules);
      res.json({ rows, count: rows.length, limit });
    } catch (error: unknown) {
      console.error("ERP search error:", error);
      res.status(500).json({ error: "Failed to search ERP columns" });
    }
  });

  app.get("/api/erp-columns/table", (req, res) => {
    const tableId = String(req.query.tableId ?? "").trim();
    if (!tableId) {
      return res.status(400).json({ error: "tableId is required" });
    }
    try {
      res.json(getErpTableColumns(tableId, process.cwd()));
    } catch (error: unknown) {
      console.error("ERP table error:", error);
      res.status(500).json({ error: "Failed to load table columns" });
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
