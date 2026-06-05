import fs from "node:fs";
import path from "node:path";

export type ErpColumnRow = {
  moduleCd: string;
  colNm: string;
  colKorNm: string;
  formatDc: string;
  colsizeVr: string;
  rcodeDc: string;
  keyValYn: string;
  colSq: string;
  tableId: string;
  tableNm: string;
};

export type ErpDatasetMeta = {
  filename: string;
  timestamp: string;
  timestampLabel: string;
  rowCount: number;
  modules: string[];
};

type ErpDataset = {
  meta: ErpDatasetMeta;
  rows: ErpColumnRow[];
};

const CSV_PATTERN = /^ERP_컬럼정보_(\d+)\.csv$/i;

let cached: ErpDataset | null = null;

function stripQuotes(field: string): string {
  const t = field.trim();
  if (t.startsWith('"') && t.endsWith('"')) {
    return t.slice(1, -1).replace(/""/g, '"');
  }
  return t;
}

/** ERP CSV: 10 columns (MODULE_CD … TABLE_NM). Extra columns are ignored. */
export function parseCsvLine(line: string): ErpColumnRow | null {
  if (!line.trim()) return null;
  const parts = line.split("|").map(stripQuotes);
  if (parts.length < 10) return null;
  const [
    moduleCd,
    colNm,
    colKorNm,
    formatDc,
    colsizeVr,
    rcodeDc,
    keyValYn,
    colSq,
    tableId,
    tableNm,
  ] = parts;
  if (colNm === "COL_NM" || moduleCd === "MODULE_CD") return null;
  return {
    moduleCd,
    colNm,
    colKorNm,
    formatDc,
    colsizeVr,
    rcodeDc,
    keyValYn,
    colSq,
    tableId,
    tableNm,
  };
}

export function formatTimestamp(ts: string): string {
  if (ts.length !== 12) return ts;
  const y = ts.slice(0, 4);
  const m = ts.slice(4, 6);
  const d = ts.slice(6, 8);
  const h = ts.slice(8, 10);
  const min = ts.slice(10, 12);
  return `${y}-${m}-${d} ${h}:${min}`;
}

/** Resolve project root (local dev vs Vercel serverless cwd). */
export function resolveProjectRoot(): string {
  const candidates = [
    process.cwd(),
    path.join(process.cwd(), ".."),
    path.join(process.cwd(), "../.."),
  ];
  for (const root of candidates) {
    if (findLatestErpCsvFile(root)) return root;
  }
  return process.cwd();
}

export function findLatestErpCsvFile(rootDir: string): {
  filePath: string;
  filename: string;
  timestamp: string;
} | null {
  const dir = path.join(rootDir, "src", "Files");
  if (!fs.existsSync(dir)) return null;

  let best: { filePath: string; filename: string; timestamp: string } | null =
    null;

  for (const name of fs.readdirSync(dir)) {
    const match = name.match(CSV_PATTERN);
    if (!match) continue;
    const timestamp = match[1];
    if (!best || timestamp > best.timestamp) {
      best = {
        filePath: path.join(dir, name),
        filename: name,
        timestamp,
      };
    }
  }

  return best;
}

function loadDataset(rootDir: string): ErpDataset {
  const latest = findLatestErpCsvFile(rootDir);
  if (!latest) {
    throw new Error("ERP column CSV not found in src/Files");
  }

  if (
    cached &&
    cached.meta.filename === latest.filename &&
    cached.rows.length > 0
  ) {
    if (!cached.meta.modules?.length) {
      cached.meta.modules = collectModuleCodes(cached.rows);
    }
    return cached;
  }

  const raw = fs.readFileSync(latest.filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const rows: ErpColumnRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row) rows.push(row);
  }

  cached = {
    meta: {
      filename: latest.filename,
      timestamp: latest.timestamp,
      timestampLabel: formatTimestamp(latest.timestamp),
      rowCount: rows.length,
      modules: collectModuleCodes(rows),
    },
    rows,
  };

  return cached;
}

/** Lightweight CSV scan for meta/modules (avoids building full row cache). */
function scanCsvMeta(
  filePath: string,
  filename: string,
  timestamp: string,
): ErpDatasetMeta {
  const raw = fs.readFileSync(filePath, "utf8");
  const modules = new Set<string>();
  let rowCount = 0;

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const parts = line.split("|");
    if (parts.length < 10) continue;
    const moduleCd = stripQuotes(parts[0]);
    const colNm = stripQuotes(parts[1]);
    if (colNm === "COL_NM" || moduleCd === "MODULE_CD") continue;
    rowCount++;
    const m = moduleCd.trim();
    if (m) modules.add(m);
  }

  return {
    filename,
    timestamp,
    timestampLabel: formatTimestamp(timestamp),
    rowCount,
    modules: [...modules].sort((a, b) => a.localeCompare(b)),
  };
}

function collectModuleCodes(rows: ErpColumnRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    const m = r.moduleCd?.trim();
    if (m) set.add(m);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getErpDatasetMeta(
  rootDir: string = resolveProjectRoot(),
): ErpDatasetMeta {
  if (cached && cached.rows.length > 0) {
    return { ...cached.meta, modules: collectModuleCodes(cached.rows) };
  }
  const latest = findLatestErpCsvFile(rootDir);
  if (!latest) {
    throw new Error("ERP column CSV not found in src/Files");
  }
  return scanCsvMeta(latest.filePath, latest.filename, latest.timestamp);
}

export function getErpModuleCodes(
  rootDir: string = resolveProjectRoot(),
): string[] {
  return getErpDatasetMeta(rootDir).modules;
}

export function parseModulesFilter(
  raw: string | string[] | undefined,
): Set<string> | null {
  if (raw == null) return null;
  const parts = Array.isArray(raw)
    ? raw.flatMap((v) => String(v).split(","))
    : String(raw).split(",");
  const codes = parts.map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (codes.length === 0) return null;
  return new Set(codes);
}

export function searchErpColumns(
  query: string,
  rootDir?: string,
  limit = 200,
  modulesFilter: Set<string> | null = null,
): ErpColumnRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const { rows } = loadDataset(rootDir ?? resolveProjectRoot());
  const out: ErpColumnRow[] = [];

  for (let i = 0; i < rows.length && out.length < limit; i++) {
    const r = rows[i];
    if (
      modulesFilter &&
      modulesFilter.size > 0 &&
      !modulesFilter.has(r.moduleCd.trim().toUpperCase())
    ) {
      continue;
    }
    if (
      r.colNm.toLowerCase().includes(q) ||
      r.tableId.toLowerCase().includes(q) ||
      r.tableNm.toLowerCase().includes(q) ||
      r.colKorNm.toLowerCase().includes(q) ||
      r.moduleCd.toLowerCase().includes(q)
    ) {
      out.push(r);
    }
  }

  return out;
}

export function getErpTableColumns(
  tableId: string,
  rootDir: string = resolveProjectRoot(),
): { tableId: string; tableNm: string; rows: ErpColumnRow[] } {
  const id = tableId.trim().toUpperCase();
  const { rows } = loadDataset(rootDir);
  const matched = rows.filter((r) => r.tableId.toUpperCase() === id);
  const tableNm = matched[0]?.tableNm ?? "";
  return { tableId: id, tableNm, rows: matched };
}

/** Test-only: clear in-memory cache after CSV swap */
export function clearErpDatasetCache(): void {
  cached = null;
}
